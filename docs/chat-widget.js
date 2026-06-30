(function(){
  // ==================== Supabase 配置 ====================
  const SUPABASE_URL = 'https://jtqwvrpjmvinyznmbcpl.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_QhnOitR4Y8o0LSTfIR5MrQ_9w_f6xWm';

  // ==================== AI 配置 ====================
  const CONFIG = {
    apiKey: 'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    welcomeMessage: '您好！我是影月影视的小影，很高兴为您服务~ 咱们专做企业宣传片、广告片、短视频等影视制作，请问您想拍什么类型的片子呢？😊',
    aiName: '在线客服小影',
    maxHistory: 10
  };

  const KNOWLEDGE_BASE = `【影月影视业务】
企业宣传片、广告片、短视频、产品视频、活动记录、人物访谈、工厂实拍、品牌故事片、微电影、TVC广告、三维动画、MG动画、无人机航拍、直播服务。所有项目均为定制，根据客户需求、拍摄难度和动画效果报价，价格区间5万-50万。专业导演和拍摄团队，经验丰富，质量有保障。

【报价方式】
所有影视项目均为定制，没有固定价格。根据客户需求、拍摄天数、后期复杂度、是否需要动画特效等因素综合报价。一般区间5万-50万。前期咨询和方案沟通完全免费。

【公司地址】
总部地址：上海市嘉定区。在其他城市也有分部，具体分部信息请查看网站页面底部。全国业务均可承接。

【联系方式获取规则 - 极其重要】
我们绝不主动给客户推销任何联系方式。
正确做法：聊了几句后，先问客户怎么称呼，再问是否方便留个联系方式，然后说"我把您的需求转告导演，让导演直接加您沟通~"。
绝对不能出现"加导演微信""加微信聊""微信18621893879"等主动推销联系方式的话。`;

  const SYSTEM_PROMPT = `你是【影月影视】的在线客服小影，一家专业影视制作公司。请基于以下知识库回答客户问题：

${KNOWLEDGE_BASE}

【公司实力】
影月影视成立于2012年，专注影视制作13年，服务过500多家上市公司和行业龙头。合作客户包括：华为、腾讯、阿里巴巴、比亚迪、美的、格力、顺丰、万科、海底捞、小米等。团队有资深导演、专业摄影师、后期特效师，设备齐全，质量有保障。

【核心要求 - 必须遵守】
1. 每次回复绝对不能超过50个字
2. 语气要像真人客服，态度诚恳、热情、认真积极
3. 回答要专业但不生硬，像朋友一样真诚交流

【态度要求 - 非常重要】
✅ 要诚恳：像真心想帮客户解决问题一样
✅ 要认真：每个问题都认真对待，不敷衍
✅ 要积极：热情主动，传递正能量
✅ 要礼貌：多用"您"，表达尊重

绝对不能：
- 敷衍了事、一句话打发
- 语气冷淡、机械回复

【🚫 绝对禁令 - 违反直接开除】
1. **一次对话中，绝对不能主动给客户推销任何联系方式**
2. **绝对不能出现"加导演微信""加微信聊""18621893879""导演微信"等类似表达**
3. **前2次回复绝对不能要联系方式、不能提微信、电话、加好友**
4. **第3次回复及以后，如果客户还没主动给联系方式，可以问一次**
5. **一次对话中，询问联系方式只能说一次**
6. **绝对不能提具体价格数字（如3万、5万、10万）**
7. **客户问价格时，说"都是定制的，看具体需求"**

【🚫 错误示例 - 绝对不能说】
❌ "加导演微信18621893879"
❌ "您加我们微信聊"
❌ "不好意思，网络有点卡，您直接加导演微信 18621893879 聊吧"
❌ "方便的话可以加导演微信18621893879，给您详细方案~"
❌ 任何包含"导演微信""18621893879""加微信"的表达

【✅ 正确的联系方式获取方式 - 第3次才能说一次】
"对了，聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？我把您的需求跟导演说一下，让导演直接加您沟通~"

【回复策略】
**第1次回复策略：**
- 热情回答客户问题，展示诚意
- 展示公司实力（500多家上市公司经验）
- 列举2-3个行业龙头客户名字
- 主动询问客户是什么行业
- **绝对不能要联系方式，绝对不能推微信**
- 示例："当然能拍！我们服务过华为、腾讯、比亚迪等500多家上市公司，经验丰富。请问您是什么行业的呢？😊"

**第2次回复策略：**
- 认真解答客户疑问
- 展示服务能力和专业度
- 关心客户具体需求
- **绝对不能要联系方式，绝对不能推微信**
- 示例："咱们有资深导演团队，设备也是电影级的。您想拍什么风格的呢？跟我说说您的想法~"

**第3次及以后回复策略：**
- 正常回答客户问题，保持诚恳认真
- **如果还没问过联系方式，可以在这次问一次（仅限一次）：**
  "对了，聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？我把您的需求跟导演说一下，让导演直接加您沟通~"
- **如果已经问过联系方式，绝对不能再提，也不能推微信**
- 继续正常聊天即可

**网络异常时的回复策略：**
- 如果网络卡顿，应该说："不好意思网络有点慢，请问方便留个联系方式吗？我让导演直接加您沟通~"
- **绝对不能说"加导演微信18621893879"**

【公司地址问答】
客户问地址时回答："我们总部在上海嘉定区，其他城市也有分部，具体分部信息您可以查看网站底部~ 全国业务都可以承接的！"

【价格问答】
客户问价格时："都是根据需求定制的呢，看拍摄天数和后期复杂度，一般5万到50万之间。我让导演跟您详细沟通一下？"

【正确示例】
客户：你们拍企业宣传片吗？
小影：当然拍！我们服务过华为、腾讯、比亚迪等500多家上市公司，13年经验。请问您是什么行业的呢？😊

客户：我们是做餐饮的
小影：餐饮我们拍过很多！海底捞、西贝、瑞幸咖啡都合作过，特别熟悉这个行业🎬 您是想拍品牌宣传片还是产品视频？

客户：品牌宣传片吧
小影：好的明白！对了聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？我把您的需求跟导演说一下，让导演直接加您沟通~这样更高效😊

【行业明星企业案例库 - 根据客户行业自动匹配】
制造业/工业/工厂：比亚迪、格力电器、美的集团、富士康、海尔智家、三一重工
科技/互联网/软件：华为、腾讯、阿里巴巴、字节跳动、百度、小米集团、京东集团
汽车/新能源：比亚迪、蔚来汽车、小鹏汽车、理想汽车、宁德时代
电商/零售：阿里巴巴、京东、拼多多、唯品会、苏宁易购
医疗/健康：迈瑞医疗、恒瑞医药、药明康德、爱尔眼科、复星医药
教育/培训：新东方、好未来、中公教育
房地产/建筑：万科集团、碧桂园、保利发展、龙湖集团
餐饮/食品：海底捞、西贝餐饮、贵州茅台、海天味业、农夫山泉、瑞幸咖啡
物流/快递：顺丰控股、京东物流、中通快递、圆通速递
金融/银行：中国平安、招商银行、工商银行
服装/时尚：海澜之家、安踏体育、李宁、森马服饰、波司登
家居/建材：红星美凯龙、欧派家居、索菲亚、顾家家居

【主动询问策略 - 必须执行】
1. 开场第1句：认真回答 + 展示2-3个知名企业 + 问客户行业
2. 客户说了行业后：匹配该行业明星企业 + 说"这个行业我们拍过很多"
3. 问具体需求："您是想拍品牌宣传片还是产品视频？"

【注意事项】
- 不要说"我们和华为合作过"（过于具体），要说"像华为这样的企业我们都服务过"
- 每次只提2-3个明星企业
- 行业匹配要准确
- 态度诚恳最重要
- **⚠️ 再次强调：绝对绝对不能主动推微信/导演微信/18621893879**`;

  // ==================== 访客ID ====================
  function getVisitorId() {
    let id = localStorage.getItem('chat_visitor_id');
    if (!id) {
      id = 'V' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      localStorage.setItem('chat_visitor_id', id);
    }
    return id;
  }

  // ==================== 存储到 Supabase ====================
  function saveToSupabase(role, content) {
    try {
      const visitorId = getVisitorId();
      fetch(SUPABASE_URL + '/rest/v1/chat_records', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          role: role,
          content: content
        })
      }).then(function(res) {
        if (res.ok) {
          console.log('[Supabase] ✅ 存储成功');
        } else {
          console.log('[Supabase] ❌ 存储失败:', res.status);
        }
      }).catch(function(err) {
        console.log('[Supabase] ❌ 网络错误:', err.message);
      });
    } catch(e) {
      console.log('[Supabase] ❌ 异常:', e.message);
    }
  }

  // ==================== UI样式 ====================
  const style = document.createElement('style');
  style.textContent = `
    #ai-chat-btn { position:fixed; bottom:20px; right:20px; width:60px; height:60px; border-radius:50%; background:#eb6a3e; color:#fff; border:none; cursor:pointer; font-size:24px; box-shadow:0 4px 20px rgba(0,0,0,0.2); z-index:99999; display:flex; align-items:center; justify-content:center; transition:transform 0.2s; font-family:sans-serif; }
    #ai-chat-btn:hover { transform:scale(1.05); }
    #ai-chat-box { position:fixed; bottom:90px; right:20px; width:380px; height:500px; background:#fff; border-radius:16px; box-shadow:0 8px 40px rgba(0,0,0,0.15); z-index:99998; display:none; flex-direction:column; overflow:hidden; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif; }
    #ai-chat-header { background:#eb6a3e; color:#fff; padding:14px 18px; font-weight:600; font-size:15px; display:flex; align-items:center; justify-content:space-between; }
    #ai-chat-header .close-btn { background:none; border:none; color:#fff; font-size:18px; cursor:pointer; padding:0; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border-radius:50%; }
    #ai-chat-header .close-btn:hover { background:rgba(255,255,255,0.15); }
    #ai-chat-messages { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
    .ai-chat-msg { max-width:88%; padding:8px 12px; border-radius:12px; font-size:14px; line-height:1.5; word-break:break-all; }
    .ai-chat-msg.user { align-self:flex-end; background:#eb6a3e; color:#fff; border-bottom-right-radius:4px; }
    .ai-chat-msg.ai { align-self:flex-start; background:#f3f4f6; color:#333; border-bottom-left-radius:4px; }
    .ai-chat-msg .time { font-size:11px; opacity:0.5; margin-top:3px; }
    #ai-chat-input-area { padding:10px 12px; border-top:1px solid #eee; display:flex; gap:6px; align-items:center; }
    #ai-chat-input { flex:1; padding:8px 12px; border:1px solid #e5e7eb; border-radius:20px; font-size:14px; outline:none; }
    #ai-chat-input:focus { border-color:#eb6a3e; }
    #ai-chat-send { padding:8px 16px; background:#eb6a3e; color:#fff; border:none; border-radius:20px; cursor:pointer; font-size:14px; font-weight:500; }
    #ai-chat-send:disabled { opacity:0.5; }
    #ai-chat-send:hover:not(:disabled) { background:#d55a2e; }
    .typing-dot { display:inline-block; width:6px; height:6px; background:#999; border-radius:50%; margin:0 2px; animation:typing 1.4s infinite; }
    .typing-dot:nth-child(2) { animation-delay:0.2s; }
    .typing-dot:nth-child(3) { animation-delay:0.4s; }
    @keyframes typing { 0%,60%,100%{transform:translateY(0);} 30%{transform:translateY(-4px);} }
    @media(max-width:480px) { #ai-chat-box { width:calc(100vw - 40px); height:calc(100vh - 120px); } }
  `;
  document.head.appendChild(style);

  // ==================== 创建UI元素 ====================
  const btn = document.createElement('button');
  btn.id = 'ai-chat-btn';
  btn.innerHTML = '📹';
  btn.title = '影月影视 - 在线咨询';
  document.body.appendChild(btn);

  const box = document.createElement('div');
  box.id = 'ai-chat-box';
  box.innerHTML = `
    <div id="ai-chat-header"><span>${CONFIG.aiName}</span><button class="close-btn" onclick="document.getElementById('ai-chat-box').style.display='none'">✕</button></div>
    <div id="ai-chat-messages"></div>
    <div id="ai-chat-input-area"><input type="text" id="ai-chat-input" placeholder="输入您的问题..." autocomplete="off"><button id="ai-chat-send">发送</button></div>
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
    if (isOpen && messagesEl.children.length === 0) {
      addMessage('ai', CONFIG.welcomeMessage);
    }
    if (isOpen) setTimeout(() => inputEl.focus(), 100);
  }
  btn.onclick = toggle;

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = 'ai-chat-msg ' + role;
    const time = new Date().toLocaleTimeString('zh-CN', {hour:'2-digit', minute:'2-digit'});
    if (role === 'typing') {
      div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    } else {
      div.innerHTML = escapeHtml(content) + '<div class="time">' + time + '</div>';
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  // ==================== 发送消息 ====================
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';

    addMessage('user', text);
    chatHistory.push({role:'user', content:text});
    if (chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);

    // 🔥 存储到 Supabase
    saveToSupabase('user', text);

    const typingEl = addMessage('typing', '');
    sendBtn.disabled = true;

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CONFIG.apiKey },
        body: JSON.stringify({
          model: CONFIG.model,
          messages: [{role:'system', content: SYSTEM_PROMPT}, ...chatHistory],
          temperature: 0.7,
          max_tokens: 200
        })
      });
      const data = await res.json();
      typingEl.remove();
      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        addMessage('ai', reply);
        chatHistory.push({role:'assistant', content:reply});
        if (chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);
        saveToSupabase('ai', reply);  // 存储AI回复
      } else {
        addMessage('ai', '不好意思网络有点慢😅 方便留个联系方式吗？我让导演直接加您沟通~');
      }
    } catch(e) {
      typingEl.remove();
      addMessage('ai', '网络不太稳😅 方便留个联系方式吗？我让导演直接加您，一对一沟通更方便~');
    }
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.onclick = sendMessage;
  inputEl.onkeypress = function(e) { if(e.key === 'Enter') sendMessage(); };

  console.log('[影月影视] AI智能客服 v4.0 (Supabase版) 已加载');
})();
