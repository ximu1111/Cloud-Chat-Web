# AGENTS.md - 云间智聊

## 项目概览
云间智聊是一个基于 Vue3 + TypeScript + Pinia + Tailwind CSS 的 AI 对话 Web 应用，支持实时流式对话、多格式文件上传解析、会话管理功能。

## 技术栈
- **框架**: Vue 3.5 (Composition API + `<script setup>`)
- **语言**: TypeScript 5.7
- **状态管理**: Pinia 3
- **路由**: Vue Router 4
- **样式**: Tailwind CSS v4 (使用 @theme 自定义设计令牌)
- **构建工具**: Vite 6
- **Markdown 渲染**: marked
- **代码高亮**: highlight.js
- **后端**: Vite 插件中间件 (api/)

## 目录结构
```
.
├── src/
│   ├── main.ts              # 应用入口
│   ├── App.vue              # 根组件
│   ├── assets/main.css      # 全局样式 + Tailwind + 自定义主题
│   ├── components/
│   │   ├── Sidebar.vue      # 会话管理侧边栏
│   │   ├── MessageList.vue  # 消息列表
│   │   ├── MessageBubble.vue # 消息气泡 (含 Markdown 渲染)
│   │   └── ChatInput.vue    # 输入框 + 文件上传
│   ├── views/
│   │   └── ChatView.vue     # 主对话页面
│   ├── stores/
│   │   ├── conversation.ts  # 会话状态管理 (Pinia)
│   │   └── chat.ts          # 聊天 UI 状态管理 (Pinia)
│   ├── utils/
│   │   ├── sse.ts           # SSE 流式通信工具
│   │   └── file.ts          # 文件上传工具 (校验/读取)
│   └── types/
│       └── index.ts         # TypeScript 类型定义
├── api/
│   ├── index.ts             # Vite API 插件 (中间件注册)
│   └── handlers/
│       └── chat.ts          # 聊天 API 处理器 (SSE 流式响应)
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── .coze                    # 部署配置
└── DESIGN.md                # 设计规范
```

## 构建和运行命令
```bash
# 开发环境
pnpm run dev          # 启动开发服务器 (Vite HMR)

# 生产构建
pnpm run build        # 构建生产版本
pnpm run preview      # 预览生产构建

# 代码检查
npx vue-tsc --noEmit  # TypeScript 类型检查
```

## 核心功能
1. **SSE 流式对话**: 基于 Fetch + ReadableStream 实现 AI 文字逐字流式输出
2. **会话管理**: 支持创建、切换、删除对话，数据持久化到 localStorage
3. **文件上传**: 支持文档 (TXT/MD/CSV/JSON/PDF/DOC/DOCX) 和图片 (PNG/JPG/GIF/WEBP) 上传
4. **Markdown 渲染**: AI 回复支持 Markdown 格式渲染
5. **响应式布局**: 适配 PC (>1024px)、平板 (768-1024px)、移动端 (<768px)

## 设计规范
详见 `DESIGN.md`，核心设计令牌定义在 `src/assets/main.css` 的 `@theme` 块中。

## 注意事项
- 端口通过环境变量 `DEPLOY_RUN_PORT` 获取，禁止硬编码
- 字体使用 Google Fonts CN 域名 (`fonts.googleapis.cn`)
- 文件上传限制 10MB，支持格式见 `src/utils/file.ts`
