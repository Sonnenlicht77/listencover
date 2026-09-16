import { parseTxt } from './txtParser';

/**
 * Markdown 文本解析器
 * 去掉 Markdown 语法标记，再按 TXT 方式切分段落
 */
export function parseMd(text: string): string[] {
  let cleaned = text;

  // 1. 去掉代码块 ```lang\n...\n```
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

  // 2. 去掉行内代码 `code`
  cleaned = cleaned.replace(/`[^`\n]*`/g, '');

  // 3. 去掉图片 ![alt](url)
  cleaned = cleaned.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  // 4. 去掉链接 [text](url)，保留 text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 5. 去掉 HTML 标签
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // 6. 去掉标题标记 # ## ###
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // 7. 去掉加粗/斜体 **text** / *text* / __text__ / _text_
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

  // 8. 去掉删除线 ~~text~~
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // 9. 去掉引用 >
  cleaned = cleaned.replace(/^>\s?/gm, '');

  // 10. 去掉水平线 --- *** ___
  cleaned = cleaned.replace(/^\s*([-*_]\s*){3,}$/gm, '');

  // 11. 去掉无序列表标记 - * +
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');

  // 12. 去掉有序列表标记 1. 2.
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');

  // 13. 去掉表格分隔行 |---|---|
  cleaned = cleaned.replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, '');

  // 14. 去掉表格内容行首尾的 |
  cleaned = cleaned.replace(/^\s*\|\s*/gm, '');
  cleaned = cleaned.replace(/\s*\|\s*$/gm, '');

  return parseTxt(cleaned);
}
