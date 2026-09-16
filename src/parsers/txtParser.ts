/**
 * TXT 文本解析器
 * 将纯文本切分为段落数组
 */
export function parseTxt(text: string): string[] {
  // 统一换行符
  const normalized = text.replace(/\r\n?/g, '\n');

  // 按行切分，过滤空行
  const lines = normalized
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  // 特殊情况：整篇无换行（或只有一行）的长文本，按标点切分
  if (lines.length <= 1 && text.length > 400) {
    const sentences = text.match(/[^。！？!?；;]+[。！？!?；;]?/g) || [text];
    return sentences.map((s) => s.trim()).filter(Boolean);
  }

  return lines;
}
