export default function Home() {
  return (
    <div style={{
      maxWidth: 420,
      margin: '60px auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      lineHeight: 1.8,
    }}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>麻将记账助手</h1>
      <p style={{ color: '#666' }}>
        微信聊天框记麻将输赢，月底年底复盘胜率和盈亏。
      </p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>使用方法</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {[
            ['+500', '赢了500'],
            ['-200', '输了200'],
            ['+300 老张', '赢了300，备注"老张"'],
            ['今天 / 本月 / 今年', '战绩汇总（含胜率）'],
            ['最近', '最近10场'],
            ['删 +500', '删除最近一笔'],
            ['帮助', '查看说明'],
          ].map(([cmd, desc]) => (
            <tr key={cmd}>
              <td style={{ padding: '4px 12px 4px 0', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{cmd}</td>
              <td style={{ padding: '4px 0', color: '#666' }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 32, color: '#999', fontSize: 14 }}>
        微信扫码关注测试号，发消息即可记账。
      </p>
    </div>
  );
}
