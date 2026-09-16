# listenCover 架构设计

> 本文档描述 listenCover 的整体架构、分层职责和核心模块设计。
> 详细的产品需求见 `docs/PRD.md`，AI 行为约束见根目录 `AGENTS.md`。

## 一、整体架构

```
┌──────────────────────────────────────────────────────────────┐
│                        浏览器环境                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    视图层（views/）                      │  │
│  │  PlayerView  │  ShelfView  │  SettingsView              │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │                  组件层（components/）                   │  │
│  │  base/  │  player/  │  shelf/  │  disguise/            │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │              组合式函数层（composables/）                │  │
│  │  useTTS  │  useStorage  │  usePlayer  │  useDisguise   │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │                  引擎层（engines/）                      │  │
│  │  TTSEngine 接口  │  WebSpeechEngine  │  Manager        │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │                  解析层（parsers/）                      │  │
│  │  txtParser  │  epubParser  │  htmlParser  │  fb2Parser │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                   │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │                  存储层（IndexedDB / localStorage）      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
              Cloudflare Pages（静态托管 + CDN）
```

**架构特点**：无服务端、无网络请求（除 CDN 加载静态资源外），所有数据处理在浏览器完成。

## 二、分层职责

### 视图层（`src/views/`）

页面级组件，负责布局编排和用户交互入口。每个视图对应一个主功能模块。

- `PlayerView.vue` — 播放器主界面
- `ShelfView.vue` — 文档列表
- `SettingsView.vue` — 设置面板

**约束**：视图层可以调用组合式函数和 store，但不直接操作 IndexedDB 或 TTS 引擎。

### 组件层（`src/components/`）

可复用的 UI 组件，按功能域分组。

- `base/` — 基础 UI（按钮、进度条、对话框）
- `player/` — 播放器相关（播放按钮、进度条、音轨信息）
- `shelf/` — 文档列表相关（文档卡片、拖拽遮罩）
- `disguise/` — 伪装模板（销售数据表、代码编辑器、邮件列表）

**约束**：展示型组件不直接访问 store，通过 props 接收数据、通过 emits 派发事件。

### 组合式函数层（`src/composables/`）

封装有状态逻辑，协调引擎层与存储层，向上提供响应式接口。

- `useTTS.ts` — TTS 引擎调用与音色管理
- `useStorage.ts` — IndexedDB 操作封装
- `usePlayer.ts` — 播放状态管理
- `useDisguise.ts` — 伪装切换逻辑
- `useFileParser.ts` — 文档解析流程
- `useKeyboard.ts` — 键盘快捷键

### 引擎层（`src/engines/`）

TTS 能力的抽象层，通过统一接口屏蔽不同引擎的差异。

- `TTSEngine.ts` — 抽象接口
- `WebSpeechEngine.ts` — 保底层完整实现
- `KokoroEngine.ts` — 增强层骨架（预留）
- `MossTTSEngine.ts` — 增强层骨架（预留）
- `EdgeTTSEngine.ts` — 备选层骨架（预留）
- `TTSEngineManager.ts` — 引擎选择与降级

### 解析层（`src/parsers/`）

文档格式识别与文本提取，输出统一的段落数组。

- `txtParser.ts` — TXT / MD 解析
- `epubParser.ts` — EPUB 解析（P1）
- `htmlParser.ts` — HTML 解析（P1）
- `fb2Parser.ts` — FB2 解析（P1）

### 存储层

- **IndexedDB（idb 封装）** — 文档正文、阅读进度
- **localStorage** — 用户设置、界面语言

## 三、核心模块设计

### 3.1 TTS 引擎抽象

所有引擎实现统一的 `TTSEngine` 接口。

```typescript
abstract class TTSEngine {
  abstract readonly id: string;
  abstract readonly name: string;

  abstract isAvailable(): Promise<boolean>;
  abstract getVoices(): Promise<SpeechSynthesisVoice[]>;
  abstract speak(text: string, options?: SpeakOptions): Promise<void>;
  abstract pause(): Promise<void>;
  abstract resume(): Promise<void>;
  abstract stop(): Promise<void>;
}
```

