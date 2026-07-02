(function(){
  // ==================== 样式 ====================
  var style=document.createElement('style');
  style.textContent='#ai-chat-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;background:#eb6a3e;color:#fff;border:none;cursor:pointer;font-size:24px;box-shadow:0 4px 20px rgba(0,0,0,0.2);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:sans-serif}#ai-chat-box{position:fixed;bottom:90px;right:20px;width:380px;height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.15);z-index:99998;display:none;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif}#ai-chat-header{background:#eb6a3e;color:#fff;padding:14px 18px;font-weight:600;font-size:15px;display:flex;align-items:center;justify-content:space-between}#ai-chat-header .close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer}#ai-chat-messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}.ai-chat-msg{max-width:88%;padding:8px 12px;border-radius:12px;font-size:14px;line-height:1.5}.ai-chat-msg.user{align-self:flex-end;background:#eb6a3e;color:#fff}.ai-chat-msg.ai{align-self:flex-start;background:#f3f4f6;color:#333}.ai-chat-msg .time{font-size:11px;opacity:0.5;margin-top:3px}#ai-chat-input-area{padding:10px 12px;border-top:1px solid #eee;display:flex;gap:6px;flex-direction:column}#ai-chat-input-row{display:flex;gap:6px}#ai-chat-input{flex:1;padding:8px 12px;border:1px solid #e5e7eb;border-radius:20px;font-size:14px}#ai-chat-send{padding:8px 16px;background:#eb6a3e;color:#fff;border:none;border-radius:20px;cursor:pointer}#human-request-btn{padding:6px 12px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;border-radius:16px;cursor:pointer;font-size:12px;text-align:center;transition:all 0.2s}#human-request-btn:hover{background:#dcfce7}#human-request-btn:disabled{background:#f1f5f9;color:#94a3b8;border-color:#e2e8f0;cursor:not-allowed}.typing-dot{display:inline-block;width:6px;height:6px;background:#999;border-radius:50%;margin:0 2px;animation:typing 1.4s infinite}@keyframes typing{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}#ai-chat-btn{font-size:0!important;width:auto!important;padding:12px 24px!important;border-radius:24px!important}#ai-chat-btn::before{content:"💬 在线客服";font-size:14px}';
  document.head.appendChild(style);

  // ==================== 配置 ====================
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
  var humanRequestCount=0;

  // ==================== 知识库 ====================
  var KB=[{q:'价格|多少钱|费用|报价|怎么收费|什么价位|预算|贵不贵|便宜|划算|报价单|清单',a:'价格根据具体需求来定呢，主要看拍摄天数、场地数量和后期复杂度。企业宣传片一般3-15万，短视频几千到几万不等。方便留个微信吗？我让导演给您详细报价~'},{q:'拍摄|拍片|制作|做视频|录视频|录像',a:'当然拍！影月影视专注影视制作13年，服务过华为、腾讯、比亚迪等500多家上市公司。从策划到后期一站式搞定。您想拍什么类型的片子呢？'},{q:'宣传片|企业宣传片|公司宣传片|品牌宣传片|产品宣传片|工厂宣传片|形象片|专题片|介绍片',a:'企业宣传片是我们的王牌业务！服务过500+上市公司，经验丰富。您是什么行业的？我给您匹配几个同行业案例看看~'},{q:'短视频|抖音|快手|视频号|小红书|微视频|信息流|广告短视频',a:'短视频有专门团队，从脚本创意到拍摄到后期一站式。抖音、快手、视频号都做过很多。您是什么类型的短视频呢？'},{q:'三维动画|3d动画|mg动画|动画|产品动画|建筑动画|漫游|特效|c4d|maya',a:'动画我们非常专业！三维动画、MG动画、产品演示、建筑漫游都能做。有专门的动画团队。方便说下您的需求吗？'},{q:'航拍|无人机|俯拍|上帝视角|大疆',a:'有的！专业航拍团队，大疆无人机、穿越机都有。建筑、工厂、景区、活动航拍都拍过很多。您需要拍什么地方呢？'},{q:'直播|活动拍摄|会议拍摄|晚会|年会|发布会|庆典|论坛|峰会',a:'活动拍摄和直播是常规业务，单机位到多机位导播、推流都可以。您是什么活动呢？大概多少人参加？'},{q:'tvc|电视广告|广告片| commercials |品牌广告|产品广告',a:'TVC电视广告是我们的强项！从创意策划到拍摄制作全流程，服务过很多知名品牌。您是什么产品呢？'},{q:'vr|全景|360度|720度|虚拟展厅|线上展厅',a:'VR全景拍摄是我们的特色！适合房地产、展厅、工厂、酒店展示。可以嵌入网站和微信小程序。'},{q:'流程|怎么合作|步骤|怎么下单|怎么开始|合作方式',a:'流程很简单：1.需求沟通 2.方案策划 3.报价确认 4.签订合同 5.拍摄制作 6.后期交付。整个周期一般2-4周。您方便留个微信吗？导演直接跟您对接~'},{q:'时间|多久|周期|工期|什么时候能好|加急|急用|赶时间',a:'一般宣传片拍摄2-3天，后期1-2周，总共2-4周。简单的片子5-7天就能交付。急单可以加急处理！您什么时候要用呢？'},{q:'地址|在哪|公司地址|公司位置|办公地点|工作室',a:'我们总部在上海嘉定区，全国各地都可以上门拍摄。您在哪个城市呢？'},{q:'优势|为什么选你们|和其他家比|凭什么|你们好在哪|口碑|评价',a:'我们有3大核心优势：①13年行业经验，服务过华为、腾讯、比亚迪等500+上市公司 ②从策划到拍摄到后期一站式搞定，省心省力 ③资深导演团队+电影级设备，质量有保障。'},{q:'修改|售后|不满意|重拍|调整|改片|能改吗',a:'放心！我们包含3次免费修改，直到您满意为止。交付后有问题也可以随时找我们，售后有保障！'},{q:'免费|试用|方案|咨询费|出方案|策划费',a:'前期需求沟通和方案策划是完全免费的！我们可以先电话/微信了解您的需求，免费出一份详细的拍摄方案和预算。您方便留个联系方式吗？'},{q:'设备|器材|摄像机|用什么拍|画质|清晰度|4k|8k|高清',a:'我们用的是电影级设备，索尼FX6、RED、阿莱等，支持4K/8K拍摄。画质绝对有保障！'},{q:'团队|导演|摄影师| crew |人员',a:'我们团队很专业！有资深导演、专业摄影师、灯光师、后期剪辑师、动画师。每个项目都会配专属团队。'},{q:'案例|作品| portfolio |样片|参考|看过往|以前拍的',a:'我们拍过很多案例！华为、腾讯、阿里巴巴、比亚迪、万科等都合作过。您方便留个微信吗？我发一些同行业的案例给您看看~'},{q:'上门|出差|外地|跨省|异地|远程|全国',a:'全国各地都可以上门拍摄！我们在上海、北京、广州、深圳、成都等城市都有合作团队。您在哪里？'},{q:'脚本|文案|策划|创意| storyline |分镜',a:'脚本策划是包含在服务里的！我们有专业的编剧和策划团队，会根据您的需求写创意脚本，您确认后再拍摄。'},{q:'演员|模特|主持人|配音|旁白|解说',a:'演员、模特、主持人、配音这些资源我们都有！可以根据您的需求和预算来推荐合适的。'},{q:'音乐|配乐|音效|bgm|背景音乐|声音',a:'后期包含配乐和音效制作！我们有合作的音乐库，也可以原创配乐，根据您的风格来定制。'},{q:'字幕|包装|调色|剪辑|后期|特效|合成',a:'后期制作包含剪辑、调色、字幕、包装、特效等全套服务。我们的后期团队经验丰富，出品质量很高！'}];
  function localReply(text){text=text.toLowerCase();for(var i=0;i<KB.length;i++){var keys=KB[i].q.split('|');for(var j=0;j<keys.length;j++){if(text.indexOf(keys[j])>=0)return KB[i].a;}return null;}}

  // ==================== 飞书通知 ====================
  function sendFeishuNotification(content){
    if(hasNotifiedFeishu)return;
    hasNotifiedFeishu=true;
    var summary='【影月影视】新客户咨询\n\n💬 对话内容：\n'+content.substring(0,300)+'\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN')+'\n\n👉 后台接管：https://pro5brian-byte.github.io/ai-chat-service/admin.html';
    try{
      fetch(FEISHU_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({msg_type:'text',content:{text:summary}})}).catch(function(){});
    }catch(e){}
  }

  // ==================== 邮件通知 ====================
  var EMAIL_TO='908159172@qq.com';
  function sendEmailNotification(content){
    if(hasNotifiedEmail)return;
    hasNotifiedEmail=true;
    var summary='【影月影视】新客户咨询\n\n💬 对话内容：\n'+content.substring(0,300)+'\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN')+'\n\n👉 后台接管：https://pro5brian-byte.github.io/ai-chat-service/admin.html';
    try{
      fetch('https://formsubmit.co/ajax/'+EMAIL_TO,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({_subject:'【影月影视】新客户咨询提醒',_captcha:false,_template:'table',消息内容:summary})}).catch(function(){});
    }catch(e){}
  }

  // ==================== 检查人工回复（轮询） ====================
  function checkHumanReplies(){
    try{
      fetch(SUPABASE_URL+'/rest/v1/'+HUMAN_TABLE+'?visitor_id=eq.'+vid+'&is_read=eq.false&order=id.asc',{headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}})
      .then(function(r){return r.json();})
      .then(function(data){
        if(data&&data.length>0){
          data.forEach(function(reply){
            if(processedReplies[reply.id])return;
            processedReplies[reply.id]=true;
            if(reply.content==='[SYSTEM:ADMIN_TAKEOVER]'){
              isHumanMode=true;
              updateHumanUI();
              A('ai','👤 人工客服已接入，有什么可以帮您的？');
              markReplyRead(reply.id);
              return;
            }
            if(reply.content==='[SYSTEM:ADMIN_RELEASE]'){
              isHumanMode=false;
              updateHumanUI();
              A('ai','✅ 已转回AI客服，继续为您服务~');
              markReplyRead(reply.id);
              return;
            }
            if(reply.content==='[SYSTEM:USER_REQUEST_HUMAN]')return;
            A('ai','👤 '+reply.content);
            H.push({role:'assistant',content:reply.content});
            saveToDB('ai','[人工] '+reply.content);
            markReplyRead(reply.id);
          });
        }
      }).catch(function(e){});
    }catch(e){}
  }

  function markReplyRead(id){
    try{
      fetch(SUPABASE_URL+'/rest/v1/'+HUMAN_TABLE+'?id=eq.'+id,{method:'PATCH',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({is_read:true})}).catch(function(){});
    }catch(e){}
  }

  function startHumanPoll(){if(humanPollTimer)return;humanPollTimer=setInterval(checkHumanReplies,3000);}

  // ==================== 更新人工UI ====================
  function updateHumanUI(){
    var bar=document.getElementById('human-status-bar');
    var btn=document.getElementById('human-request-btn');
    if(isHumanMode){
      if(!bar){
        bar=document.createElement('div');
        bar.id='human-status-bar';
        bar.style.cssText='background:#10b981;color:#fff;padding:8px 12px;font-size:13px;text-align:center;font-weight:500;position:relative;z-index:1;animation:slideDown 0.3s ease;';
        bar.innerHTML='👤 人工客服为您服务中';
        var box=document.getElementById('ai-chat-box');
        if(box)box.insertBefore(bar,box.children[1]||box.firstChild);
      }
      if(btn){btn.textContent='人工客服服务中';btn.disabled=true;btn.style.background='#10b981';btn.style.color='#fff';btn.style.borderColor='#059669';}
    }else{
      if(bar)bar.remove();
      if(btn){btn.textContent='🙋 转人工客服';btn.disabled=false;btn.style.background='';btn.style.color='';btn.style.borderColor='';}
    }
  }

  // ==================== 请求人工客服 ====================
  function requestHuman(){
    if(isHumanMode)return;
    humanRequestCount++;
    if(humanRequestCount>1){
      A('ai','已为您发送人工客服请求，请稍等...工作人员很快就会接入');
    }else{
      A('ai','已为您转接人工客服，请稍等片刻~');
    }
    try{
      fetch(SUPABASE_URL+'/rest/v1/'+HUMAN_TABLE,{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({visitor_id:vid,content:'[SYSTEM:USER_REQUEST_HUMAN]',is_read:false})}).catch(function(){});
      saveToDB('user','[用户请求人工客服]');
      var summary='【影月影视】⚠️ 客户请求人工客服\n\n👤 访客ID：'+vid+'\n🕐 时间：'+new Date().toLocaleString('zh-CN')+'\n\n客户主动请求人工接入\n\n👉 点击接管：https://pro5brian-byte.github.io/ai-chat-service/admin.html';
      fetch(FEISHU_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({msg_type:'text',content:{text:summary}})}).catch(function(){});
    }catch(e){}
  }

  // ==================== 访客ID ====================
  var vid=localStorage.getItem('chat_vid');
  if(!vid){vid='V'+Date.now().toString(36)+Math.random().toString(36).substr(2,4);localStorage.setItem('chat_vid',vid);}

  // ==================== 存储到Supabase ====================
  function saveToDB(role,content){
    try{
      fetch(SUPABASE_URL+'/rest/v1/chat_records',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({visitor_id:vid,role:role,content:content})}).catch(function(){});
    }catch(e){}
  }

  // ==================== AI提示词 ====================
  var SP='你是【影月影视】的在线客服小影，一家专业影视制作公司。

