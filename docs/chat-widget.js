(function(){
  var style=document.createElement('style');
  style.textContent='#ai-chat-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#eb6a3e;color:#fff;border:none;cursor:pointer;font-size:24px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif}#ai-chat-box{position:fixed;bottom:90px;right:20px;width:380px;height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.15);z-index:99998;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}#ai-chat-header{background:#eb6a3e;color:#fff;padding:14px 18px;font-weight:600;font-size:15px;display:flex;align-items:center;justify-content:space-between}#ai-chat-header .close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}#ai-chat-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.ai-chat-msg{max-width:88%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.5}.ai-chat-msg.user{align-self:flex-end;background:#eb6a3e;color:#fff}.ai-chat-msg.ai{align-self:flex-start;background:#f3f4f6;color:#333}.ai-chat-msg .time{font-size:11px;opacity:0.5;margin-top:3px}#ai-chat-input-area{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:6px}#ai-chat-input{flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:20px;font-size:14px}#ai-chat-send{padding:8px 16px;background:#eb6a3e;color:#fff;border:none;border-radius:20px;cursor:pointer}.typing-dot{display:inline-block;width:6px;height:6px;background:#999;border-radius:50%;margin:0 2px;animation:typing 1.4s infinite}@keyframes typing{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}#ai-chat-btn{font-size:0!important;width:auto!important;padding:12px 24px!important;border-radius:24px!important}#ai-chat-btn::before{content:"💬 在线客服";font-size:14px}';
  document.head.appendChild(style);

  var SUPABASE_URL='https://jtqwvrpjmvinyznmbcpl.supabase.co';
  var SUPABASE_KEY='sb_publishable_QhnOitR4Y8o0LSTfIR5MrQ_9w_f6xWm';
  var FEISHU_WEBHOOK='https://open.feishu.cn/open-apis/bot/v2/hook/c0ff22f2-bd84-411f-a969-d4797c8b5369';
  var hasNotifiedFeishu=false;
  var hasNotifiedEmail=false;
  var isHumanMode=false;
  var humanPollTimer=null;
  var HUMAN_TABLE='human_replies';
  var C={apiKey:'sk-94GVykLFgWKkU1OwC27iK1kQC0S6asUZYZRtVvINHrYRrjWP',apiUrl:'https://api.moonshot.cn/v1/chat/completions',model:'moonshot-v1-8k',welcome:'您好！我是影月影视的小影~ 咱们专做企业宣传片、广告片、短视频，请问您想拍什么类型？',aiName:'在线客服小影',maxHistory:10};
  var processedReplies={};

  var KB=[{q:'价格|多少钱|费用|报价',a:'都是根据需求定制的呢，看拍摄天数和后期复杂度，一般区间3万-30万。方便留个联系方式吗？我让导演直接加您给详细方案~'},{q:'宣传片|企业视频|公司介绍片',a:'当然拍！企业宣传片是我们的强项，服务过华为、腾讯、比亚迪等500多家上市公司。您是什么行业的？我给您匹配几个同行业案例看看~'},{q:'短视频|抖音|快手',a:'拍的！短视频我们有专门的团队，从脚本到拍摄到后期一站式搞定。您是什么类型的短视频呢？'},{q:'三维动画|MG动画|动画',a:'可以的！三维动画和MG动画我们都有专业的动画团队，能做产品演示、建筑漫游、品牌动画等。方便说下您的需求吗？'},{q:'流程|怎么合作|步骤',a:'流程很简单：1.需求沟通 2.方案策划 3.签订合同 4.拍摄制作 5.后期交付 6.修改确认。整个周期一般2-4周。'},{q:'时间|多久|周期',a:'一般企业宣传片拍摄2-3天，后期1-2周。具体看项目复杂度，简单的5-7天就能交付。急单也可以加急处理~'},{q:'航拍|无人机',a:'有的！我们有专业的航拍团队和设备，无人机、穿越机都有。建筑、工厂、活动航拍都拍过很多。'},{q:'直播|活动拍摄',a:'做的！活动拍摄和直播是我们的常规业务，单机位到多机位导播都可以。您是什么活动呢？'},{q:'地址|在哪|公司地址',a:'我们总部在上海，全国各地都可以上门拍摄。您是在哪个城市呢？'},{q:'优势|为什么选你们|和其他家比',a:'我们有3大优势：①13年行业经验，500+上市公司案例 ②从策划到后期一站式，省心 ③导演团队+电影级设备，质量有保障。'},{q:'修改|售后|不满意',a:'我们包含3次免费修改，直到您满意为止。售后也有保障，有问题随时找我们~'},{q:'免费|试用|方案',a:'前期咨询和方案策划是完全免费的！我们可以先了解您的需求，免费出一份初步方案和预算。'}];
  function localReply(text){text=text.toLowerCase();for(var i=0;i<KB.length;i++){var keys=KB[i].q.split('|');for(var j=0;j<keys.length;j++){if(text.indexOf(keys[j])>=0)return KB[i].a;}return null;}}

  function sendFeishuNotification(content){
    if(hasNotifiedFeishu)return;
    hasNotifiedFeishu=true;
    var summary='【影月影视】新客户咨询\n\n💬 对话内容：\n'+content.substring(0,300)+'\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN');
    try{
      fetch(FEISHU_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({msg_type:'text',content:{text:summary}})}).catch(function(){});
    }catch(e){}
  }

  var EMAIL_TO='908159172@qq.com';
  function sendEmailNotification(content){
    if(hasNotifiedEmail)return;
    hasNotifiedEmail=true;
    var summary='【影月影视】新客户咨询\n\n💬 对话内容：\n'+content.substring(0,300)+'\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN');
    try{
      fetch('https://formsubmit.co/ajax/'+EMAIL_TO,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({_subject:'【影月影视】新客户咨询提醒',_captcha:false,_template:'table',消息内容:summary})}).catch(function(){});
    }catch(e){}
  }

  function checkHumanReplies(){
    try{
      fetch(SUPABASE_URL+'/rest/v1/'+HUMAN_TABLE+'?visitor_id=eq.'+vid+'&is_read=eq.false&order=id.asc',{headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}})
      .then(function(r){return r.json();})
      .then(function(data){
        if(data&&data.length>0){
          data.forEach(function(reply){
            if(processedReplies[reply.id])return;
            processedReplies[reply.id]=true;
            if(reply.content==='[SYSTEM:ADMIN_TAKEOVER]'){isHumanMode=true;updateHumanUI();return;}
            if(reply.content==='[SYSTEM:ADMIN_RELEASE]'){isHumanMode=false;updateHumanUI();return;}
            A('ai','👤 '+reply.content);
            H.push({role:'assistant',content:reply.content});
            saveToDB('ai','[人工] '+reply.content);
          });
        }
      }).catch(function(e){});
    }catch(e){}
  }
  function startHumanPoll(){if(humanPollTimer)return;humanPollTimer=setInterval(checkHumanReplies,3000);}
  function updateHumanUI(){
    var bar=document.getElementById('human-status-bar');
    if(isHumanMode){
      if(!bar){
        bar=document.createElement('div');
        bar.id='human-status-bar';
        bar.style.cssText='background:#10b981;color:#fff;padding:6px 12px;font-size:12px;text-align:center;border-bottom:1px solid #059669;position:relative;z-index:1;';
        bar.innerHTML='👤 人工客服为您服务中';
        var box=document.getElementById('ai-chat-box');
        if(box)box.insertBefore(bar,box.children[1]||box.firstChild);
      }
    }else{if(bar)bar.remove();}
  }

  var vid=localStorage.getItem('chat_vid');
  if(!vid){vid='V'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('chat_vid',vid);}

  function saveToDB(role,content){
    try{
      fetch(SUPABASE_URL+'/rest/v1/chat_records',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({visitor_id:vid,role:role,content:content})}).catch(function(){});
    }catch(e){}
  }

  var SP='你是【影月影视】的在线客服小影，一家专业影视制作公司。\n\n【业务】企业宣传片、广告片、短视频、产品视频、活动记录、人物访谈、工厂实拍、品牌故事片、微电影、TVC广告、三维动画、MG动画、无人机航拍、直播服务。所有项目均为定制，根据客户需求、拍摄难度和动画效果报价，价格区间5万-50万。前期咨询和方案沟通完全免费。\n\n【公司实力】影月影视成立于2012年，专注影视制作13年，服务过500多家上市公司和行业龙头。合作客户包括：华为、腾讯、阿里巴巴、比亚迪、美的、格力、顺丰、万科、海底捞、小米等。团队有资深导演、专业摄影师、后期特效师，设备齐全，质量有保障。\n\n【核心要求】1.每次回复绝对不能超过50个字 2.语气要像真人客服，态度诚恳、热情、认真积极 3.回答要专业但不生硬，像朋友一样真诚交流\n\n【绝对禁令】1.一次对话中绝对不能主动推销任何联系方式 2.绝对不能出现"加导演微信""加微信聊""18621893879""导演微信"等类似表达 3.前2次回复绝对不能要联系方式、不能提微信、电话、加好友 4.第3次回复及以后，如果客户还没主动给联系方式，可以问一次 5.一次对话中询问联系方式只能说一次 6.绝对不能提具体价格数字 7.客户问价格时，说"都是定制的，看具体需求"\n\n【正确问联系方式】第3次才能说一次："对了，聊了这么多还没请教您怎么称呼？方便留个微信或手机号吗？我把您的需求跟导演说一下，让导演直接加您沟通~"\n\n【回复策略】第1次：热情回答+展示2-3个知名企业+问行业，绝对不能推微信。第2次：认真解答+展示能力+关心需求，绝对不能推微信。第3次及以后：正常回答，如果还没问过联系方式，问一次。\n\n【行业案例】制造业：比亚迪、格力、美的。科技：华为、腾讯、阿里巴巴。餐饮：海底捞、西贝、瑞幸咖啡。房地产：万科、碧桂园、保利。\n\n【开场策略】第1句：认真回答+展示2-3个知名企业+问客户行业。客户说了行业后：匹配该行业明星企业+说"这个行业我们拍过很多"。然后问："您是想拍品牌宣传片还是产品视频？"';

  var b=document.createElement('button');b.id='ai-chat-btn';b.innerHTML='📹';document.body.appendChild(b);
  var x=document.createElement('div');x.id='ai-chat-box';x.innerHTML='<div id="ai-chat-header"><span>'+C.aiName+'</span><button class="close-btn" onclick="document.getElementById(\'ai-chat-box\').style.display=\'none\'">✕</button></div><div id="ai-chat-messages"></div><div id="ai-chat-input-area"><input type="text" id="ai-chat-input" placeholder="输入您的问题..." autocomplete="off"><button id="ai-chat-send">发送</button></div>';document.body.appendChild(x);
  var M=document.getElementById('ai-chat-messages'),I=document.getElementById('ai-chat-input'),S=document.getElementById('ai-chat-send');
  var H=[],O=false;

  function T(){O=!O;x.style.display=O?'flex':'none';if(O&&M.children.length===0){A('ai',C.welcome);}if(O)setTimeout(function(){I.focus()},100);}
  b.onclick=T;

  function A(r,c){var d=document.createElement('div');d.className='ai-chat-msg '+r;var t=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});if(r==='typing')d.innerHTML='<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';else d.innerHTML=E(c)+'<div class="time">'+t+'</div>';M.appendChild(d);M.scrollTop=M.scrollHeight;return d;}
  function E(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML.replace(/\n/g,'<br>')}

  async function send(){
    var t=I.value.trim();
    if(!t)return;
    I.value='';
    A('user',t);
    H.push({role:'user',content:t});
    if(H.length>C.maxHistory)H=H.slice(-C.maxHistory);
    saveToDB('user',t);
    if(isHumanMode){S.disabled=false;I.focus();return;}
    var userMsgCount=H.filter(function(m){return m.role==='user'}).length;
    if(userMsgCount===2){
      var summary=H.slice(-4).map(function(m){return m.role==='user'?'【客户】'+m.content:'【小影】'+m.content}).join('\n');
      sendFeishuNotification(summary);
      sendEmailNotification(summary);
    }
    var typing=A('typing','');
    S.disabled=true;
    try{
      var res=await fetch(C.apiUrl,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+C.apiKey},body:JSON.stringify({model:C.model,messages:[{role:'system',content:SP}].concat(H),temperature:0.7,max_tokens:200})});
      var data=await res.json();
      typing.remove();
      if(isHumanMode){S.disabled=false;I.focus();return;}
      if(data.choices&&data.choices[0]){
        var reply=data.choices[0].message.content;
        A('ai',reply);
        H.push({role:'assistant',content:reply});
        if(H.length>C.maxHistory)H=H.slice(-C.maxHistory);
        saveToDB('ai',reply);
      }else{
        var fallback2=localReply(t);
        if(fallback2){A('ai',fallback2);H.push({role:'assistant',content:fallback2});saveToDB('ai',fallback2);}
        else{A('ai','感谢您的咨询！我已经记录了您的需求，导演会尽快联系您。方便留个微信或手机号吗？');}
      }
    }catch(e){
      typing.remove();
      var fallback=localReply(t);
      if(fallback){A('ai',fallback);H.push({role:'assistant',content:fallback});saveToDB('ai',fallback);}
      else{A('ai','感谢您的咨询！我已经记录了您的需求，导演会尽快联系您。方便留个微信或手机号吗？');}
    }
    S.disabled=false;
    I.focus();
  }

  S.onclick=send;
  I.onkeypress=function(e){if(e.key==='Enter')send();};
  startHumanPoll();
})();
