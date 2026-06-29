(function(){
  const KNOWLEDGE_BASE = `【影月影视业务】
企业宣传片、广告片、短视频、产品视频、活动记录、人物访谈、工厂实拍、品牌故事片、微电影、TVC广告、三维动画、MG动画、无人机航拍、直播服务。所有项目均为定制，根据客户需求、拍摄难度和动画效果报价，价格区间5万-50万。专业导演和拍摄团队，经验丰富，质量有保障。

【报价方式】
所有影视项目均为定制，没有固定价格。根据客户需求、拍摄天数、后期复杂度、是否需要动画特效等因素综合报价。一般区间5万-50万，具体让导演跟您详细沟通。前期咨询和方案沟通完全免费。

【联系方式】
导演微信：18621893879，前期咨询免费`;

  const CONFIG = {
    apiKey: 'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    welcomeMessage: '您好！我是影月影视的小影~ 咱们专做企业宣传片、广告片、短视频等影视制作，您想拍什么？',
    aiName: '在线客服小影',
    maxHistory: 10
  };

  const SYSTEM_PROMPT = `你是【影月影视】的在线客服小影，一家专业影视制作公司。请基于以下知识库回答客户问题：

${KNOWLEDGE_BASE}

【核心要求 - 必须遵守】
1. 每次回复绝对不能超过50个字
2. 语气像真人客服，亲切热情，不要太正式
3. 像朋友聊天一样自然

【重要规则】
1. 绝对不能提具体价格（如3999元、9999元）
2. 客户问价格时，说"都是定制的，让导演跟您报"
3. 强调定制服务，每个项目都不一样
4. 强调前期咨询免费

【回复策略】
1. 先简短确认能拍+我们有经验
2. 然后引导加导演微信或留联系方式
3. 每次结尾都要引导联系导演，话术：
   - "加导演微信18621893879，免费沟通~"
   - "让导演直接跟您对接，微信18621893879"
   - "留个电话，导演联系您，前期免费"

【示例】
客户：拍宣传片多少钱？
小影：都是根据需求定制的呢~ 让导演跟您详细报。加导演微信18621893879，免费咨询 😊`;

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
    #ai-chat-btn { position:fixed; bottom:20px; right:20px; width:60px; height:60px; border-radius:50%; background:#eb6a3e; color:#fff; border:none; cursor:pointer; font-size:24px; box-shadow:0 4px 20px rgba(0,0,0,0.2); z-index:99999; display:flex; align-items:center; justify-content:center; transition:transform 0.2s; font-family:sans-serif; }
    #ai-chat-btn:hover { transform:scale(1.05); }
    #ai-chat-box { position:fixed; bottom:90px; right:20px; width:380px; height:500px; background:#fff; border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,0.15); z-index:99998; display:none; flex-direction:column; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif; }
    #ai-chat-header { background:#eb6a3e; color:#fff; padding:14px 18px; font-weight:600; font-size:15px; display:flex; align-items:center; justify-content:space-between; }
    #ai-chat-header .close-btn { background:none; border:none; color:#fff; font-size:18px; cursor:pointer; padding:0; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
    #ai-chat-messages { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
    .ai-chat-msg { max-width:88%; padding:8px 12px; border-radius:12px; font-size:14px; line-height:1.5; word-break:break-all; }
    .ai-chat-msg.user { align-self:flex-end; background:#eb6a3e; color:#fff; border-bottom-right-radius:4px; }
    .ai-chat-msg.ai { align-self:flex-start; background:#f3f4f6; color:#333; border-bottom-left-radius:4px; }
    .ai-chat-msg .time { font-size:11px; opacity:0.5; margin-top:3px; }
    #ai-chat-input-area { padding:10px 12px; border-top:1px solid #eee; display:flex; gap:6px; align-items:center; }
    #ai-chat-input { flex:1; padding:8px 12px; border:1px solid #e5e7eb; border-radius:20px; font-size:14px; outline:none; }
    #ai-chat-input:focus { border-color:#eb6a3e; }
    #ai-chat-send { padding:8px 16px; background:#eb6a3e; color:#fff; border:none; border-radius:20px; cursor:pointer; font-size:14px; }
    #ai-chat-send:disabled { opacity:0.5; }
    .typing-dot { display:inline-block; width:6px; height:6px; background:#999; border-radius:50%; margin:0 2px; animation:typing 1.4s infinite; }
    .typing-dot:nth-child(2) { animation-delay:0.2s; }
    .typing-dot:nth-child(3) { animation-delay:0.4s; }
    @keyframes typing { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-4px);} }
    @media(max-width:480px) { #ai-chat-box { width:calc(100vw - 40px); height:calc(100vh - 120px); } }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'ai-chat-btn';
  btn.innerHTML = '📹';
  btn.title = '影月影视';
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.id = 'ai-chat-box';
  box.innerHTML = `
    <div id="ai-chat-header"><span>${CONFIG.aiName}</span><button class="close-btn" onclick="document.getElementById('ai-chat-box').style.display='none'">✕</button></div>
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
        body: JSON.stringify({ model: CONFIG.model, messages: [{role:'system', content: SYSTEM_PROMPT}, ...chatHistory], temperature: 0.7, max_tokens: 120 })
      });
      const data = await res.json();
      typingEl.remove();
      if(data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        addMessage('ai', reply);
        saveConversation('ai', reply);
        chatHistory.push({role:'assistant', content:reply});
        if(chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);
      } else { addMessage('ai', '不好意思，网络有点卡，您直接加导演微信 18621893879 聊吧 😊'); }
    } catch(e) {
      typingEl.remove();
      addMessage('ai', '网络不太稳，您加导演微信 18621893879，一对一沟通更方便~');
    }
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.onclick = sendMessage;
  inputEl.onkeypress = function(e) { if(e.key === 'Enter') sendMessage(); };
  console.log('[影月影视] 在线客服小影已加载');
})();
