import type { DocumentRecord } from '@/types';
import { parseTxt } from '@/parsers/txtParser';
import { parseMd } from '@/parsers/mdParser';
import { decodeFile } from '@/utils/encoding';
import { detectLanguage, countChars, uid } from '@/utils/text';
import { MAX_FILE_SIZE, MAX_PARAGRAPHS } from '@/utils/constants';

/**
 * 解析成功的结果
 */
export interface ParseSuccess {
  success: true;
  doc: DocumentRecord;
}

/**
 * 解析失败的结果
 */
export interface ParseFailure {
  success: false;
  fileName: string;
  reason: string;
}

export type ParseOutcome = ParseSuccess | ParseFailure;

/**
 * 支持的文件扩展名
 */
const SUPPORTED_EXTENSIONS = ['txt', 'md', 'markdown'];

/**
 * 解析单个文件为 DocumentRecord
 * 阶段 3 仅支持 TXT / MD
 */
export async function parseFile(file: File): Promise<ParseOutcome> {
  // 1. 校验文件大小
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = MAX_FILE_SIZE / 1024 / 1024;
    return {
      success: false,
      fileName: file.name,
      reason: `文件超过 ${maxMB}MB 上限`,
    };
  }

  // 2. 校验扩展名
  const extMatch = file.name.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return {
      success: false,
      fileName: file.name,
      reason: `暂不支持 .${ext} 格式，请使用 TXT 或 MD`,
    };
  }

  // 3. 解码文件
  let text: string;
  try {
    text = await decodeFile(file);
  } catch (e) {
    return {
      success: false,
      fileName: file.name,
      reason: `解码失败：${(e as Error).message}`,
    };
  }

  if (!text.trim()) {
    return {
      success: false,
      fileName: file.name,
      reason: '文件内容为空',
    };
  }

  // 4. 按扩展名选择解析器
  let paragraphs: string[];
  try {
    if (ext === 'md' || ext === 'markdown') {
      paragraphs = parseMd(text);
    } else {
      paragraphs = parseTxt(text);
    }
  } catch (e) {
    return {
      success: false,
      fileName: file.name,
      reason: `解析失败：${(e as Error).message}`,
    };
  }

  // 5. 校验解析结果
  if (paragraphs.length === 0) {
    return {
      success: false,
      fileName: file.name,
      reason: '解析后没有任何有效段落',
    };
  }

  if (paragraphs.length > MAX_PARAGRAPHS) {
    return {
      success: false,
      fileName: file.name,
      reason: `段落数超过 ${MAX_PARAGRAPHS} 上限，建议拆分文件`,
    };
  }

  // 6. 生成 DocumentRecord
  const name = file.name.replace(/\.[^.]+$/, '') || file.name;

  const doc: DocumentRecord = {
    id: uid(),
    name,
    ext,
    language: detectLanguage(text),
    totalChars: countChars(paragraphs),
    paragraphs,
    progress: { cur: 0, at: 0 },
    addedAt: Date.now(),
  };

  return { success: true, doc };
}

/**
 * 批量解析多个文件
 * 返回成功和失败的结果，UI 层根据这个展示提示
 */
export async function parseFiles(files: File[]): Promise<{
  successes: DocumentRecord[];
  failures: ParseFailure[];
}> {
  const successes: DocumentRecord[] = [];
  const failures: ParseFailure[] = [];

  for (const file of files) {
    const result = await parseFile(file);
    if (result.success) {
      successes.push(result.doc);
    } else {
      failures.push(result);
    }
  }

  return { successes, failures };
}
