import jschardet from 'jschardet';

/**
 * 解码文件，自动检测编码
 * 优先 UTF-8，失败时按检测结果回退
 */
export async function decodeFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  // 取前 4KB 做编码检测
  const sample = new Uint8Array(buffer.slice(0, 4096));
  const detected = jschardet.detect(sample);
  const encoding = detected.encoding || 'UTF-8';
  const confidence = detected.confidence || 0;

  // 置信度低时，先尝试 UTF-8（覆盖绝大多数场景）
  if (confidence < 0.8) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      // 继续往下走，按检测结果尝试
    }
  }

  // 按检测到的编码解码
  try {
    return new TextDecoder(encoding).decode(buffer);
  } catch {
    // 兜底：用 UTF-8 容错模式
    return new TextDecoder('utf-8').decode(buffer);
  }
}
