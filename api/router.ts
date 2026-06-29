import { authRouter } from "./auth-router";
import { chatRouter } from "./chat-router";
import { knowledgeRouter } from "./knowledge-router";
import { settingsRouter } from "./settings-router";
import { statsRouter } from "./stats-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  chat: chatRouter,
  knowledge: knowledgeRouter,
  settings: settingsRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