【业务】企业宣传片、广告片、短视频、产品视频、活动记录、人物访谈、工厂实拍、品牌故事片、微电影、TVC广告、三维动画、MG动画、无人机航拍、直播服务。所有项目均为定制，根据客户需求、拍摄难度和动画效果报价，价格区间5万-50万。前期咨询和方案沟通完全免费。

【公司实力】影月影视成立于2012年，专注影视制作13年，服务过500多家上市公司和行业龙头。合作客户包括：华为、腾讯、阿里巴巴、比亚迪、美的、格力、顺丰、万科、海底捞、小米等。团队有资深导演、专业摄影师、后期特效师，设备齐全，质量有保障。

【核心要求】1.每次回复绝对不能超过50个字 2.语气要像真人客服，态度诚恳、热情、认真积极 3.回答要专业但不生硬，像朋友一样真诚交流

【绝对禁令】1.一次对话中绝对不能主动推销任何联系方式 2.绝对不能出现"加导演微信""加微信聊""18621893879""导演微信"等类似表达 3.前2次回复绝对不能要联系方式、不能提微信、电话、加好友 4.第3次回复及以后，如果客户还没主动给联系方式，可以问一次 5.一次对话中询问联系方式只能说一次 6.绝对不能提具体价格数字 7.客户问价格时，说"都是定制的，看具体需求"

