(function(){
  // 企业宣传片拍摄 - 知识库
  const KNOWLEDGE_BASE = `【拍摄服务】
Q: 你们可以拍摄企业宣传片吗？
A: 当然可以！📹 我们专注于企业宣传片拍摄，拥有专业的拍摄团队和后期制作能力。我们的服务包括：企业宣传片、产品展示视频、工厂实拍、人物访谈/老板IP打造、活动记录、短视频。我们会根据您的需求量身定制拍摄方案。

【价格报价】
Q: 拍摄企业宣传片怎么收费？
A: 我们有三个套餐：🎬 基础版3,999元（1天拍摄，1-2分钟成片）；🎬 标准版9,999元（2-3天拍摄，3-5分钟成片，含创意策划）；🎬 旗舰版19,999元（5-7天拍摄，5-10分钟成片，含全案策划+特效）。具体价格根据需求调整，需要推荐合适方案吗？

Q: 有免费试用或免费咨询吗？
A: 有的！我们可以先为您提供免费的拍摄创意方案 📋，包含脚本大纲和分镜设计，您看看效果再决定是否合作。满意后再签约！

【业务流程】
Q: 拍摄流程是怎样的？
A: 1️⃣需求沟通→2️⃣创意策划（3-5天）→3️⃣前期准备→4️⃣现场拍摄（1-5天）→5️⃣后期制作（7-15天）→6️⃣修改交付。整个流程约3-4周，有紧急需求可加急1周交付。

Q: 拍摄需要多长时间？
A: 简单产品视频1天，企业宣传片2-3天，品牌形象片3-5天。完整项目周期：简单2-3周，标准3-4周，复杂4-6周。

【常见问题】
Q: 需要准备什么？
A: 📋 素材准备（企业资料、产品样品、资质证书）；👥 人员安排（确定出镜人员）；🏢 场地准备（办公区整理、生产线清洁）。拍摄当天有导演现场指导，不用担心！

Q: 能看一下案例吗？
A: 我们拍摄过众多企业宣传片，涵盖制造业、科技公司、电商企业、医疗健康、教育培训等行业。您是什么行业？我可以推荐相关案例参考。

Q: 可以开发票吗？
A: 可以的！提供增值税普通发票和专用发票，支持对公转账和分期付款（3:5:2或5:5）。

Q: 不满意可以修改吗？
A: 当然可以！修改到您满意为止。初稿完成后提供免费修改3次，每次3-5个工作日。`;

  const CONFIG = {
    apiKey: 'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    welcomeMessage: '您好！👋 欢迎来到我们的官网。我们是专业的企业宣传片拍摄团队，请问您想拍摄什么类型的视频呢？',
    aiName: '在线客服',
    maxHistory: 20
  };

  // 系统提示词 - 企业宣传片拍摄客服
  const SYSTEM_PROMPT = `你是【XX影视传媒】的智能客服顾问，我们是一家专注于企业宣传片拍摄制作的公司。请基于以下知识库回答客户问题：

${KNOWLEDGE_BASE}

【回答原则】
1. 语气热情专业，像资深销售顾问一样主动服务
2. 回答结构：先确认客户需求→给出具体方案/报价→引导下一步行动
3. 适当使用emoji增加亲和力，但不要过多
4. 报价和流程要准确，不能编造
5. 主动询问客户需求，引导留下联系方式或安排进一步沟通
6. 每次回复最后可以问"您还有什么想了解的吗？"或"需要我帮您安排吗？"`;

  function getVisitorId() {
    let id = localStorage.getItem('chat_visitor_id');
    if(!id) { id = 'V' + Date.now().toString(36) + Math.random().toString(36).substr(2,5); localStorage.setItem('chat_visitor_id', id); }
    return id;
  }

  function saveConversation(role, content) {
    const convs = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
    const visitorId = getVisitorId();
    let conv = convs.find(c => c.visitorId === visitorId && Date.now() - c.time < 3600000);
    if(!conv) { conv = { id: 'C'+Date.now(), visitorId, time: Date.now(), messages: [] }; convs.push(conv); }
    conv.messages.push({ role, content, time: Date.now() });
    conv.time = Date.now();
    while(convs.length > 50) convs.shift();
    localStorage.setItem('chat_conversations', JSON.stringify(convs));
  }

  const style = document.createElement('style');
  style.textContent = `
    #ai-chat-btn { position:fixed; bottom:20px; right:20px; width:60px; height:60px; border-radius:50%; background:#4f46e5; color:#fff; border:none; cursor:pointer; font-size:28px; box-shadow:0 4px 20px rgba(0,0,0,0.2); z-index:99999; display:flex; align-items:center; justify-content:center; transition:transform 0.2s; }
    #ai-chat-btn:hover { transform:scale(1.05); }
    #ai-chat-box { position:fixed; bottom:90px; right:20px; width:380px; height:520px; background:#fff; border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,0.15); z-index:99998; display:none; flex-direction:column; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif; }
    #ai-chat-header { background:#4f46e5; color:#fff; padding:16px 20px; font-weight:600; font-size:15px; display:flex; align-items:center; justify-content:space-between; }
    #ai-chat-header .close-btn { background:none; border:none; color:#fff; font-size:20px; cursor:pointer; padding:0; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
    #ai-chat-header .close-btn:hover { background:rgba(255,255,255,0.2); }
    #ai-chat-messages { flex:1; overflow-y:auto; padding:15px; display:flex; flex-direction:column; gap:10px; }
    .ai-chat-msg { max-width:85%; padding:10px 14px; border-radius:12px; font-size:14px; line-height:1.6; word-break:break-all; }
    .ai-chat-msg.user { align-self:flex-end; background:#4f46e5; color:#fff; border-bottom-right-radius:4px; }
    .ai-chat-msg.ai { align-self:flex-start; background:#f3f4f6; color:#333; border-bottom-left-radius:4px; }
    .ai-chat-msg .time { font-size:11px; opacity:0.6; margin-top:4px; }
    #ai-chat-input-area { padding:12px 15px; border-top:1px solid #eee; display:flex; gap:8px; align-items:center; }
    #ai-chat-input { flex:1; padding:10px 14px; border:1px solid #e5e7eb; border-radius:10px; font-size:14px; outline:none; }
    #ai-chat-input:focus { border-color:#4f46e5; }
    #ai-chat-send { padding:10px 18px; background:#4f46e5; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:14px; }
    #ai-chat-send:disabled { opacity:0.5; cursor:not-allowed; }
    .typing-dot { display:inline-block; width:6px; height:6px; background:#999; border-radius:50%; margin:0 2px; animation:typing 1.4s infinite; }
    .typing-dot:nth-child(2) { animation-delay:0.2s; }
    .typing-dot:nth-child(3) { animation-delay:0.4s; }
    @keyframes typing { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-4px);} }
    @media(max-width:480px) { #ai-chat-box { width:calc(100vw - 40px); height:calc(100vh - 120px); } }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'ai-chat-btn';
  btn.innerHTML = '💬';
  btn.title = '在线客服';
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.id = 'ai-chat-box';
  box.innerHTML = `
    <div id="ai-chat-header"><span>🎬 ${CONFIG.aiName}</span><button class="close-btn" onclick="document.getElementById('ai-chat-box').style.display='none'">✕</button></div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-input-area"><input type="text" id="ai-chat-input" placeholder="输入问题..." autocomplete="off"><button id="ai-chat-send">发送</button></div>
  `;
  document.body.appendChild(box);

  const messagesEl = document.getElementById('ai-chat-messages');
  const inputEl = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  let chatHistory = [];
  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    box.style.display = isOpen ? 'flex' : 'none';
    if(isOpen && messagesEl.children.length === 0) { addMessage('ai', CONFIG.welcomeMessage); }
    if(isOpen) setTimeout(() => inputEl.focus(), 100);
  }
  btn.onclick = toggle;

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = 'ai-chat-msg ' + role;
    const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
    if(role === 'typing') { div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>'; }
    else { div.innerHTML = escapeHtml(content) + '<div class="time">' + time + '</div>'; }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if(!text) return;
    inputEl.value = '';
    addMessage('user', text);
    saveConversation('user', text);
    chatHistory.push({role:'user', content:text});
    if(chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);

    const typingEl = addMessage('typing', '');
    sendBtn.disabled = true;

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CONFIG.apiKey },
        body: JSON.stringify({ model: CONFIG.model, messages: [{role:'system', content: SYSTEM_PROMPT}, ...chatHistory], temperature: 0.8 })
      });
      const data = await res.json();
      typingEl.remove();
      if(data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        addMessage('ai', reply);
        saveConversation('ai', reply);
        chatHistory.push({role:'assistant', content:reply});
        if(chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);
      } else { addMessage('ai', '抱歉，服务暂时异常，请稍后再试 😅'); }
    } catch(e) {
      typingEl.remove();
      addMessage('ai', '抱歉，网络连接失败，请检查网络后重试 😅');
    }
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.onclick = sendMessage;
  inputEl.onkeypress = function(e) { if(e.key === 'Enter') sendMessage(); };
  console.log('[AI Chat Widget] Loaded for video production service.');
})();
