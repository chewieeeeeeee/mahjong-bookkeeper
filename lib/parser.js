/**
 * 解析用户消息，返回操作指令
 * 麻将记账专用：+金额=赢，-金额=输
 */
export function parseMessage(text) {
  const t = text.trim();

  // 帮助
  if (/^(帮助|help|h|说明|\?)$/i.test(t)) {
    return { action: 'help' };
  }

  // 查询
  if (/^(今天|今日|today)$/i.test(t)) {
    return { action: 'summary', period: 'today' };
  }
  if (/^(本周|这周|week)$/i.test(t)) {
    return { action: 'summary', period: 'week' };
  }
  if (/^(本月|这个月|month)$/i.test(t)) {
    return { action: 'summary', period: 'month' };
  }
  if (/^(今年|全年|year)$/i.test(t)) {
    return { action: 'summary', period: 'year' };
  }
  if (/^(最近|近期|recent|ls)$/i.test(t)) {
    return { action: 'recent' };
  }

  // 删除
  const delMatch = t.match(/^(删|删除|del)\s+([+-]\d+(?:\.\d{1,2})?)/i);
  if (delMatch) {
    return { action: 'delete', amount: parseFloat(delMatch[2]) };
  }

  // 记账：单独一个金额，+赢 -输
  const txMatch = t.match(/^([+-])(\d+(?:\.\d{1,2})?)(?:\s+(.*))?$/);
  if (txMatch) {
    const sign = txMatch[1] === '+' ? 1 : -1;
    const amount = parseFloat(txMatch[2]) * sign;
    const note = (txMatch[3] || '').trim();
    return { action: 'add', amount, note };
  }

  return {
    action: 'error',
    message: '格式：\n"+500" 赢了500\n"-200" 输了200\n"+300 老张" 赢300备注老张\n"今天/本月/今年" 查战绩\n"帮助" 看说明',
  };
}
