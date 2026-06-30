(function(){
  // ====== Supabase 配置 ======
  var SUPABASE_URL='https://jtqwvrpjmvinyznmbcpl.supabase.co';
  var SUPABASE_KEY='sb_publishable_QhnOitR4Y8o0LSTfIR5MrQ_9w_f6xWm';
  
  // 飞书配置
  var FEISHU_WEBHOOK='https://open.feishu.cn/open-apis/bot/v2/hook/c0ff22f2-bd84-411f-a969-d4797c8b5369';
  var hasNotifiedFeishu=false;
  
  // 邮件通知标志
  var hasNotifiedEmail=false;
  
  // AI 配置
  var C={apiKey:'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',apiUrl:'https://api.moonshot.cn/v1/chat/completions',model:'moonshot-v1-8k',welcome:'您好！我是影月影视的小影~ 咱们专做企业宣传片、广告片、短视频，请问您想拍什么类型？',aiName:'在线客服小影',maxHistory:10};
  
  // 飞书通知函数
  function sendFeishuNotification(content){
    console.log('[飞书] 开始发送通知...');
    try{
      var settings=JSON.parse(localStorage.getItem('chat_settings')||'{}');
      if(settings.notifyFeishu===false){console.log('[飞书] 已关闭，跳过');return;}
    }catch(e){console.log('[飞书] localStorage读取错误:',e.message);}
    if(hasNotifiedFeishu){console.log('[飞书] 已发送过，跳过');return;}
    hasNotifiedFeishu=true;
    var summary='【影月影视】新客户咨询\n\n💬 对话内容：\n'+content.substring(0,300)+'\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN');
    console.log('[飞书] 正在发送...',FEISHU_WEBHOOK.substring(0,50)+'...');
    try{
      fetch(FEISHU_WEBHOOK,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({msg_type:'text',content:{text:summary}})
      }).then(function(r){console.log('[飞书] 响应状态:',r.status);}).catch(function(e){console.log('[飞书] 发送失败:',e.message);});
    }catch(e){console.log('[飞书] 异常:',e.message);}
  }
  
  // 邮件通知函数（使用 FormSubmit.co - 不需要API Key，前端直接发送）
  var EMAIL_TO='908159172@qq.com';
  
  function sendEmailNotification(content){
    try{
      var settings=JSON.parse(localStorage.getItem('chat_settings')||'{}');
      // 只有用户明确关闭才不发送（默认开启）
      if(settings.notifyEmail===false)return;
    }catch(e){return;}
    if(hasNotifiedEmail)return;
    hasNotifiedEmail=true;
    var summary='【影月影视】新客户咨询\n\n💬 对话内容：\n'+content.substring(0,300)+'\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN');
    try{
      fetch('https://formsubmit.co/ajax/'+EMAIL_TO,{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({_subject:'【影月影视】新客户咨询提醒',_captcha:false,_template:'table',消息内容:summary})
      }).then(function(r){
        console.log('[邮件] 发送状态:',r.status);
        if(r.ok){console.log('[邮件] ✅ 发送成功');}
        else{r.text().then(function(t){console.log('[邮件] ❌ 失败响应:',t);});}
      }).catch(function(e){console.log('[邮件] 网络失败:',e.message);});
    }catch(e){console.log('[邮件] 异常:',e.message);}
  }
  
  // 系统提示词
  var SP='你是影月影视的客服小影，13年影视制作经验，服务过500多家上市公司。主营业务：企业宣传片、广告片、短视频、产品视频、活动记录。价格区间5万-50万。\n\n【回复规范】\n1. 每次回复不超过50字\n2. 第3句后才能问客户要微信/手机号\n3. 语气亲切，像朋友聊天\n4. 引导留联系方式时话术："方便留个微信或手机号吗？我让导演直接加您给您详细方案~"\n5. 不问预算，不问公司名，不问片长\n6. 不主动发微信号，客户要才给\n7. 表情适度，不要每条都加\n8. 客户问导演微信时，回复："我们导演微信是18621893879，您直接加就行~"\n\n【常见问题】\n- 多少钱：看拍摄天数和后期复杂度，一般区间5万-50万\n- 拍多久：一般2-3天拍摄，1-2周后期\n- 能开发票：可以开增值税专用发票\n- 能做动画：有三维动画和MG动画团队\n- 外地能拍：全国都可以去\n- 能航拍：有CAAC持证飞手\n\n【知识库匹配】根据问题匹配知识库，用对应答案回复。';
  
  // 状态变量
  var H=[];
  
  // DOM创建
  var D=document.createElement('div');
  D.id='ai-chat-widget';
  D.innerHTML='<style>#ai-chat-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#eb6a3e;color:#fff;border:none;cursor:pointer;font-size:24px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif}#ai-chat-box{position:fixed;bottom:90px;right:20px;width:380px;height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.15);z-index:99998;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}#ai-chat-header{background:#eb6a3e;color:#fff;padding:14px 18px;font-weight:600;font-size:15px;display:flex;align-items:center;justify-content:space-between}#ai-chat-header .close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}#ai-chat-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.ai-chat-msg{max-width:88%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.5}.ai-chat-msg.user{align-self:flex-end;background:#eb6a3e;color:#fff}.ai-chat-msg.ai{align-self:flex-start;background:#f3f4f6;color:#333}.ai-chat-msg .time{font-size:11px;opacity:0.5;margin-top:3px}#ai-chat-input-area{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:6px}#ai-chat-input{flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:20px;font-size:14px}#ai-chat-send{padding:8px 16px;background:#eb6a3e;color:#fff;border:none;border-radius:20px;cursor:pointer}.typing-dot{display:inline-block;width:6px;height:6px;background:#999;border-radius:50%;margin:0 2px;animation:typing 1.4s infinite}@keyframes typing{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}#ai-chat-btn{font-size:0!important;width:auto!important;padding:12px 24px!important;border-radius:24px!important}#ai-chat-btn::before{content:"💬 在线客服";font-size:14px}</style><button id="ai-chat-btn">💬</button><div id="ai-chat-box"><div id="ai-chat-header"><span>📹 在线客服小影</span><button class="close-btn">✕</button></div><div id="ai-chat-messages"></div><div id="ai-chat-input-area"><input id="ai-chat-input" type="text" placeholder="请输入您的问题..." maxlength="200"><button id="ai-chat-send">发送</button></div></div>';
  document.body.appendChild(D);
  
  // 元素引用
  var B=document.getElementById('ai-chat-btn');
  var P=document.getElementById('ai-chat-box');
  var M=document.getElementById('ai-chat-messages');
  var I=document.getElementById('ai-chat-input');
  var S=document.getElementById('ai-chat-send');
  var X=document.querySelector('#ai-chat-header .close-btn');
  
  // 事件绑定
  B.onclick=function(){P.style.display=P.style.display==='flex'?'none':'flex';if(P.style.display==='flex'&&M.children.length===0){var w=C.welcome;A('ai',w);H.push({role:'assistant',content:w});saveToDB('ai',w);}I.focus();};
  X.onclick=function(){P.style.display='none';};
  S.onclick=send;
  I.onkeydown=function(e){if(e.key==='Enter')send();};
  
  function A(r,c){
    var d=document.createElement('div');
    d.className='ai-chat-msg '+r;
    if(r==='typing'){d.innerHTML='<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';}
    else{var tm=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});d.innerHTML=E(c)+'<div class="time">'+tm+'</div>';}
    M.appendChild(d);M.scrollTop=M.scrollHeight;
    return d;
  }
  function E(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML.replace(/\n/g,'<br>')}
  
  // 存储到Supabase
  function saveToDB(r,c){
    try{fetch(SUPABASE_URL+'/rest/v1/chat_records',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({visitor_id:vid,role:r,content:c})}).catch(function(){});}catch(e){}
  }
  
  // 获取或创建访客ID
  var vid=localStorage.getItem('chat_vid');
  if(!vid){vid='V'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('chat_vid',vid);}
  
  // 发送消息
  async function send(){
    var t=I.value.trim();if(!t)return;I.value='';
    A('user',t);H.push({role:'user',content:t});if(H.length>C.maxHistory)H=H.slice(-C.maxHistory);saveToDB('user',t);
    var userMsgCount=H.filter(function(m){return m.role==='user'}).length;
    if(userMsgCount===2){var summary=H.slice(-4).map(function(m){return m.role==='user'?'【客户】'+m.content:'【小影】'+m.content}).join('\n');sendFeishuNotification(summary);sendEmailNotification(summary);}
    var typing=A('typing','');S.disabled=true;
    try{
      var res=await fetch(C.apiUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+C.apiKey},body:JSON.stringify({model:C.model,messages:[{role:'system',content:SP}].concat(H),temperature:0.7,max_tokens:200})});
      var data=await res.json();typing.remove();
      if(data.choices&&data.choices[0]){var reply=data.choices[0].message.content;A('ai',reply);H.push({role:'assistant',content:reply});if(H.length>C.maxHistory)H=H.slice(-C.maxHistory);saveToDB('ai',reply);}
      else{A('ai','不好意思网络有点慢😅 方便留个联系方式吗？我让导演直接加您沟通~');}
    }catch(e){typing.remove();A('ai','网络不太稳😅 方便留个联系方式吗？我让导演直接加您沟通~');}
    S.disabled=false;I.focus();
  }
})();