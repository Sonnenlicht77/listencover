import { reactive } from 'vue';
import type { DocumentRecord } from '@/types';
import { getAllDocs, putDoc, deleteDoc as removeDocById } from '@/composables/useStorage';

/**
 * 文档列表 Store
 */
export const shelfStore = reactive({
  /** 文档列表，按添加时间倒序 */
  docs: [] as DocumentRecord[],

  /** 是否正在加载 */
  loading: false,

  /** 是否已完成首次加载 */
  initialized: false,

  /** 错误信息 */
  error: null as string | null,

  /**
   * 从 IndexedDB 加载所有文档
   */
  async load(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      this.docs = await getAllDocs();
      this.initialized = true;
    } catch (e) {
      this.error = (e as Error).message;
    } finally {
      this.loading = false;
    }
  },

  /**
   * 添加单个文档
   */
  async add(doc: DocumentRecord): Promise<void> {
    await putDoc(doc);
    this.docs.unshift(doc);
  },

  /**
   * 批量添加文档
   */
  async addMany(docs: DocumentRecord[]): Promise<void> {
    for (const doc of docs) {
      await putDoc(doc);
    }
    this.docs = [...docs, ...this.docs].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  },

  /**
   * 删除文档
   */
  async remove(id: string): Promise<void> {
    await removeDocById(id);
    this.docs = this.docs.filter((d) => d.id !== id);
  },

  /**
   * 按 id 查找文档
   */
  getById(id: string): DocumentRecord | undefined {
    return this.docs.find((d) => d.id === id);
  },

  /**
   * 清空所有文档
   */
  async clear(): Promise<void> {
    for (const doc of this.docs) {
      await removeDocById(doc.id);
    }
    this.docs = [];
  },
});
