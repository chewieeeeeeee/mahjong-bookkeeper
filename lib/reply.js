/**
 * 生成微信 XML 回复
 */
export function toXmlReply(toUser, fromUser, content) {
  return `<xml>
<ToUserName><![CDATA[${toUser}]]></ToUserName>
<FromUserName><![CDATA[${fromUser}]]></FromUserName>
<CreateTime>${Math.floor(Date.now() / 1000)}</CreateTime>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[${content}]]></Content>
</xml>`;
}

export function helpText() {
  return [
    '麻将记账格式：',
    '  +500        → 赢了500',
    '  -200        → 输了200',
    '  +300 老张   → 赢300，备注"老张"',
    '',
    '查询格式：',
    '  今天 / 本月 / 今年  → 战绩汇总',
    '  最近               → 最近10场',
    '',
    '删除：',
    '  删 +500     → 删除最近一笔+500记录',
    '',
    '回复 h 或 帮助 查看此说明',
  ].join('\n');
}

const periodLabels = {
  today: '今日',
  week: '本周',
  month: '本月',
  year: '今年',
};

export function statsText(period, stats) {
  const label = periodLabels[period] || '';
  const { total, wins, losses, winRate, totalPnL } = stats;

  if (total === 0) {
    return `${label}暂无战绩`;
  }

  const pnlSign = totalPnL >= 0 ? '+' : '';
  const avgPnL = total > 0 ? totalPnL / total : 0;
  const avgSign = avgPnL >= 0 ? '+' : '';

  return [
    `${label}战绩：`,
    `  场次: ${total}场`,
    `  赢: ${wins}场  输: ${losses}场`,
    `  胜率: ${(winRate * 100).toFixed(1)}%`,
    `  总盈亏: ${pnlSign}${totalPnL.toFixed(0)}`,
    `  场均: ${avgSign}${avgPnL.toFixed(0)}`,
  ].join('\n');
}

export function recentText(sessions) {
  if (sessions.length === 0) return '暂无记录';

  const lines = ['最近战绩：'];
  for (const s of sessions) {
    const sign = s.amount > 0 ? '+' : '';
    const note = s.note ? ` (${s.note})` : '';
    lines.push(`  ${s.date}  ${sign}${s.amount}${note}`);
  }
  return lines.join('\n');
}

export function addedText(amount, note) {
  const sign = amount > 0 ? '+' : '';
  const result = amount > 0 ? '赢' : '输';
  const noteStr = note ? ` (${note})` : '';
  return `已记：${result}${sign}${Math.abs(amount)}${noteStr}`;
}

export function deletedText(amount) {
  const sign = amount > 0 ? '+' : '';
  return `已删除：${sign}${Math.abs(amount)}`;
}
