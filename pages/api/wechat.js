import crypto from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // GET: 微信服务器验证 — 极轻量，只用了内置 crypto，秒回
  if (req.method === 'GET') {
    const { signature, timestamp, nonce, echostr } = req.query;
    const token = process.env.WECHAT_TOKEN;

    const arr = [token, timestamp, nonce].sort();
    const hash = crypto.createHash('sha1').update(arr.join('')).digest('hex');

    if (hash === signature) {
      res.status(200).setHeader('Content-Type', 'text/plain').send(echostr);
    } else {
      res.status(200).send('signature mismatch');
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  // POST: 消息处理 — 动态导入，只在实际收消息时才加载
  const [{ parseString }, { addSession, getStats, getRecent, deleteSession }, { parseMessage }, { toXmlReply, helpText, statsText, recentText, addedText, deletedText }] =
    await Promise.all([
      import('xml2js'),
      import('../../lib/db.js'),
      import('../../lib/parser.js'),
      import('../../lib/reply.js'),
    ]);

  let parsed;
  try {
    const body = await readBody(req);
    parsed = await new Promise((resolve, reject) => {
      parseString(body, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result.xml);
      });
    });
  } catch (e) {
    res.status(400).send('Bad Request');
    return;
  }

  const fromUser = parsed.FromUserName;
  const toUser = parsed.ToUserName;

  if (parsed.MsgType !== 'text') {
    const xml = toXmlReply(fromUser, toUser, '仅支持文字消息。\n发送"帮助"查看使用说明');
    res.status(200).setHeader('Content-Type', 'application/xml').send(xml);
    return;
  }

  const content = parsed.Content.trim();
  const command = parseMessage(content);

  let replyContent;

  try {
    switch (command.action) {
      case 'help':
        replyContent = helpText();
        break;

      case 'add': {
        await addSession({
          userId: fromUser,
          amount: command.amount,
          note: command.note,
        });
        replyContent = addedText(command.amount, command.note);
        break;
      }

      case 'summary': {
        const period = command.period;
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        let startDate;
        const endDate = todayStr;

        if (period === 'today') {
          startDate = todayStr;
        } else if (period === 'week') {
          const dow = now.getDay();
          const monday = new Date(now);
          monday.setDate(now.getDate() - (dow === 0 ? 6 : dow - 1));
          startDate = monday.toISOString().slice(0, 10);
        } else if (period === 'month') {
          startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        } else if (period === 'year') {
          startDate = `${now.getFullYear()}-01-01`;
        }

        const stats = await getStats({ userId: fromUser, startDate, endDate });
        replyContent = statsText(period, stats);
        break;
      }

      case 'recent': {
        const sessions = await getRecent({ userId: fromUser });
        replyContent = recentText(sessions);
        break;
      }

      case 'delete': {
        const result = await deleteSession({
          userId: fromUser,
          amount: command.amount,
        });
        if (result) {
          replyContent = deletedText(command.amount);
        } else {
          replyContent = `未找到匹配记录：${command.amount > 0 ? '+' : ''}${command.amount}`;
        }
        break;
      }

      case 'error':
        replyContent = command.message;
        break;

      default:
        replyContent = '未知指令，发送"帮助"查看使用说明';
    }
  } catch (e) {
    console.error('处理消息出错:', e);
    replyContent = '服务器错误，请稍后再试';
  }

  const xml = toXmlReply(fromUser, toUser, replyContent);
  res.status(200).setHeader('Content-Type', 'application/xml').send(xml);
}
