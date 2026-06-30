# 影月影视 AI智能客服系统 - 完整备份

> 备份日期：2026-07-01
> 当前版本：v4.5.4
> 客服组件版本：v=40
> 客服组件地址：https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js?v=40

---

## 一、项目概述

影月影视 AI智能客服系统，部署在凡科企业网站上，集成 Moonshot AI（Kimi）作为对话引擎，支持飞书+邮件双重通知提醒。

---

## 二、访问地址

| 项目 | 地址 |
|------|------|
| 客服组件（当前版本 v40） | `https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js?v=40` |
| 管理后台 | `https://pro5brian-byte.github.io/ai-chat-service/admin.html` |
| GitHub仓库 | `https://github.com/pro5brian-byte/ai-chat-service` |

---

## 三、凡科网站嵌入代码

将以下代码粘贴到凡科网站后台的 `</body>` 标签之前：

```html
<!-- 影月影视 AI智能客服 v4.5 -->
<script src="https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js?v=40" async></script>
<style>
/* 按钮文字样式 */
#ai-chat-btn { font-size: 0 !important; width: auto !important; padding: 12px 24px !important; border-radius: 24px !important; }
#ai-chat-btn::before { content: "💬 在线客服"; font-size: 14px; }
</style>
```

> **注意**：每次更新代码后，修改 `v=40` 中的版本号（如改为 `v=41`），强制刷新浏览器缓存。

---

## 四、核心配置清单

### 4.1 飞书通知
- **状态**：正常
- **Webhook地址**：`https://open.feishu.cn/open-apis/bot/v2/hook/c0ff22f2-bd84-411f-a969-d4797c8b5369`
- **触发条件**：客户发送第2条消息时
- **开关位置**：管理后台 → 系统设置 → 通知设置

### 4.2 邮件通知
- **状态**：正常
- **收件邮箱**：`908159172@qq.com`
- **发送方式**：FormSubmit.co（无需API Key，前端直接发送）
- **触发条件**：客户发送第2条消息时
- **开关位置**：管理后台 → 系统设置 → 通知设置

### 4.3 AI引擎
- **服务商**：Moonshot（Kimi）
- **模型**：moonshot-v1-8k
- **API Key**：`sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP`
- **回复字数限制**：50字以内

### 4.4 数据存储
- **服务商**：Supabase
- **项目地址**：`https://jtqwvrpjmvinyznmbcpl.supabase.co`
- **数据表**：`chat_records`（访客对话记录）

### 4.5 客服信息
- **客服名称**：在线客服小影
- **导演微信**：18621893879
- **公司**：影月影视（上海）
- **业务**：企业宣传片、广告片、短视频

---

## 五、功能说明

### 5.1 客服对话流程
1. 访客打开网站，右下角显示"💬 在线客服"按钮
2. 点击按钮打开聊天窗口，自动发送欢迎语
3. 访客发送消息，AI自动回复（基于知识库+Moonshot AI）
4. 访客发送第2条消息时 → 触发飞书+邮件通知
5. 第3次回复后，AI询问客户联系方式

### 5.2 通知机制
- 每个访客会话只通知一次（第2条消息时）
- 飞书和邮件通知是独立的，可同时收到
- 可在后台关闭任意一种通知

### 5.3 管理后台功能
- 数据概览：今日消息、访客总数、消息总数
- 访客记录：查看所有访客对话历史
- 知识库：管理AI问答内容（增删改查）
- 系统设置：通知开关、AI策略、嵌入代码

---

## 六、更新历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v4.5.4 | 2026-06-30 | 飞书调试日志、版本号v=40 |
| v4.5.3 | 2026-06-30 | 添加飞书通知调试日志 |
| v4.5.2 | 2026-06-30 | 更新飞书Webhook为新地址 |
| v4.5.1 | 2026-06-30 | 修复飞书Webhook地址错误 |
| v4.5 | 2026-06-30 | 邮件方案从Resend API更换为FormSubmit.co |
| v4.4 | 2026-06-30 | 更新邮件API Key为QQ邮箱注册Key |
| v4.3 | 2026-06-30 | 新增邮件通知功能（Resend API） |
| v4.2 | 2026-06-30 | 添加飞书通知开关和前端直发通知 |
| v4.0 | 2026-06-30 | 迁移到Supabase，直接读取访客数据 |

---

## 七、常见问题

**Q1: 通知没收到怎么办？**
- 检查版本号是否为最新
- 刷新网页后重新测试
- 检查后台通知开关是否开启

**Q2: 如何更新版本号？**
- 进入凡科后台 → 找到嵌入代码
- 将 `v=40` 改为更大的数字（如 `v=41`）
- 保存发布

**Q3: 飞书Webhook失效怎么办？**
- 进入飞书群 → 群设置 → 群机器人
- 重新获取Webhook地址
- 将新地址发给开发更新

**Q4: 如何修改客服欢迎语？**
- 打开管理后台
- 系统设置 → AI策略设置 → 开场欢迎语

---

## 八、联系方式

- **邮箱**：908159172@qq.com
- **导演微信**：18621893879
- **公司**：影月影视（上海）

---

*本文档位于：沟通记录备份/project-backup-0630.md*
*备份于：2026-07-01*
