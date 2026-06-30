// ==================== 影月影视 AI客服通知 Worker ====================
// 部署到 Cloudflare Workers
// 环境变量：RESEND_API_KEY, EMAIL_TO, FEISHU_WEBHOOK

const ALLOWED_ORIGINS = ['*'];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (request.method === 'GET') {
      return jsonResponse({ status: 'ok', service: 'yingyue-notify', time: new Date().toISOString() }, headers);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, headers, 405);
    }

    try {
      const body = await request.json();
      const { type, visitorId, message, time } = body;

      if (!visitorId || !message) {
        return jsonResponse({ error: 'Missing visitorId or message' }, headers, 400);
      }

      const results = {};

      if (type === 'email' || type === 'both') {
        results.email = await sendEmail(env, visitorId, message, time);
      }

      if (type === 'feishu' || type === 'both') {
        results.feishu = await sendFeishu(env, visitorId, message, time);
      }

      return jsonResponse({ success: true, results }, headers);

    } catch (e) {
      return jsonResponse({ error: 'Internal error: ' + e.message }, headers, 500);
    }
  }
};

async function sendEmail(env, visitorId, message, time) {
  try {
    const apiKey = env.RESEND_API_KEY;
    const toEmail = env.EMAIL_TO;

    if (!apiKey || !toEmail) {
      return { success: false, error: 'Missing RESEND_API_KEY or EMAIL_TO' };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '影月影视AI客服 <notify@yingyue.pro5-brian.workers.dev>',
        to: [toEmail],
        subject: '【影月影视】有新客户咨询 - ' + time,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #eb6a3e; color: #fff; padding: 20px; border-radius: 12px 12px 0 0;">
    <h2 style="margin: 0;">📹 影月影视 - 新客户咨询提醒</h2>
  </div>
  <div style="background: #fff; border: 1px solid #eee; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
    <p style="color: #64748b; font-size: 14px;">您的AI客服收到了一条新消息：</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #eb6a3e;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">客户消息</p>
      <p style="margin: 0; font-size: 16px; color: #1e293b; font-weight: 500;">${escapeHtml(message)}</p>
    </div>
    <div style="font-size: 13px; color: #94a3b8; margin-top: 20px;">
      <p>访客ID：${escapeHtml(visitorId)}</p>
      <p>时间：${escapeHtml(time || new Date().toLocaleString('zh-CN'))}</p>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      <a href="https://pro5brian-byte.github.io/ai-chat-service/admin.html" style="display: inline-block; background: #eb6a3e; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px;">查看管理后台</a>
    </div>
  </div>
</div>`,
        text: `【影月影视】新客户咨询\n\n客户消息：${message}\n访客ID：${visitorId}\n时间：${time || new Date().toLocaleString('zh-CN')}\n\n查看后台：https://pro5brian-byte.github.io/ai-chat-service/admin.html`,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      return { success: true, messageId: data.id };
    } else {
      return { success: false, error: data.message || 'Resend API error' };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function sendFeishu(env, visitorId, message, time) {
  try {
    const webhook = env.FEISHU_WEBHOOK;

    if (!webhook) {
      return { success: false, error: 'Missing FEISHU_WEBHOOK' };
    }

    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msg_type: 'interactive',
        card: {
          config: { wide_screen_mode: true },
          header: {
            title: { tag: 'plain_text', content: '📹 新客户咨询 - 影月影视' },
            template: 'orange',
          },
          elements: [
            {
              tag: 'div',
              text: {
                tag: 'lark_md',
                content: `**客户消息：**\n${message}\n\n**访客ID：** ${visitorId}\n**时间：** ${time || new Date().toLocaleString('zh-CN')}`,
              },
            },
            {
              tag: 'action',
              actions: [
                {
                  tag: 'button',
                  text: { tag: 'plain_text', content: '查看管理后台' },
                  type: 'primary',
                  url: 'https://pro5brian-byte.github.io/ai-chat-service/admin.html',
                },
              ],
            },
          ],
        },
      }),
    });

    const data = await res.json();

    if (res.ok && data.code === 0) {
      return { success: true };
    } else {
      return { success: false, error: data.msg || 'Feishu API error' };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function jsonResponse(data, cors, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
