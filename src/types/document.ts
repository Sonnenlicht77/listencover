/**
 * 文档记录 — 存储在 IndexedDB 中的核心数据结构
 */
export interface DocumentRecord {
  /** 唯一标识，由 crypto.randomUUID() 生成 */
  id: string;
  /** 文档名称（不含扩展名） */
  name: string;
  /** 文件扩展名，如 'txt'、'epub' */
  ext: string;
  /** 检测到的文档主要语言 */
  language: 'zh' | 'en';
  /** 总字符数，用于估算听书时长 */
  totalChars: number;
  /** 段落数组，每个元素是一个段落 */
  paragraphs: string[];
  /** 阅读进度 */
  progress: {
    /** 当前段落索引 */
    cur: number;
    /** 最后更新时间戳 */
    at: number;
  };
  /** 添加时间戳 */
  addedAt: number;
}
