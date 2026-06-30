# 影月影视 AI智能客服系统

> 版本：v4.2 | 更新时间：2026-06-30
> 技术栈：GitHub Pages + Supabase + Moonshot AI + 飞书Webhook

---

## 一、系统架构

```
凡科企业官网（前端展示）
    │
    ├──► 客服组件 (chat-widget.js) ──► Moonshot AI（智能回复）
    │                              ──► Supabase（对话存储）
    │                              ──► 飞书Webhook（消息通知）
    │
    └──► 管理后台 (admin.html) ──► Supabase（读取访客数据）
                                 ──► localStorage（设置/知识库）
```

---

## 二、在线地址

| 组件 | 地址 | 说明 |
|------|------|------|
| 客服组件 | https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js | 凡科网站引用的JS文件 |
| 管理后台 | https://pro5brian-byte.github.io/ai-chat-service/admin.html | 访客记录、知识库、系统设置 |
| GitHub仓库 | https://github.com/pro5brian-byte/ai-chat-service | 源码仓库 |

---

## 三、关键配置信息

### 3.1 Supabase 数据库
```
URL:  https://jtqwvrpjmvinyznmbcpl.supabase.co
KEY:  sb_publishable_QhnOitR4Y8o0LSTfIR5MrQ_9w_f6xWm
表名: chat_records
字段: id, visitor_id, role, content, created_at
```

### 3.2 Moonshot AI（大模型）
```
API Key: sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP
API URL: https://api.moonshot.cn/v1/chat/completions
模型:    moonshot-v1-8k
```

### 3.3 飞书机器人（消息通知）
```
Webhook: https://open.feishu.cn/open-apis/bot/v2/hook/c0ff22f2-bd84-411f-a969-d4797c8b5369
通知时机: 客户发送第2条消息时
通知频率: 每个访客仅通知一次
开关控制: 后台「系统设置」→「飞书消息推送」开关
```

---

## 四、凡科网站嵌入代码

进入凡科网站后台 → 添加「HTML代码」模块 → 粘贴以下内容：

```html
<!-- 影月影视 AI智能客服 v4.2 -->
<script src="https://pro5brian-byte.github.io/ai-chat-service/chat-widget.js?v=32" async></script>
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
```

> 注意：版本号 `v=32` 对应 v4.2 版本，后续更新时请同步修改版本号以强制刷新缓存。

---

## 五、功能清单

### 5.1 客服组件（chat-widget.js）

| 功能 | 状态 | 说明 |
|------|------|------|
| AI智能回复 | ✅ | Moonshot AI，50字以内，真人语气 |
| 企业实力展示 | ✅ | 500+上市公司案例，行业匹配 |
| 引导加微信 | ✅ | 第3句后，只提一次 |
| 访客对话存储 | ✅ | Supabase云端存储 |
| 飞书实时通知 | ✅ | 客户发第2条消息时推送 |
| 通知开关控制 | ✅ | localStorage 读取设置 |
| 访客ID追踪 | ✅ | localStorage 持久化 |

### 5.2 管理后台（admin.html）

| 模块 | 功能 |
|------|------|
| 📊 数据概览 | 今日消息、访客总数、消息总数、知识库条目 |
| 👥 访客记录 | 搜索访客ID/关键词、查看对话详情、按时间排序 |
| 📚 知识库 | 增删改查问答对、分类筛选（6大分类） |
| ⚙️ 系统设置 | AI名称、开场语、微信话术、字数限制、引导时机 |
| 🔔 通知设置 | 飞书开关（默认开启）、邮件占位（未配置） |
| 📎 嵌入代码 | 一键复制凡科嵌入代码 |
| 🗄️ 数据管理 | 导出/导入知识库和设置（JSON格式） |

---

## 六、AI回复策略

| 轮次 | 策略 | 微信引导 |
|------|------|---------|
| 第1次 | 热情回答 + 展示2-3个知名企业 + 问行业 | ❌ 不提 |
| 第2次 | 认真解答 + 展示能力 + 关心需求 | ❌ 不提 |
| 第3次+ | 正常回答，可问一次联系方式 | ✅ 仅一次 |

### 微信询问话术（第3次使用）
```
对了，聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？
我把您的需求跟导演说一下，让导演直接加您沟通~
```

### 绝对禁令
- ❌ 绝对不能主动推销任何联系方式
- ❌ 绝对不能出现"加导演微信""18621893879"等表达
- ❌ 前2次回复绝对不能提微信、电话
- ❌ 一次对话中询问联系方式只能说一次
- ❌ 绝对不能提具体价格数字
- ❌ 客户问价格时说"都是定制的，看具体需求"

---

## 七、版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | - | 基础AI对话功能 |
| v2.x | - | 添加知识库、系统设置 |
| v3.0 | - | 添加访客记录、嵌入代码 |
| v3.2 | - | 诊断日志、调试功能 |
| v4.0 | - | 迁移到Supabase云端存储，直接读取访客数据 |
| v4.1 | - | 添加飞书通知功能（前端直发） |
| **v4.2** | **2026-06-30** | **添加飞书通知开关、通知设置页面、默认开启通知** |

---

## 八、文件说明

```
ai-chat-service/
├── docs/
│   ├── chat-widget.js    # 客服组件（凡科网站引用）
│   └── admin.html        # 管理后台
├── README.md             # 本文档
└── .git/                 # Git版本控制
```

---

## 九、使用说明

### 后台通知开关
1. 打开 https://pro5brian-byte.github.io/ai-chat-service/admin.html
2. 点击左侧「⚙️ 系统设置」
3. 最上方「🔔 通知设置」中找到「飞书消息推送」开关
4. 开启/关闭后自动保存
5. 客服组件会同步读取该设置

### 查看访客对话
1. 后台「👥 访客记录」页面
2. 点击访客ID右侧的「查看对话」按钮
3. 弹窗显示完整的客户与AI对话记录

### 更新凡科网站代码
1. 后台「⚙️ 系统设置」→「📎 嵌入代码」
2. 点击「📋 复制代码」
3. 进入凡科后台 → 替换原有的HTML代码模块
4. 保存并发布

---

## 十、注意事项

1. **飞书通知依赖前端fetch**：如果凡科网站的沙盒限制飞书域名（open.feishu.cn），通知可能发送失败。客服对话功能不受影响。
2. **版本号缓存**：更新客服组件后，务必修改嵌入代码中的 `v=XX` 版本号，否则浏览器可能使用缓存的旧版本。
3. **数据存储**：对话记录存储在Supabase云端，知识库和系统设置存储在浏览器localStorage中。
4. **API Key安全**：Moonshot AI的API Key明文存储在chat-widget.js中，这是受限于凡科沙盒环境的权宜方案。
5. **通知开关同步**：通知开关状态通过localStorage共享，后台和客服组件需要在同一浏览器中才能同步。跨浏览器/设备需要手动保持设置一致。

---

*影月影视 AI智能客服系统 - 2026年6月30日*
