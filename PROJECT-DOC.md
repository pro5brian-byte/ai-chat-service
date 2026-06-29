# 影月影视 - AI智能客服系统 项目文档

> 本文档记录项目所有配置信息，方便后续修改和维护

---

## 一、项目概述

| 项目 | 内容 |
|------|------|
| 公司名称 | 影月影视 |
| 业务范围 | 企业宣传片、广告片、短视频、TVC、三维动画、MG动画、航拍、直播等影视制作 |
| 服务方式 | 全部定制，前期免费咨询 |
| 客服目的 | 引导客户加导演微信，留下联系方式 |

---

## 二、网站地址

| 页面 | 网址 |
|------|------|
| 客服组件 | https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js |
| 管理后台 | https://pro5brian-byte.github.io/ai-chat-service/admin.html |
| 首页 | https://pro5brian-byte.github.io/ai-chat-service/ |

---

## 三、API配置

| 项目 | 值 |
|------|-----|
| AI平台 | Kimi (Moonshot) |
| API Key | sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP |
| API地址 | https://api.moonshot.cn/v1/chat/completions |
| 模型 | moonshot-v1-8k |
| 账户余额 | 15元（认证后赠送） |
| 账户状态 | 免费版（每分钟20次请求） |
| 管理后台 | https://platform.moonshot.cn |

---

## 四、数据库配置（TiDB Cloud）

| 项目 | 值 |
|------|-----|
| 平台 | TiDB Cloud |
| 区域 | AWS Singapore |
| Host | gateway01.ap-southeast-1.prod.aws.tidbcloud.com |
| Port | 4000 |
| Database | ai_chat |
| User | 367LphjRK4LxS6S.root |
| Password | yBLj2OadocHbONRW |
| 管理后台 | https://tidbcloud.com |

### 数据库表结构

```
knowledge_categories    - 知识库分类表
knowledge_base          - 知识库条目表
settings                - 系统设置表
```

---

## 五、GitHub仓库

| 项目 | 值 |
|------|-----|
| 仓库地址 | https://github.com/pro5brian-byte/ai-chat-service |
| 部署方式 | GitHub Pages（免费） |
| Pages设置 | Branch: main, Folder: /docs |
| 仓库状态 | Public |

---

## 六、嵌入企业官网的代码

在凡科后台（或其他网站），在 `</body>` 前添加：

```html
<style>
#ai-chat-btn { 
  font-size: 0 !important; 
  width: auto !important; 
  padding: 12px 24px !important; 
  border-radius: 24px !important;
}
#ai-chat-btn::before { 
  content: "💬 在线客服"; 
  font-size: 14px;
}
</style>
<script src="https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js" async></script>
```

如需调整位置，添加位置样式（参考下方CSS调整）。

---

## 七、关键文件说明

| 文件 | 路径 | 说明 |
|------|------|------|
| 聊天组件 | `docs/chat-widget.js` | AI客服核心代码，控制AI回复、颜色、开场词 |
| 管理后台 | `docs/admin.html` | 查看聊天记录、管理知识库、获取嵌入代码 |
| 首页 | `docs/index.html` | 项目展示首页 |

---

## 八、常见修改指南

### 1. 改开场词

文件：`docs/chat-widget.js`  
搜索：`welcomeMessage:`  
修改引号内的文字

### 2. 改AI名称

文件：`docs/chat-widget.js`  
搜索：`aiName:`  
修改引号内的文字（如"在线客服小影"）

### 3. 改主题色

文件：`docs/chat-widget.js`  
搜索：`#eb6a3e`（共5处）  
全部替换为新的颜色值

### 4. 改业务知识库（AI回答内容）

文件：`docs/chat-widget.js`  
搜索：`KNOWLEDGE_BASE`  
修改其中的问答内容

**注意：** 知识库存在代码中，修改后需要等待2-3分钟生效。

### 5. 改开场图标

文件：`docs/chat-widget.js`  
搜索：`btn.innerHTML = '📹'`  
改为其他emoji，如 `'📷'` 或 `'🎬'`

### 6. 改按钮位置

文件：`docs/chat-widget.js`  
搜索：`bottom:20px; right:20px`  
改为 `top:20px; right:20px`（右上角）或其他位置

---

## 九、AI回复策略设定

当前设定：
- 每次回复不超过50个字
- 语气像真人客服，亲切口语化
- 不提具体价格（定制服务）
- 每次结尾引导加导演微信
- 导演微信：18621893879

如需调整策略，修改 `docs/chat-widget.js` 中的 `SYSTEM_PROMPT` 部分。

---

## 十、费用说明

| 项目 | 费用 |
|------|------|
| GitHub Pages托管 | 免费 |
| TiDB Cloud数据库 | 免费（5GB额度） |
| Kimi API调用 | 按量付费（约0.02-0.1元/次对话） |
| 当前余额 | 15元 |

---

## 十一、联系方式汇总

| 用途 | 号码 |
|------|------|
| 导演微信/客服 | 18621893879 |

---

## 十二、修改后生效方法

每次修改 `docs/chat-widget.js` 或 `docs/admin.html` 后：

1. 在GitHub上编辑文件并保存（Commit changes）
2. 等待 **2-3分钟**（GitHub Pages自动部署）
3. 在网站上按 **Ctrl + Shift + R** 强制刷新
4. 测试新效果

---

*本文档生成时间：2026-06-30*
*项目：影月影视 AI智能客服系统*
