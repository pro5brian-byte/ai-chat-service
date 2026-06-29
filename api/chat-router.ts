import { z } from "zod";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatSessions, chatMessages, aiSettings, knowledgeBase } from "@db/schema";

// 生成访客ID
function generateVisitorId() {
  return "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// 调用 Kimi API 生成回复
async function callKimiAPI(
  message: string,
  knowledgeContext: string,
  settings: typeof aiSettings.$inferSelect | undefined
) {
  try {
    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      throw new Error("KIMI_API_KEY not configured");
    }

    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: `你是企业的智能客服助手。请严格根据以下知识库内容回答客户问题。

重要规则：
1. 如果客户的问题在知识库中有明确答案，请直接基于知识库内容回答
2. 如果知识库中没有相关信息，请礼貌地告知客户你无法回答，并建议联系人工客服
3. 保持友好、专业的语气
4. 回答简洁明了，不要太长
5. 不要编造知识库中没有的信息

知识库内容：
${knowledgeContext || "暂无知识库内容"}`,
          },
          { role: "user", content: message },
        ],
        temperature: settings?.temperature ?? 0.7,
        max_tokens: Math.min(settings?.maxResponseLength ?? 200, 500),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Kimi API error:", response.status, errorText);
      throw new Error(`Kimi API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    return { response: content, fromKimi: true };
  } catch (error) {
    console.error("Kimi API call failed:", error);
    return { response: null, fromKimi: false };
  }
}

// AI回复生成 - 知识库匹配 + Kimi API兜底
async function generateAIResponse(
  message: string,
  _settings: typeof aiSettings.$inferSelect | undefined
) {
  const db = getDb();
  const allKnowledge = await db
    .select()
    .from(knowledgeBase)
    .where(eq(knowledgeBase.isActive, "yes"));

  const settings = _settings;

  // 第一步：知识库关键词匹配
  const lowerMsg = message.toLowerCase();
  let bestMatch: (typeof knowledgeBase.$inferSelect) | null = null;
  let bestScore = 0;

  for (const item of allKnowledge) {
    const question = item.question.toLowerCase();
    const keywords = (item.keywords || "").toLowerCase().split(",").filter(Boolean);
    let score = 0;

    if (question.includes(lowerMsg)) score += 3;
    if (lowerMsg.includes(question)) score += 2;
    for (const kw of keywords) {
      if (lowerMsg.includes(kw.trim())) score += 1;
    }
    const msgWords = lowerMsg.split(/\s+/);
    const qWords = question.split(/\s+/);
    const overlap = msgWords.filter((w) => qWords.includes(w)).length;
    score += overlap * 0.5;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  // 匹配度高 → 直接返回知识库答案（准确+省钱）
  const threshold = settings?.matchThreshold ?? 0.6;
  if (bestMatch && bestScore >= threshold) {
    return {
      response: bestMatch.answer,
      matched: true,
      knowledgeId: bestMatch.id,
    };
  }

  // 第二步：没匹配到 → 调用 Kimi API
  const knowledgeContext = allKnowledge
    .slice(0, 15)
    .map((k) => `【问题】${k.question}\n【答案】${k.answer}`)
    .join("\n\n");

  const kimiResult = await callKimiAPI(message, knowledgeContext, settings);

  if (kimiResult.response) {
    return {
      response: kimiResult.response,
      matched: false,
      knowledgeId: null,
    };
  }

  // 第三步：Kimi 也失败 → 兜底回复
  return {
    response:
      settings?.unknownReplyTemplate ??
      "抱歉，我暂时无法回答这个问题，建议您联系人工客服。",
    matched: false,
    knowledgeId: null,
  };
}

export const chatRouter = createRouter({
  // 访客发送消息（公共API）
  sendMessage: publicQuery
    .input(
      z.object({
        visitorId: z.string().optional(),
        message: z.string().min(1).max(2000),
        source: z.string().default("首页"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const visitorId = input.visitorId || generateVisitorId();
      
      // 查找或创建会话
      let session = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.visitorId, visitorId),
          sql`${chatSessions.status} IN ('active', 'pending_human', 'human_handling')`
        ),
        orderBy: [desc(chatSessions.createdAt)],
      });
      
      if (!session) {
        const result = await db.insert(chatSessions).values({
          visitorId,
          visitorName: `访客 #${visitorId.slice(-4)}`,
          source: input.source,
          status: "active",
          messageCount: 0,
        });
        const insertId = Number(result[0].insertId);
        session = await db.query.chatSessions.findFirst({
          where: eq(chatSessions.id, insertId),
        });
      }
      
      if (!session) throw new Error("Failed to create session");
      
      // 保存访客消息
      await db.insert(chatMessages).values({
        sessionId: session.id,
        sender: "visitor",
        content: input.message,
      });
      
      // 更新消息数
      await db.update(chatSessions)
        .set({ messageCount: (session.messageCount || 0) + 1, updatedAt: new Date() })
        .where(eq(chatSessions.id, session.id));
      
      // 获取AI设置
      const settingsList = await db.select().from(aiSettings).limit(1);
      const settings = settingsList[0];
      
      // 检查是否触发转人工
      const transferKeywords = (settings?.transferKeywords || "人工,客服,转人工").split(",");
      const shouldTransfer = transferKeywords.some(kw => input.message.includes(kw.trim()));
      
      if (shouldTransfer) {
        await db.update(chatSessions)
          .set({ status: "pending_human", updatedAt: new Date() })
          .where(eq(chatSessions.id, session.id));
        
        await db.insert(chatMessages).values({
          sessionId: session.id,
          sender: "ai",
          content: "您好，正在为您转接人工客服，请稍候...",
          metadata: { type: "transfer" },
        });
        
        return {
          visitorId,
          sessionId: session.id,
          aiResponse: "您好，正在为您转接人工客服，请稍候...",
          status: "pending_human",
        };
      }
      
      // 生成AI回复
      const aiResult = await generateAIResponse(input.message, settings);
      
      await db.insert(chatMessages).values({
        sessionId: session.id,
        sender: "ai",
        content: aiResult.response,
        metadata: { matched: aiResult.matched, knowledgeId: aiResult.knowledgeId },
      });
      
      await db.update(chatSessions)
        .set({ 
          messageCount: (session.messageCount || 0) + 2, 
          aiResolved: aiResult.matched ? "yes" as const : "unknown" as const,
          updatedAt: new Date() 
        })
        .where(eq(chatSessions.id, session.id));
      
      return {
        visitorId,
        sessionId: session.id,
        aiResponse: aiResult.response,
        status: session.status,
      };
    }),

  // 获取访客会话消息（公共API）
  getSessionMessages: publicQuery
    .input(z.object({ visitorId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const session = await db.query.chatSessions.findFirst({
        where: and(
          eq(chatSessions.visitorId, input.visitorId),
          sql`${chatSessions.status} IN ('active', 'pending_human', 'human_handling')`
        ),
        orderBy: [desc(chatSessions.createdAt)],
      });
      
      if (!session) return { session: null, messages: [] };
      
      const messages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, session.id))
        .orderBy(chatMessages.createdAt);
      
      return { session, messages };
    }),

  // 获取欢迎语（公共API）
  getWelcomeMessage: publicQuery.query(async () => {
    const db = getDb();
    const settingsList = await db.select().from(aiSettings).limit(1);
    const settings = settingsList[0];
    return {
      aiName: settings?.aiName || "智能客服",
      welcomeMessage: settings?.welcomeMessage || "您好！我是您的智能客服助手，有什么可以帮助您的吗？",
    };
  }),

  // 开始新会话（公共API）
  startNewSession: publicQuery
    .input(z.object({ visitorId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // 结束旧会话
      await db.update(chatSessions)
        .set({ status: "ended", endedAt: new Date() })
        .where(eq(chatSessions.visitorId, input.visitorId));
      
      const newVisitorId = generateVisitorId();
      const settingsList = await db.select().from(aiSettings).limit(1);
      const settings = settingsList[0];
      
      return {
        visitorId: newVisitorId,
        aiName: settings?.aiName || "智能客服",
        welcomeMessage: settings?.welcomeMessage || "您好！我是您的智能客服助手，有什么可以帮助您的吗？",
      };
    }),

  // ========== 管理后台 API ==========

  // 获取会话列表（需要管理员权限）
  listSessions: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { limit: 50, offset: 0 };
      
      const conditions = [];
      if (params.status && params.status !== "all") {
        conditions.push(eq(chatSessions.status, params.status as "active" | "ended" | "pending_human" | "human_handling"));
      }
      if (params.startDate) {
        conditions.push(gte(chatSessions.createdAt, new Date(params.startDate)));
      }
      if (params.endDate) {
        conditions.push(lte(chatSessions.createdAt, new Date(params.endDate)));
      }
      
      const where = conditions.length > 0 ? and(...conditions) : undefined;
      
      const sessions = await db.select()
        .from(chatSessions)
        .where(where)
        .orderBy(desc(chatSessions.createdAt))
        .limit(params.limit || 50)
        .offset(params.offset || 0);
      
      const totalResult = await db.select({ count: count() })
        .from(chatSessions)
        .where(where);
      
      // 搜索过滤
      let filteredSessions = sessions;
      if (params.search) {
        const search = params.search.toLowerCase();
        const sessionIds = sessions.map(s => s.id);
        if (sessionIds.length > 0) {
          const msgs = await db.select()
            .from(chatMessages)
            .where(sql`${chatMessages.sessionId} IN (${sessionIds.join(",")})`);
          
          const matchingSessionIds = new Set(
            msgs.filter(m => m.content.toLowerCase().includes(search)).map(m => m.sessionId)
          );
          
          filteredSessions = sessions.filter(s => 
            matchingSessionIds.has(s.id) ||
            (s.visitorName || "").toLowerCase().includes(search) ||
            (s.visitorId || "").toLowerCase().includes(search)
          );
        }
      }
      
      return {
        sessions: filteredSessions,
        total: totalResult[0]?.count || 0,
      };
    }),

  // 获取会话详情（需要管理员权限）
  getSessionDetail: adminQuery
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      const session = await db.query.chatSessions.findFirst({
        where: eq(chatSessions.id, input.sessionId),
      });
      
      if (!session) throw new Error("Session not found");
      
      const messages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, input.sessionId))
        .orderBy(chatMessages.createdAt);
      
      return { session, messages };
    }),

  // 管理员回复消息（需要管理员权限）
  adminReply: adminQuery
    .input(
      z.object({
        sessionId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        sender: "human",
        content: input.content,
        metadata: { adminId: ctx.user?.id, adminName: ctx.user?.name },
      });
      
      await db.update(chatSessions)
        .set({ status: "human_handling", updatedAt: new Date() })
        .where(eq(chatSessions.id, input.sessionId));
      
      return { success: true };
    }),

  // 结束会话（需要管理员权限）
  endSession: adminQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      
      await db.update(chatSessions)
        .set({ status: "ended", endedAt: new Date(), updatedAt: new Date() })
        .where(eq(chatSessions.id, input.sessionId));
      
      return { success: true };
    }),

  // 更新会话满意度
  rateSession: publicQuery
    .input(
      z.object({
        sessionId: z.number(),
        satisfaction: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      await db.update(chatSessions)
        .set({ satisfaction: input.satisfaction, updatedAt: new Date() })
        .where(eq(chatSessions.id, input.sessionId));
      
      return { success: true };
    }),

  // 接管会话（需要管理员权限）
  takeOver: adminQuery
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      
      await db.update(chatSessions)
        .set({ 
          status: "human_handling", 
          assignedTo: ctx.user?.id,
          updatedAt: new Date() 
        })
        .where(eq(chatSessions.id, input.sessionId));
      
      await db.insert(chatMessages).values({
        sessionId: input.sessionId,
        sender: "human",
        content: `您好，我是人工客服 ${ctx.user?.name || ""}，很高兴为您服务。`,
        metadata: { type: "takeover", adminId: ctx.user?.id, adminName: ctx.user?.name },
      });
      
      return { success: true };
    }),
});
