# 影月影视 AI智能客服系统

> 最后更新：2026-07-01 | 当前版本：v4.5.4

---

## 访问地址

| 项目 | 地址 |
|------|------|
| 客服组件（v40） | `https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js?v=40` |
| 管理后台 | `https://pro5brian-byte.github.io/ai-chat-service/admin.html` |

---

## 凡科嵌入代码

```html
<!-- 影月影视 AI智能客服 v4.5 -->
<script src="https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js?v=40" async></script>
<style>
#ai-chat-btn { font-size: 0 !important; width: auto !important; padding: 12px 24px !important; border-radius: 24px !important; }
#ai-chat-btn::before { content: "💬 在线客服"; font-size: 14px; }
</style>
```

---

## 核心配置

| 项目 | 配置值 |
|------|--------|
| 飞书Webhook | `https://open.feishu.cn/open-apis/bot/v2/hook/c0ff22f2-bd84-411f-a969-d4797c8b5369` |
| 收件邮箱 | `908159172@qq.com` |
| AI服务商 | Moonshot（Kimi） / moonshot-v1-8k |
| 数据存储 | Supabase |
| 客服名称 | 在线客服小影 |
| 导演微信 | 18621893879 |

---

## 功能说明

- AI自动回复（基于知识库 + Moonshot AI）
- 飞书通知（客户第2条消息时触发）
- 邮件通知（客户第2条消息时触发，使用 FormSubmit.co）
- 云端存储访客对话记录
- 管理后台（数据概览、访客记录、知识库、系统设置）

---

## 文件说明

| 文件 | 说明 |
|------|------|
| `chat-widget.js` | 客服组件主文件（凡科网站引用） |
| `admin.html` | 管理后台页面 |
| `README.md` | 项目说明文档（本文件） |
| `project-backup-0630.md` | 完整备份文档（2026-06-30） |
| `kimi沟通记录备份0630.md` | 完整技术文档（2026-06-30） |

---

## 通知方式

| 通知方式 | 状态 | 触发条件 |
|----------|------|----------|
| 飞书消息推送 | ✅ 正常 | 客户第2条消息时 |
| 邮件通知 | ✅ 正常 | 客户第2条消息时 |

---

## 更新记录

| 版本 | 日期 | 内容 |
|------|------|------|
| v4.5.4 | 2026-06-30 | 飞书调试日志，版本号v=40 |
| v4.5 | 2026-06-30 | 邮件方案更换为FormSubmit.co |
| v4.4 | 2026-06-30 | 更新邮件API Key |
| v4.3 | 2026-06-30 | 新增邮件通知功能 |
| v4.2 | 2026-06-30 | 添加飞书通知开关 |
| v4.0 | 2026-06-30 | 迁移到Supabase |

---

*本文档位于：沟通记录备份/README.md*
