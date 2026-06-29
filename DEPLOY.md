# AI 智能客服系统 - Vercel 免费部署指南

## 部署前准备

你需要注册以下账号（全部免费）：

| 平台 | 用途 | 注册地址 |
|------|------|----------|
| GitHub | 存放代码 | https://github.com/signup |
| Vercel | 托管服务器（免费） | https://vercel.com/signup |

> 💡 Vercel 可以用 GitHub 账号直接登录，更方便

---

## 第一步：创建 GitHub 仓库

### 1.1 登录 GitHub
访问 https://github.com/login 登录

### 1.2 创建新仓库
1. 点击右上角 `+` → **New repository**
2. 填写信息：
   - **Repository name**: `ai-chat-service`（随便取）
   - **Visibility**: 选 `Private`（私有，更安全）
   - 其他保持默认
3. 点击 **Create repository**

### 1.3 上传代码

在你的电脑上打开终端，依次执行：

```bash
# 1. 进入项目目录
cd /mnt/agents/output/app

# 2. 初始化 git
git init

# 3. 添加所有文件
git add .

# 4. 提交代码
git commit -m "Initial commit"

# 5. 关联远程仓库（把 YOUR_USERNAME 换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/ai-chat-service.git

# 6. 推送代码
git branch -M main
git push -u origin main
```

---

## 第二步：Vercel 部署

### 2.1 登录 Vercel
1. 访问 https://vercel.com
2. 点击 **Sign Up** → 选择 **Continue with GitHub**
3. 授权 Vercel 访问你的 GitHub 仓库

### 2.2 导入项目
1. 登录后点击 **Add New...** → **Project**
2. 在列表中找到你的 `ai-chat-service` 仓库
3. 点击 **Import**

### 2.3 配置项目

在配置页面填写：

| 配置项 | 填写内容 |
|--------|----------|
| **Framework Preset** | 选 `Vite` |
| **Root Directory** | 保持默认 `./` |
| **Build Command** | 保持默认 `npm run build` |
| **Output Directory** | 保持默认 `dist/public` |

### 2.4 配置环境变量

点击 **Environment Variables**，添加以下变量：

```
DATABASE_URL=mysql://2WirN6WVU7Hpdin.root:hYbP30vWwGfKmaFFXgZ5zFtEAfrVyRi4@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19f121f8-bcd2-8d92-8000-09f68fe9b3ed

KIMI_API_KEY=sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP

APP_ID=19f1223b-f862-8195-8000-00005bc28108

APP_SECRET=4vcTWrgKUbtfbe9v99g0F5ccQRcb1CpP

VITE_APP_ID=19f1223b-f862-8195-8000-00005bc28108

VITE_KIMI_AUTH_URL=https://auth.kimi.com

KIMI_AUTH_URL=https://auth.kimi.com

KIMI_OPEN_URL=https://open.kimi.com

OWNER_UNION_ID=d8m1mm0c86sdei6e72fg
```

> ⚠️ 每条变量单独添加，**Name** 和 **Value** 分别填入

### 2.5 开始部署

1. 点击 **Deploy**
2. 等待 2-3 分钟
3. 部署完成后，Vercel 会给你一个域名：
   `https://ai-chat-service-xxx.vercel.app`

**这个域名就是你的系统地址！**

---

## 第三步：嵌入企业官网

拿到 Vercel 域名后，把这段代码放到你企业官网的 `</body>` 标签前面：

```html
<script>
(function() {
  // 改成你的 Vercel 部署地址
  var CHAT_SERVER = 'https://ai-chat-service-xxx.vercel.app';
  
  var iframe = document.createElement('iframe');
  iframe.src = CHAT_SERVER;
  iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:380px;height:560px;max-height:90vh;border:none;z-index:999999;display:none;border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -4px 24px rgba(0,0,0,0.12);background:#fff;transition:all .3s;';
  iframe.id = 'ai-chat-iframe';
  
  var btn = document.createElement('button');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999999;width:56px;height:56px;border-radius:50%;background:#4f46e5;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(79,70,229,0.3);transition:all .2s;';
  btn.onmouseenter = function(){this.style.transform='scale(1.08)';};
  btn.onmouseleave = function(){this.style.transform='scale(1)';};
  
  var isOpen = false;
  btn.onclick = function(){
    var f = document.getElementById('ai-chat-iframe');
    if(!isOpen){f.style.display='block';setTimeout(function(){f.style.opacity='1';},10);
      btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';}
    else{f.style.opacity='0';setTimeout(function(){f.style.display='none';},300);
      btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';}
    isOpen = !isOpen;
  };
  
  document.body.appendChild(iframe);
  document.body.appendChild(btn);
  console.log('[AI客服] 已加载');
})();
</script>
```

---

## 部署完成后的费用

| 项目 | 费用 |
|------|------|
| Vercel 托管（Hobby免费版） | **¥0/月** |
| TiDB 数据库（5GB免费额度） | **¥0/月** |
| GitHub 仓库（私有免费） | **¥0/月** |
| **Kimi API**（15元免费额度） | **免费先用** |
| Kimi API（用完后按量） | 约 **¥0.01-0.05/次对话** |

**你唯一要付的：Kimi API 调用费**（按量计费，用多少付多少）

---

## 管理后台

部署后访问：`https://你的域名/admin/dashboard`

功能：
- 📊 仪表盘：查看对话数据统计
- 💬 对话管理：查看所有访客对话记录
- 📚 知识库：管理 AI 回答内容
- ⚙️ AI 设置：调整回复参数
- 🔧 系统设置：配置外观和通知

---

## 常见问题

**Q: Vercel 免费版够用吗？**
A: 够用！免费版每月 100GB-hours，客服系统消耗很小。

**Q: 部署后代码更新怎么办？**
A: 修改代码 → `git push` → Vercel 自动重新部署

**Q: 可以用自己的域名吗？**
A: 可以！在 Vercel 项目设置中添加自定义域名

**Q: Kimi 15元用完怎么办？**
A: 去 platform.moonshot.cn 充值，最低 ¥50