**引擎层级**：

| 层级   | 实现                             | 状态   |
| ------ | -------------------------------- | ------ |
| 保底层 | `WebSpeechEngine`                | 已实现 |
| 增强层 | `KokoroEngine` / `MossTTSEngine` | 仅骨架 |
| 备选层 | `EdgeTTSEngine`                  | 仅骨架 |

**选择策略**：`TTSEngineManager` 按优先级依次检测 `isAvailable()`，返回第一个可用引擎。

### 3.2 状态管理

不引入 Pinia。用 `reactive` 创建模块级 store。

- `playerStore` — 当前文档、当前段、播放状态、分块索引
- `shelfStore` — 文档列表、加载状态
- `settingsStore` — 用户设置（自动持久化到 localStorage）

### 3.3 文本分块朗读

按标点切分段落为 ≤110 字的语义块，逐块朗读，避免单次朗读过长导致卡顿。

```
原文段落
   ↓
按标点切分 → [块1, 块2, 块3, ...]
   ↓
逐块朗读 → 上一块读完自动读下一块
   ↓
跨段续读 → 当前段读完自动跳下一段
```

**保活机制**：每 5 秒检测 `speechSynthesis.paused` 并恢复，防止 Chrome 静默停止。

### 3.4 伪装切换

```
用户按 ~ (或其他自定义键)
   ↓
保存当前播放状态
   ↓
隐藏播放器 → 显示伪装界面
   ↓
暂停音频（可配置）
   ↓
再按 ~ → 恢复播放器 + 继续播放
```

伪装模板组件位于 `src/components/disguise/`，通过 `v-if` 或动态组件切换。

### 3.5 国际化

vue-i18n，仅中英双语。

- 语言文件：`src/locales/zh-CN.json`、`src/locales/en.json`
- 语言优先级：`localStorage.lang` > 浏览器 `navigator.language` > 默认 `zh-CN`
- 切换即时生效，无需刷新

## 四、数据模型

### DocumentRecord（IndexedDB）

```typescript
interface DocumentRecord {
  id: string;
  name: string;
  ext: string;
  language: 'zh' | 'en';
  totalChars: number;
  paragraphs: string[];
  progress: {
    cur: number;
    at: number;
  };
  addedAt: number;
}
```

### Settings（localStorage）

```typescript
interface Settings {
  lang: 'zh-CN' | 'en';
  rate: number;
  voiceName: string | null;
  theme: 'day' | 'night' | 'sepia';
  bossKey: string;
  bossPause: boolean;
  autoPauseOnBlur: boolean;
  ttsEngine: string;
}
```

## 五、目录结构速查

```
src/
├── views/              页面级组件
├── components/         通用组件
│   ├── base/
│   ├── player/
│   ├── shelf/
│   └── disguise/
├── composables/        组合式函数
├── stores/             全局状态
├── engines/            TTS 引擎
├── parsers/            文档解析
├── locales/            中英文案
├── types/              TypeScript 类型
├── utils/              纯函数工具
└── assets/styles/      样式文件
```

## 六、待补充

以下章节在对应模块开发时补充：

- [ ] 章节提取算法与数据结构
- [ ] EPUB 解析详细流程
- [ ] 伪装模板切换机制与动态元素实现
- [ ] 浏览器兼容性检测清单与降级方案
- [ ] 性能优化策略（大文件解析、内存管理）
- [ ] PWA 离线缓存策略
- [ ] 测试策略详细说明

## 七、约束与红线

- **零后端**：不发起任何上传用户数据的网络请求
- **本地优先**：正文、进度、设置全部存储在浏览器本地
- **单设备**：不做跨设备同步、WebDAV、导出/导入进度
- **保底层优先**：TTS 保底层必须可用；增强层和备选层只留接口
- **中英双语**：不新增其他语言
