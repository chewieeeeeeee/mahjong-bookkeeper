import crypto from 'crypto';

export default function handler(req, res) {
  const token = process.env.WECHAT_TOKEN;

  if (!token) {
    return res.status(200).json({
      tokenSet: false,
      error: 'WECHAT_TOKEN 未设置！请在 Vercel Settings → Environment Variables 中添加',
    });
  }

  // 模拟微信验证：用 token + 固定 timestamp/nonce 算一个签名
  const timestamp = '1234567890';
  const nonce = 'abcdefg';
  const echostr = 'hello_wechat';

  const arr = [token, timestamp, nonce].sort();
  const hash = crypto.createHash('sha1').update(arr.join('')).digest('hex');

  res.status(200).json({
    tokenSet: true,
    tokenPreview: token.slice(0, 3) + '***' + token.slice(-3),
    tokenLength: token.length,
    // 模拟的微信验证 URL
    testUrl: `/api/wechat?signature=${hash}&timestamp=${timestamp}&nonce=${nonce}&echostr=${echostr}`,
    expectedEcho: echostr,
  });
}
