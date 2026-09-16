/**
 * 检测文本主要语言
 * 中文字符占比 > 30% 判定为中文，否则为英文
 */
export function detectLanguage(text: string): 'zh' | 'en' {
  const sample = text.slice(0, 2000);
  if (!sample) return 'en';
  const chineseChars = (sample.match(/[\u4e00-\u9fa5]/g) || []).length;
  return chineseChars / sample.length > 0.3 ? 'zh' : 'en';
}

/**
 * 统计段落数组的总字符数
 */
export function countChars(paragraphs: string[]): number {
  return paragraphs.reduce((sum, p) => sum + p.length, 0);
}

/**
 * 将段落按标点切分为 ≤ maxLen 字的语义块
 * 用于逐块朗读，避免单次朗读过长导致卡顿
 */
export function splitChunks(text: string, maxLen = 110): string[] {
  const parts = text.match(/[^。！？!?；;，,]+[。！？!?；;，,]?/g) || [text];
  const chunks: string[] = [];
  let buf = '';
  for (const p of parts) {
    if (buf.length + p.length > maxLen && buf) {
      chunks.push(buf);
      buf = p;
    } else {
      buf += p;
    }
  }
  if (buf) chunks.push(buf);
  return chunks.length ? chunks : [text];
}

/**
 * HTML 转义，用于安全渲染用户输入
 */
export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] || c
  );
}

/**
 * 格式化时间为 mm:ss 或 h:mm:ss
 */
export function formatTime(seconds: number): string {
  const sec = Math.max(0, Math.floor(seconds));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * 生成唯一 ID
 */
export function uid(): string {
  return crypto.randomUUID();
}
