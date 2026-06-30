# AGENTS.md

本文件为 AI 代理在本仓库中工作时提供指引。

## 项目概述

爬取并可视化**造梦无双**游戏配置文件（Cocos2d-js H5 CDN 客户端）。流水线：爬取原始 JS 配置 → 提取结构化 JSON → React Web 应用展示。

## 常用命令

- **爬取配置**：`node scripts/01-crawl.js` — 下载 11 个配置文件到 `godWar-configs/`
- **提取数据**：`node scripts/02-extract.js` — 解析配置 → 输出 `data/godwar.json`
- **Web 开发服务器**：`cd web && npm run dev` — Vite + React 本地启动
- **Web 构建**：`cd web && npm install && npm run build`
- 未配置测试或代码检查工具。

## 注意事项

- CDN 对目录列表返回 **403**，必须先从 `settings.js` 的 jsList 解析出精确文件路径再下载。
- 配置文件的哈希后缀（如 `.6acdd.js`）随游戏版本变化，需重新获取 `settings.js` 以拿到最新哈希。
- 配置文件格式为 **JS 数组**（非 JSON）：`var tmp=[[表头],[数据行],...];`。
- 脚本使用 **CommonJS**（`require`）；Web 应用使用 **ESM**（Vite + React）。

## 仓库规范

- 所有代码、注释和界面文字使用**中文**。
- 流水线脚本按编号命名（`01-crawl.js`、`02-extract.js`），新增步骤请遵循此模式。
- 提交信息使用中文。
