# AGENTS.md

## 项目概述
listenCover — 纯网页端本地听书工具。单设备、零配置、本地优先。
用户上传本地文档（TXT/MD/EPUB等），通过 TTS 朗读，界面伪装成音频播放器。
所有数据存储在浏览器本地，不上传服务器。

仓库：https://github.com/Sonnenlicht77/listencover

## 技术栈
- 框架: Vue 3 (Composition API + `<script setup>`) + TypeScript
- 构建: Vite 6
- 包管理: pnpm
- 状态: `reactive` 模块级 store，不引入 Pinia
- 路由: 无 (单页应用，用 `v-if` 切换视图)
- 国际化: vue-i18n，仅中英双语 (zh-CN / en)
- 存储: IndexedDB (idb) + localStorage
- TTS: 保底层 Web Speech API，增强层仅留接口骨架
- 测试: Vitest (单元) + Playwright (E2E)
- 部署: Cloudflare Pages

## 目录结构
- `src/views/` — 页面级组件 (PlayerView, ShelfView, SettingsView)
- `src/components/` — 通用组件，按 `base` / `player` / `shelf` / `disguise` 分组
- `src/composables/` — 有状态逻辑，`use` 前缀 (如 `useTTS.ts`)
- `src/stores/` — 全局状态，`reactive` 模块 (如 `playerStore.ts`)
- `src/engines/` — TTS 引擎，实现 `TTSEngine` 抽象接口
- `src/parsers/` — 文档解析器 (txt, epub, html, fb2 等)
- `src/locales/` — 中英文案 JSON (zh-CN.json, en.json)
- `src/types/` — TypeScript 类型定义
- `src/utils/` — 纯函数工具

## 核心规则 (必须遵守)
1. **组件规范**: 必须使用 `<script setup lang="ts">`，禁止 Options API。
2. **组件长度**: 单个组件超过 250 行，必须拆分或提取为 Composable。
3. **国际化 (i18n)**: 所有用户可见文案必须走 `$t('key')`，禁止硬编码中文或英文。
4. **依赖限制**: 禁止引入 Pinia、Vue Router、Element Plus 等未选型依赖。
5. **隐私红线**: 禁止发起任何网络请求上传用户文档或进度。
6. **TTS 调用**: 必须通过 `TTSEngineManager`，禁止直接调用 `speechSynthesis`。
7. **存储操作**: IndexedDB 操作必须通过 `useStorage` 或 `src/stores/`，禁止在组件内直接开库。
8. **提交信息**: 使用 Conventional Commits，中文描述，如 `feat(player): 添加进度保存`。
9. **语言文件**: 新增文案 key 必须同时更新 `zh-CN.json` 和 `en.json`。
10. **伪装模板**: 组件放 `src/components/disguise/`，模板内不出现任何小说文字。

## 命名约定
- 组件文件: PascalCase (如 `PlayerView.vue`)
- Composable: `use` 前缀 + camelCase (如 `useTTS.ts`)
- 工具函数: camelCase (如 `encoding.ts`)
- CSS 类名: kebab-case
- 常量: UPPER_SNAKE_CASE

## 常用命令
- `pnpm dev` — 启动开发服务器
- `pnpm build` — 构建生产版本 (含类型检查)
- `pnpm test` — 运行单元测试
- `pnpm test:e2e` — 运行 E2E 测试
- `pnpm lint:fix` — 代码检查并自动修复
- `pnpm format` — 格式化代码
- `pnpm type-check` — 类型检查

## 代码风格
- 缩进: 2 空格
- 引号: 单引号
- 分号: 保留
- 行宽: 100 字符
- 尾随逗号: ES5

## 参考文档
- 产品需求: `docs/PRD.md`
- 架构设计: `docs/ARCHITECTURE.md`
- 贡献指南: `docs/CONTRIBUTING.md`