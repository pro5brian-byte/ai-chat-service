import { z } from "zod";
import { eq, gte, lte, and, count, desc } from "drizzle-orm";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { chatSessions, knowledgeBase } from "@db/schema";

export const statsRouter = createRouter({
  // 获取仪表盘统计数据（需要管理员权限）
  getDashboardStats: adminQuery
    .input(
      z.object({
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days || 30;

      // 总对话数
      const totalResult = await db.select({ count: count() })
        .from(chatSessions);
      const totalConversations = totalResult[0]?.count || 0;

      // 今日对话数
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayResult = await db.select({ count: count() })
        .from(chatSessions)
        .where(gte(chatSessions.createdAt, today));
      const todayConversations = todayResult[0]?.count || 0;

      // 昨日对话数（用于计算环比）
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(today);
      const yesterdayResult = await db.select({ count: count() })
        .from(chatSessions)
        .where(
          and(
            gte(chatSessions.createdAt, yesterday),
            lte(chatSessions.createdAt, yesterdayEnd)
          )
        );
      const yesterdayConversations = yesterdayResult[0]?.count || 0;

      // AI解决率
      const resolvedResult = await db.select({ count: count() })
        .from(chatSessions)
        .where(eq(chatSessions.aiResolved, "yes"));
      const totalResolved = resolvedResult[0]?.count || 0;
      const aiResolutionRate = totalConversations > 0 
        ? Math.round((totalResolved / totalConversations) * 1000) / 10 
        : 0;

      // 上周AI解决率
      const lastWeekStart = new Date();
      lastWeekStart.setDate(lastWeekStart.getDate() - 14);
      const lastWeekEnd = new Date();
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
      const lastWeekTotalResult = await db.select({ count: count() })
        .from(chatSessions)
        .where(
          and(
            gte(chatSessions.createdAt, lastWeekStart),
            lte(chatSessions.createdAt, lastWeekEnd)
          )
        );
      const lastWeekTotal = lastWeekTotalResult[0]?.count || 0;
      const lastWeekResolvedResult = await db.select({ count: count() })
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.aiResolved, "yes"),
            gte(chatSessions.createdAt, lastWeekStart),
            lte(chatSessions.createdAt, lastWeekEnd)
          )
        );
      const lastWeekResolved = lastWeekResolvedResult[0]?.count || 0;
      const lastWeekRate = lastWeekTotal > 0 
        ? Math.round((lastWeekResolved / lastWeekTotal) * 1000) / 10 
        : 0;

      // 计算平均响应时间（模拟数据）
      const avgResponseTime = 1.2;

      // 趋势数据 - 近30天每日对话数
      const dailyStats = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayResult = await db.select({ count: count() })
          .from(chatSessions)
          .where(
            and(
              gte(chatSessions.createdAt, date),
              lte(chatSessions.createdAt, nextDate)
            )
          );

        dailyStats.push({
          date: date.toISOString().split("T")[0],
          count: dayResult[0]?.count || 0,
        });
      }

      // 来源分布
      const sourceResult = await db.select({
        source: chatSessions.source,
        count: count(),
      })
        .from(chatSessions)
        .groupBy(chatSessions.source);

      // 最近对话
      const recentSessions = await db.select()
        .from(chatSessions)
        .orderBy(desc(chatSessions.createdAt))
        .limit(5);

      // 知识库统计
      const kbResult = await db.select({ count: count() })
        .from(knowledgeBase)
        .where(eq(knowledgeBase.isActive, "yes"));

      return {
        overview: {
          totalConversations,
          todayConversations,
          todayChange: yesterdayConversations > 0 
            ? Math.round(((todayConversations - yesterdayConversations) / yesterdayConversations) * 1000) / 10 
            : 0,
          aiResolutionRate,
          aiResolutionChange: lastWeekRate > 0 
            ? Math.round((aiResolutionRate - lastWeekRate) * 10) / 10 
            : 0,
          avgResponseTime,
          knowledgeCount: kbResult[0]?.count || 0,
        },
        dailyTrend: dailyStats,
        sourceDistribution: sourceResult.map(r => ({
          name: r.source || "未知",
          value: r.count,
        })),
        recentSessions,
      };
    }),

  // 获取对话趋势数据（需要管理员权限）
  getConversationTrend: adminQuery
    .input(
      z.object({
        days: z.number().default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const days = input?.days || 30;
      const dailyStats = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayResult = await db.select({ count: count() })
          .from(chatSessions)
          .where(
            and(
              gte(chatSessions.createdAt, date),
              lte(chatSessions.createdAt, nextDate)
            )
          );

        dailyStats.push({
          date: date.toISOString().split("T")[0],
          count: dayResult[0]?.count || 0,
        });
      }

      return dailyStats;
    }),
});
