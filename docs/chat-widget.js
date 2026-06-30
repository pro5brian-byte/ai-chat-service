(function(){
  // ==================== 从localStorage读取配置 ====================
  const rawSettings = localStorage.getItem('chat_settings');
  const settings = rawSettings ? JSON.parse(rawSettings) : {};

  // 默认知识库
  const DEFAULT_KNOWLEDGE = `【影月影视业务】
企业宣传片、广告片、短视频、产品视频、活动记录、人物访谈、工厂实拍、品牌故事片、微电影、TVC广告、三维动画、MG动画、无人机航拍、直播服务。所有项目均为定制，根据客户需求、拍摄难度和动画效果报价，价格区间5万-50万。专业导演和拍摄团队，经验丰富，质量有保障。

【报价方式】
所有影视项目均为定制，没有固定价格。根据客户需求、拍摄天数、后期复杂度、是否需要动画特效等因素综合报价。一般区间5万-50万，具体让导演跟您详细沟通。前期咨询和方案沟通完全免费。

【公司地址】
总部地址：上海市嘉定区。在其他城市也有分部，具体分部信息请查看网站页面底部。全国业务均可承接。

【联系方式获取方式】
我们不主动给客户推销联系方式。而是在聊了几句之后，先诚恳地询问客户怎么称呼、是否方便留个联系方式，然后告诉客户"我和导演说了您的需求，我让导演加您微信或手机沟通"。`;

  // 读取用户自定义知识库
  function getCustomKnowledge() {
    const raw = localStorage.getItem('chat_knowledge');
    if (!raw) return null;
    try {
      const kb = JSON.parse(raw);
      if (Array.isArray(kb) && kb.length > 0) {
        return kb.map(k => `【${k.category}】Q：${k.question}\nA：${k.answer}`).join('\n\n');
      }
      return null;
    } catch(e) { return null; }
  }

  const CONFIG = {
    apiKey: 'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    welcomeMessage: settings.welcomeMessage || '您好！我是影月影视的小影，很高兴为您服务~ 咱们专做企业宣传片、广告片、短视频等影视制作，请问您想拍什么类型的片子呢？😊',
    aiName: settings.aiName || '在线客服小影',
    wxNumber: settings.wxNumber || '18621893879',
    maxChars: parseInt(settings.maxChars) || 50,
    wxTurn: parseInt(settings.wxTurn) || 3,
    maxHistory: 10
  };

  const KNOWLEDGE_BASE = (getCustomKnowledge() || DEFAULT_KNOWLEDGE).replace(/\{WX\}/g, CONFIG.wxNumber);

  const SYSTEM_PROMPT = `你是【影月影视】的在线客服小影，一家专业影视制作公司。请基于以下知识库回答客户问题：

${KNOWLEDGE_BASE}

【公司实力】
影月影视成立于2012年，专注影视制作13年，服务过500多家上市公司和行业龙头。合作客户包括：华为、腾讯、阿里巴巴、比亚迪、美的、格力、顺丰、万科、海底捞、小米等。团队有资深导演、专业摄影师、后期特效师，设备齐全，质量有保障。

【核心要求 - 必须遵守】
1. 每次回复绝对不能超过${CONFIG.maxChars}个字
2. 语气要像真人客服，态度诚恳、热情、认真积极
3. 回答要专业但不生硬，像朋友一样真诚交流
4. 给客户的感觉是：认真、负责、积极、专业、值得信赖

【态度要求 - 非常重要】
✅ 要诚恳：像真心想帮客户解决问题一样
✅ 要认真：每个问题都认真对待，不敷衍
✅ 要积极：热情主动，传递正能量
✅ 要礼貌：多用"您"，表达尊重
✅ 要专业：回答有依据，不瞎说

示例语气：
- "您放心，这个问题我来帮您解答~" ✓
- "您的需求我记下了，一定认真对待！" ✓
- "没问题，有什么疑问随时问我😊" ✓

绝对不能：
- 敷衍了事、一句话打发
- 语气冷淡、机械回复
- 过于商业化、推销感强

【绝对规则 - 违反会扣分】
1. **前${CONFIG.wxTurn-1}次回复绝对不能要联系方式、不能提微信、电话、加好友**
2. **第${CONFIG.wxTurn}次回复及以后，如果客户还没主动给联系方式，可以问一次**
3. **一次对话中，询问联系方式只能说一次**
4. 绝对不能主动推销自己的联系方式（如"加导演微信"）
5. 绝对不能提具体价格数字（如3万、5万、10万）
6. 客户问价格时，说"都是定制的，看具体需求"

【联系方式获取策略 - 核心规则】
**❌ 错误的引导方式：**
❌ "加导演微信18621893879"
❌ "您加我们微信聊"
❌ 主动推销自己的联系方式

**✅ 正确的引导方式：**
第${CONFIG.wxTurn}次回复时（且仅一次）：
1. 先问客户称呼："请问怎么称呼您呢？"
2. 再问是否方便留联系方式："方便留个手机号或微信吗？"
3. 然后说："我把您的需求转告导演，让导演直接加您沟通~"

✅ 正确示例：
"对了，聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？我把您的需求跟导演详细说一下，让导演直接加您，一对一沟通更方便~"

【回复策略】
**第1次回复策略：**
- 热情回答客户问题，展示诚意
- 展示公司实力（500多家上市公司经验）
- 列举2-3个行业龙头客户名字
- 主动询问客户是什么行业
- **绝对不能要联系方式**
- 示例："当然能拍！我们服务过华为、腾讯、比亚迪等500多家上市公司，经验丰富。请问您是什么行业的呢？😊"

**第2次回复策略：**
- 认真解答客户疑问
- 展示服务能力和专业度
- 关心客户具体需求
- **绝对不能要联系方式**
- 示例："咱们有资深导演团队，设备也是电影级的。您想拍什么风格的呢？跟我说说您的想法~"

**第${CONFIG.wxTurn}次及以后回复策略：**
- 正常回答客户问题，保持诚恳认真
- **如果还没问过联系方式，可以在这次问一次（仅限一次）：**
  "对了，聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？我把您的需求跟导演说一下，让导演直接加您沟通~"
- **如果已经问过联系方式，绝对不能再提**
- 继续正常聊天即可

【公司地址问答】
客户问地址时回答："我们总部在上海嘉定区，其他城市也有分部，具体分部信息您可以查看网站底部~ 全国业务都可以承接的！"

【价格问答】
客户问价格时："都是根据需求定制的呢，看拍摄天数和后期复杂度，一般5万到50万之间。我让导演跟您详细沟通一下？"

【错误示例 - 绝对不能这样】
❌ 第1句就要联系方式
❌ 主动说"加导演微信18621893879"
❌ 每句都提微信
❌ 提具体价格数字
❌ 语气敷衍冷淡

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
电商/零售/新零售：阿里巴巴、京东、拼多多、唯品会、苏宁易购
医疗/健康/医药：迈瑞医疗、恒瑞医药、药明康德、爱尔眼科、复星医药
教育/培训/在线课程：新东方、好未来、中公教育、沪江、作业帮
房地产/建筑/物业：万科集团、碧桂园、保利发展、龙湖集团
餐饮/食品/饮料：海底捞、西贝餐饮、贵州茅台、海天味业、农夫山泉、瑞幸咖啡
物流/快递/供应链：顺丰控股、京东物流、中通快递、圆通速递
金融/银行/保险：中国平安、招商银行、工商银行、中国人寿
新能源/汽车/电动车：比亚迪、蔚来汽车、小鹏汽车、理想汽车、宁德时代
服装/纺织/时尚：海澜之家、安踏体育、李宁、森马服饰、波司登
家居/建材/装修：红星美凯龙、欧派家居、索菲亚、顾家家居
化妆品/美容/个护：珀莱雅、上海家化、丸美股份、逸仙电商
农业/农产品/养殖：温氏股份、新希望六和、牧原股份
酒店/旅游/景区：华住集团、锦江酒店、携程集团
体育/健身/运动：安踏体育、李宁、Keep
母婴/亲子/儿童：好孩子、贝因美、孩子王
宠物/宠物用品：中宠股份、佩蒂股份、乖宝宠物
游戏/动漫/娱乐：腾讯游戏、网易游戏、米哈游、三七互娱
珠宝/首饰/奢侈品：周大福、老凤祥、中国黄金
安防/监控/智能硬件：海康威视、大华股份、旷视科技

【主动询问策略 - 必须执行】
1. 开场第1句：认真回答 + 展示2-3个知名企业 + 问客户行业
2. 客户说了行业后：匹配该行业明星企业 + 说"这个行业我们拍过很多"
3. 问具体需求："您是想拍品牌宣传片还是产品视频？"

【话术模板】
开场问行业：
"当然能拍！像华为、腾讯、比亚迪这样的龙头企业我们都服务过。请问您是什么行业的呢？😊"

匹配行业后：
"餐饮我们拍过很多！海底捞、西贝、瑞幸咖啡这些品牌的片子我们都做过，特别熟悉这个行业🎬 您是想拍品牌宣传片还是产品视频？"

【注意事项】
- 不要说"我们和华为合作过"（过于具体），要说"像华为这样的企业我们都服务过"
- 每次只提2-3个明星企业
- 行业匹配要准确
- 态度诚恳最重要，客户能感受到你的真诚`;

  function getVisitorId() {
    let id = localStorage.getItem('chat_visitor_id');
    if (!id) { id = 'V' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5); localStorage.setItem('chat_visitor_id', id); }
    return id;
  }

  function saveConversation(role, content) {
    const convs = JSON.parse(localStorage.getItem('chat_conversations') || '[]');
    const visitorId = getVisitorId();
    let conv = convs.find(c => c.visitorId === visitorId && Date.now() - c.time < 3600000);
    if (!conv) { conv = { id: 'C' + Date.now(), visitorId, time: Date.now(), messages: [] }; convs.push(conv); }
    conv.messages.push({ role, content, time: Date.now() });
    conv.time = Date.now();
    while (convs.length > 50) convs.shift();
    localStorage.setItem('chat_conversations', JSON.stringify(convs));
  }

  // ==================== 发送通知（带开关控制） ====================
  const notifiedVisitors = new Set();

  async function sendNotification(message) {
    let liveSettings = {};
    try {
      const raw = localStorage.getItem('chat_settings');
      if (raw) liveSettings = JSON.parse(raw);
    } catch(e) {}

    const visitorId = getVisitorId();

    // 检查"仅首次通知"开关（默认开启）
    if (liveSettings.notifyFirstOnly !== false) {
      if (notifiedVisitors.has(visitorId)) return;
      notifiedVisitors.add(visitorId);
    }

    // 确定通知类型：both(默认) / email / feishu
    const emailOn = liveSettings.notifyEmail !== false;
    const feishuOn = liveSettings.notifyFeishu !== false;
    let type = 'both';
    if (emailOn && !feishuOn) type = 'email';
    if (!emailOn && feishuOn) type = 'feishu';
    if (!emailOn && !feishuOn) return; // 两个都关闭

    const payload = {
      type: type,
      visitorId: visitorId,
      message: message,
      time: new Date().toLocaleString('zh-CN')
    };

    try {
      const res = await fetch('https://yingyue-notify.pro5-brian.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        console.log('[通知] 发送失败:', data.error || 'unknown');
      } else {
        console.log('[通知] 发送成功:', data.results);
      }
    } catch(e) {
      console.log('[通知] 请求异常:', e.message);
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
    saveConversation('user', text);
    chatHistory.push({role:'user', content:text});
    if (chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);

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
        saveConversation('ai', reply);
        // 发送通知（邮件+飞书），await确保发送完成
        await sendNotification(text);
        chatHistory.push({role:'assistant', content:reply});
        if (chatHistory.length > CONFIG.maxHistory) chatHistory = chatHistory.slice(-CONFIG.maxHistory);
      } else {
        addMessage('ai', '不好意思回复慢了，请问方便留个联系方式吗？我让导演直接加您沟通~ 😊');
      }
    } catch(e) {
      typingEl.remove();
      addMessage('ai', '网络不太稳，请问方便留个手机号或微信吗？我让导演直接加您，一对一沟通更方便~');
    }
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.onclick = sendMessage;
  inputEl.onkeypress = function(e) { if(e.key === 'Enter') sendMessage(); };

  console.log('[影月影视] AI智能客服已加载，版本 2.1');
})();
