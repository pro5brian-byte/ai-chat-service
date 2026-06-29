import { z } from "zod";
import { eq, desc, like, and, count } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { knowledgeBase, knowledgeCategories } from "@db/schema";

export const knowledgeRouter = createRouter({
  // 获取所有分类（公共API）
  listCategories: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(knowledgeCategories).orderBy(knowledgeCategories.sortOrder);
  }),

  // 创建分类（需要管理员权限）
  createCategory: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(knowledgeCategories).values({
        name: input.name,
        description: input.description,
        sortOrder: input.sortOrder,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  // 更新分类（需要管理员权限）
  updateCategory: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(knowledgeCategories)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(knowledgeCategories.id, id));
      return { success: true };
    }),

  // 删除分类（需要管理员权限）
  deleteCategory: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(knowledgeCategories)
        .where(eq(knowledgeCategories.id, input.id));
      return { success: true };
    }),

  // 获取知识条目列表（公共API）
  listKnowledge: publicQuery
    .input(
      z.object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { limit: 50, offset: 0 };

      const conditions = [];
      if (params.categoryId) {
        conditions.push(eq(knowledgeBase.categoryId, params.categoryId));
      }
      if (params.search) {
        conditions.push(
          like(knowledgeBase.question, `%${params.search}%`)
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.select()
        .from(knowledgeBase)
        .where(where)
        .orderBy(desc(knowledgeBase.createdAt))
        .limit(params.limit || 50)
        .offset(params.offset || 0);

      const totalResult = await db.select({ count: count() })
        .from(knowledgeBase)
        .where(where);

      return {
        items,
        total: totalResult[0]?.count || 0,
      };
    }),

  // 获取单个知识条目（公共API）
  getKnowledge: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.knowledgeBase.findFirst({
        where: eq(knowledgeBase.id, input.id),
      });
    }),

  // 创建知识条目（需要管理员权限）
  createKnowledge: adminQuery
    .input(
      z.object({
        question: z.string().min(1).max(500),
        answer: z.string().min(1),
        categoryId: z.number().optional(),
        keywords: z.string().optional(),
        isActive: z.enum(["yes", "no"]).default("yes"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(knowledgeBase).values({
        question: input.question,
        answer: input.answer,
        categoryId: input.categoryId,
        keywords: input.keywords,
        isActive: input.isActive,
      });
      return { id: Number(result[0].insertId), ...input };
    }),

  // 更新知识条目（需要管理员权限）
  updateKnowledge: adminQuery
    .input(
      z.object({
        id: z.number(),
        question: z.string().min(1).max(500).optional(),
        answer: z.string().min(1).optional(),
        categoryId: z.number().optional(),
        keywords: z.string().optional(),
        isActive: z.enum(["yes", "no"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(knowledgeBase)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(knowledgeBase.id, id));
      return { success: true };
    }),

  // 删除知识条目（需要管理员权限）
  deleteKnowledge: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(knowledgeBase).where(eq(knowledgeBase.id, input.id));
      return { success: true };
    }),

  // 搜索知识条目（公共API - 用于AI匹配）
  searchKnowledge: publicQuery
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db.select()
        .from(knowledgeBase)
        .where(
          and(
            eq(knowledgeBase.isActive, "yes"),
            like(knowledgeBase.question, `%${input.query}%`)
          )
        )
        .limit(5);
      return items;
    }),
});