【正确问联系方式】第3次才能说一次："聊了这么多，我想把我们近期同行业的案例整理一份发给您参考，您方便留个微信或邮箱吗？我让导演整理好发您，也可以跟您详细沟通一下拍摄方案~"

【回复策略】第1次：热情回答+展示2-3个同行业知名企业+问行业，绝对不能推微信。第2次：认真解答+展示能力+关心需求，绝对不能推微信。第3次及以后：正常回答，如果还没问过联系方式，用发案例的方式引导留联系方式。

【A股行业案例库 - 必须按行业匹配】客户提到行业时，必须从以下列表中选取该行业的知名企业提及，绝对不能跨行业乱举例子：

化工行业：万华化学、恒力石化、荣盛石化、宝丰能源、龙佰集团、卫星化学、东方盛虹、齐翔腾达
医药生物：恒瑞医药、药明康德、迈瑞医疗、片仔癀、爱尔眼科、智飞生物、复星医药、科伦药业
电子半导体：中芯国际、立讯精密、海康威视、京东方A、韦尔股份、卓胜微、兆易创新、紫光国微
食品饮料：贵州茅台、五粮液、海天味业、伊利股份、泸州老窖、洋河股份、山西汾酒、青岛啤酒
汽车及零部件：比亚迪、宁德时代、上汽集团、长城汽车、长安汽车、福耀玻璃、潍柴动力、华域汽车
电力新能源：隆基绿能、通威股份、阳光电源、晶科能源、天合光能、晶澳科技、TCL中环、金风科技
机械设备：三一重工、中联重科、汇川技术、恒立液压、埃斯顿、徐工机械、大族激光、豪迈科技
银行金融：工商银行、招商银行、建设银行、平安银行、兴业银行、浦发银行、宁波银行
房地产：万科A、保利发展、招商蛇口、金地集团、新城控股、华侨城A、滨江集团
建筑装饰：中国建筑、中国中铁、中国铁建、上海建工、中国交建、中国中冶、隧道股份
计算机软件：金山办公、科大讯飞、恒生电子、用友网络、广联达、深信服、宝信软件、三六零
传媒广告：分众传媒、芒果超媒、三七互娱、完美世界、万达电影、蓝色光标、华策影视
通信：中国移动、中国电信、中国联通、中兴通讯、烽火通信、亨通光电、中天科技
家用电器：美的集团、格力电器、海尔智家、苏泊尔、九阳股份、老板电器、科沃斯、小熊电器
纺织服装：海澜之家、森马服饰、太平鸟、地素时尚、歌力思、比音勒芬、华利集团
轻工制造：欧派家居、索菲亚、晨光股份、公牛集团、顾家家居、志邦家居、金牌厨柜
建材水泥：海螺水泥、东方雨虹、北新建材、福耀玻璃、中国巨石、旗滨集团、华新水泥
有色金属：紫金矿业、洛阳钼业、赣锋锂业、天齐锂业、华友钴业、北方稀土、江西铜业
交通运输：顺丰控股、中远海控、京沪高铁、圆通速递、申通快递、大秦铁路、招商公路
钢铁：宝钢股份、鞍钢股份、华菱钢铁、首钢股份、太钢不锈、河钢股份
煤炭：中国神华、陕西煤业、兖矿能源、中煤能源、潞安环能、山西焦煤
石油石化：中国石油、中国石化、中国海油、荣盛石化、恒力石化、恒逸石化、桐昆股份
旅游酒店：中国中免、宋城演艺、锦江酒店、首旅酒店、中青旅、众信旅游、凯撒旅业
农林牧渔：牧原股份、温氏股份、新希望、正邦科技、大北农、隆平高科、金龙鱼
商业零售：中国中免、永辉超市、百联股份、家家悦、红旗连锁、重庆百货
环保：碧水源、首创环保、盈峰环境、龙净环保、伟明环保、瀚蓝环境、格林美
国防军工：中国船舶、中航沈飞、航发动力、中国重工、中直股份、中航西飞、洪都航空
燃气公用事业：新奥股份、深圳燃气、重庆燃气、贵州燃气、新疆火炬、佛燃能源

