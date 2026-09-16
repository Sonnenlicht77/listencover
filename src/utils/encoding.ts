import jschardet from 'jschardet';

/**
 * 将 Uint8Array 转为 binary string
 * jschardet 内部按字符串处理，需要这种格式
 */
function toBinaryString(bytes: Uint8Array): string {
  const chunkSize = 8192;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...chunk));
  }
  return chunks.join('');
}

/**
 * 解码文件，自动检测编码
 * 优先 UTF-8，失败时按检测结果回退
 */
export async function decodeFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // 取前 4KB 做编码检测
  const sample = bytes.subarray(0, Math.min(4096, bytes.length));
  const detected = jschardet.detect(toBinaryString(sample));
  const encoding = (detected.encoding || 'UTF-8').toUpperCase();
  const confidence = detected.confidence || 0;

  // ASCII / UTF-8 直接按 UTF-8 解码
  if (encoding === 'ASCII' || encoding === 'UTF-8') {
    return new TextDecoder('utf-8').decode(buffer);
  }

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
