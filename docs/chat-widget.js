(function(){
  const CONFIG = {
    apiKey: 'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    welcomeMessage: '您好！我是您的智能客服小助手 😊 有什么可以帮您的吗？',
    aiName: '智能客服',
    maxHistory: 20
  };

  // 系统提示词 - 让AI像真人客服一样回答
  const SYSTEM_PROMPT = `你是一位专业、热情的企业客服顾问。请遵循以下原则回复客户：

1. **语气自然亲切**：像真人聊天一样，适当使用"您"、"亲"、"您好"等称呼，可以偶尔使用 😊👍 等表情符号增加亲和力，但不要过多。

2. **回答结构清晰**：
   - 先礼貌问候或确认问题
   - 给出明确、具体的答案
   - 必要时补充相关建议
   - 最后询问是否还有其他问题

3. **口语化表达**：避免生硬的书面语，像朋友一样自然地交流。适当分段，每段不要太长。

4. **主动服务**：如果用户问题不清楚，礼貌地追问细节，例如"为了更好地帮助您，能否告诉我..."

5. **专业可靠**：确保信息准确，不确定时诚实说明，不要编造。

6. **简洁有力**：不要啰嗦，直击要点。用户问什么就重点回答什么。`;

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
  btn.title = '智能客服';
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.id = 'ai-chat-box';
  box.innerHTML = `
    <div id="ai-chat-header"><span>🤖 ${CONFIG.aiName}</span><button class="close-btn" onclick="document.getElementById('ai-chat-box').style.display='none'">✕</button></div>
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
  console.log('[AI Chat Widget] Loaded. Click the 💬 button to start chatting.');
})();
