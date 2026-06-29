import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

// 用户表 (已存在，OAuth 认证用)
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 聊天会话表
export const chatSessions = mysqlTable("chat_sessions", {
  id: serial("id").primaryKey(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  visitorName: varchar("visitor_name", { length: 255 }).default("访客"),
  source: varchar("source", { length: 255 }).default("首页"),
  device: varchar("device", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 64 }),
  status: mysqlEnum("status", ["active", "ended", "pending_human", "human_handling"])
    .default("active")
    .notNull(),
  satisfaction: int("satisfaction"),
  messageCount: int("message_count").default(0),
  aiResolved: mysqlEnum("ai_resolved", ["yes", "no", "unknown"]).default("unknown"),
  assignedTo: bigint("assigned_to", { mode: "number", unsigned: true }),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// 聊天消息表
export const chatMessages = mysqlTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: bigint("session_id", { mode: "number", unsigned: true }).notNull(),
  sender: mysqlEnum("sender", ["visitor", "ai", "human"]).notNull(),
  content: text("content").notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// 知识库分类表
export const knowledgeCategories = mysqlTable("knowledge_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type KnowledgeCategory = typeof knowledgeCategories.$inferSelect;
export type InsertKnowledgeCategory = typeof knowledgeCategories.$inferInsert;

// 知识库条目表
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: serial("id").primaryKey(),
  categoryId: bigint("category_id", { mode: "number", unsigned: true }),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  keywords: varchar("keywords", { length: 500 }),
  hitCount: int("hit_count").default(0),
  isActive: mysqlEnum("is_active", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

// AI 设置表
export const aiSettings = mysqlTable("ai_settings", {
  id: serial("id").primaryKey(),
  aiName: varchar("ai_name", { length: 100 }).default("智能客服"),
  welcomeMessage: varchar("welcome_message", { length: 1000 })
    .default("您好！我是您的智能客服助手，有什么可以帮助您的吗？"),
  transferKeywords: varchar("transfer_keywords", { length: 500 })
    .default("人工,客服,转人工,人工客服"),
  temperature: float("temperature").default(0.7),
  maxResponseLength: int("max_response_length").default(200),
  responseLanguage: varchar("response_language", { length: 20 }).default("auto"),
  matchThreshold: float("match_threshold").default(0.6),
  unknownReplyTemplate: varchar("unknown_reply_template", { length: 1000 })
    .default("抱歉，我暂时无法回答这个问题，建议您联系人工客服。"),
  autoEndMinutes: int("auto_end_minutes").default(30),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AiSetting = typeof aiSettings.$inferSelect;
export type InsertAiSetting = typeof aiSettings.$inferInsert;

// 系统设置表
export const systemSettings = mysqlTable("system_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).default("AI智能客服系统"),
  siteLogo: text("site_logo"),
  workStartTime: varchar("work_start_time", { length: 10 }).default("09:00"),
  workEndTime: varchar("work_end_time", { length: 10 }).default("18:00"),
  timezone: varchar("timezone", { length: 50 }).default("Asia/Shanghai"),
  themeColor: varchar("theme_color", { length: 20 }).default("#4f46e5"),
  chatPosition: mysqlEnum("chat_position", ["left", "right"]).default("right"),
  chatWindowSize: mysqlEnum("chat_window_size", ["compact", "standard", "large"])
    .default("standard"),
  notifyNewChat: mysqlEnum("notify_new_chat", ["yes", "no"]).default("yes"),
  notifyHumanTransfer: mysqlEnum("notify_human_transfer", ["yes", "no"]).default("yes"),
  notifyMethod: mysqlEnum("notify_method", ["email", "in_app", "both"]).default("in_app"),
  notifyEmail: varchar("notify_email", { length: 320 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