【话术示例】客户问"你们有没有做过化工行业的" → 正确回答："做过不少！万华化学、恒力石化、荣盛石化我们都合作过，化工行业拍过很多~ 您主要是做什么化工产品的？" 绝对不能回答"比亚迪、美的"等非化工企业。

【开场策略】第1句：认真回答+展示2-3个同行业知名企业+问客户行业。客户说了行业后：从上面行业案例库中匹配该行业的2-3个企业+说"这个行业我们拍过很多"。然后问："您是想拍品牌宣传片还是产品视频？"';

  // ==================== 创建UI ====================
  var b=document.createElement('button');b.id='ai-chat-btn';b.innerHTML='📹';document.body.appendChild(b);
  var x=document.createElement('div');x.id='ai-chat-box';x.innerHTML='<div id="ai-chat-header"><span>'+C.aiName+'</span><button class="close-btn" onclick="document.getElementById(\'ai-chat-box\').style.display=\'none\'">✕</button></div><div id="ai-chat-messages"></div><div id="ai-chat-input-area"><div id="ai-chat-input-row"><input type="text" id="ai-chat-input" placeholder="输入您的问题..." autocomplete="off"><button id="ai-chat-send">发送</button></div><button id="human-request-btn">🙋 转人工客服</button></div>';document.body.appendChild(x);
  var M=document.getElementById('ai-chat-messages'),I=document.getElementById('ai-chat-input'),S=document.getElementById('ai-chat-send');
  var H=[],O=false;

  // ==================== 转人工按钮事件 ====================
  var humanBtn=document.getElementById('human-request-btn');
  if(humanBtn)humanBtn.onclick=requestHuman;

  function T(){O=!O;x.style.display=O?'flex':'none';if(O&&M.children.length===0){A('ai',C.welcome);}if(O)setTimeout(function(){I.focus()},100);}
  b.onclick=T;

  function A(r,c){var d=document.createElement('div');d.className='ai-chat-msg '+r;var t=new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});if(r==='typing')d.innerHTML='<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';else d.innerHTML=E(c)+'<div class="time">'+t+'</div>';M.appendChild(d);M.scrollTop=M.scrollHeight;return d;}
  function E(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML.replace(/\n/g,'<br>')}

  // ==================== 发送消息 ====================
  async function send(){
    var t=I.value.trim();
    if(!t)return;
    I.value='';
    A('user',t);
    H.push({role:'user',content:t});
    if(H.length>C.maxHistory)H=H.slice(-C.maxHistory);
    saveToDB('user',t);

    // 人工模式下：只保存消息，不调用AI
    if(isHumanMode){
      try{
        fetch(SUPABASE_URL+'/rest/v1/'+HUMAN_TABLE,{method:'POST',headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=minimal'},body:JSON.stringify({visitor_id:vid,content:'[客户消息] '+t,is_read:false})}).catch(function(){});
      }catch(e){}
      S.disabled=false;
      I.focus();
      return;
    }

    // 第2条消息时触发通知
    var userMsgCount=H.filter(function(m){return m.role==='user'}).length;
    if(userMsgCount===2){
      var summary=H.slice(-4).map(function(m){return m.role==='user'?'【客户】'+m.content:'【小影】'+m.content}).join('\n');
      sendFeishuNotification(summary);
      sendEmailNotification(summary);
    }

    // AI回复
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
