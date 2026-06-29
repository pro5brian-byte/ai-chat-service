import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { aiSettings, systemSettings } from "@db/schema";

export const settingsRouter = createRouter({
  // ========== AI 设置 ==========

  // 获取AI设置（公共API）
  getAiSettings: publicQuery.query(async () => {
    const db = getDb();
    const settingsList = await db.select().from(aiSettings).limit(1);
    if (settingsList.length === 0) {
      // 创建设置
      await db.insert(aiSettings).values({});
      return db.select().from(aiSettings).limit(1).then(r => r[0]);
    }
    return settingsList[0];
  }),

  // 更新AI设置（需要管理员权限）
  updateAiSettings: adminQuery
    .input(
      z.object({
        aiName: z.string().max(100).optional(),
        welcomeMessage: z.string().max(1000).optional(),
        transferKeywords: z.string().max(500).optional(),
        temperature: z.number().min(0).max(1).optional(),
        maxResponseLength: z.number().min(50).max(500).optional(),
        responseLanguage: z.string().max(20).optional(),
        matchThreshold: z.number().min(0).max(1).optional(),
        unknownReplyTemplate: z.string().max(1000).optional(),
        autoEndMinutes: z.number().min(5).max(120).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const settingsList = await db.select().from(aiSettings).limit(1);
      
      if (settingsList.length === 0) {
        await db.insert(aiSettings).values({
          ...input,
          updatedAt: new Date(),
        });
      } else {
        await db.update(aiSettings)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(aiSettings.id, settingsList[0].id));
      }
      
      return { success: true };
    }),

  // ========== 系统设置 ==========

  // 获取系统设置（公共API）
  getSystemSettings: publicQuery.query(async () => {
    const db = getDb();
    const settingsList = await db.select().from(systemSettings).limit(1);
    if (settingsList.length === 0) {
      await db.insert(systemSettings).values({});
      return db.select().from(systemSettings).limit(1).then(r => r[0]);
    }
    return settingsList[0];
  }),

  // 更新系统设置（需要管理员权限）
  updateSystemSettings: adminQuery
    .input(
      z.object({
        siteName: z.string().max(255).optional(),
        siteLogo: z.string().optional(),
        workStartTime: z.string().max(10).optional(),
        workEndTime: z.string().max(10).optional(),
        timezone: z.string().max(50).optional(),
        themeColor: z.string().max(20).optional(),
        chatPosition: z.enum(["left", "right"]).optional(),
        chatWindowSize: z.enum(["compact", "standard", "large"]).optional(),
        notifyNewChat: z.enum(["yes", "no"]).optional(),
        notifyHumanTransfer: z.enum(["yes", "no"]).optional(),
        notifyMethod: z.enum(["email", "in_app", "both"]).optional(),
        notifyEmail: z.string().max(320).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const settingsList = await db.select().from(systemSettings).limit(1);
      
      if (settingsList.length === 0) {
        await db.insert(systemSettings).values({
          ...input,
          updatedAt: new Date(),
        });
      } else {
        await db.update(systemSettings)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(systemSettings.id, settingsList[0].id));
      }
      
      return { success: true };
    }),
});
