import { openDB, type IDBPDatabase } from 'idb';
import type { DocumentRecord } from '@/types';
import { DB_NAME, DB_VERSION, STORE_DOCS } from '@/utils/constants';

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * 打开或复用 IndexedDB 连接
 */
function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_DOCS)) {
          db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * 获取所有文档，按添加时间倒序
 */
export async function getAllDocs(): Promise<DocumentRecord[]> {
  const db = await getDB();
  const list = await db.getAll(STORE_DOCS);
  return list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
}

/**
 * 按 id 获取单个文档
 */
export async function getDoc(id: string): Promise<DocumentRecord | undefined> {
  const db = await getDB();
  return db.get(STORE_DOCS, id);
}

/**
 * 新增或更新文档
 */
export async function putDoc(doc: DocumentRecord): Promise<void> {
  const db = await getDB();
  await db.put(STORE_DOCS, doc);
}

/**
 * 删除文档
 */
export async function deleteDoc(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_DOCS, id);
}

/**
 * 只更新进度字段，避免重写整个文档
 */
export async function updateProgress(id: string, cur: number): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_DOCS, 'readwrite');
  const doc = await tx.store.get(id);
  if (!doc) {
    await tx.done;
    return;
  }
  doc.progress = { cur, at: Date.now() };
  await tx.store.put(doc);
  await tx.done;
}

/**
 * 清空所有文档（用于「清除所有数据」功能）
 */
export async function clearAllDocs(): Promise<void> {
  const db = await getDB();
  await db.clear(STORE_DOCS);
}
