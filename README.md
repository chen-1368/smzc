# 神魔战场数值查询

这是造梦无双这款游戏的数值查询工具，专门查询在神魔战场中，各个角色、坐骑、魔王、中立怪和水晶的数值，包括阪泉之野、神魔战场。
内置爬虫脚本、提取脚本，当游戏更新时，调用爬虫脚本，从 CDN 获取配置文件，并调用提取脚本，解析配置文件的数据，并保存到 `src/data/godwar.json` 文件中。
各项数据以表格的形式展示，支持筛选、排序、搜索。

## 技术栈

### 前端

- React 18
- Vite 6
- Tailwind CSS

### 数据流水线

- Node.js (CommonJS)
- Acorn (JavaScript 解析器)

## 快速开始

### 安装依赖

```bash
npm install
```

### 数据流水线

1. **爬取配置文件**

   ```bash
   node scripts/01-crawl.cjs
   ```

   从 CDN 下载 11 个配置文件到 `godWar-configs/` 目录。

2. **提取数据**

   ```bash
   node scripts/02-extract.cjs
   ```

   解析配置文件并输出 `src/data/godwar.json`。

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

## 项目结构

```
.
├── scripts/
│   ├── 01-crawl.cjs      # 爬取 CDN 配置文件
│   └── 02-extract.cjs    # 提取结构化数据
├── godWar-configs/       # 原始配置文件（爬取产物）
├── src/
│   ├── data/
│   │   └── godwar.json   # 提取的结构化数据
│   ├── components/       # React 组件
│   ├── App.jsx          # 主应用入口
│   └── main.jsx         # 渲染入口
├── dist/                # 构建产物
└── package.json
```

## 注意事项

- CDN 对目录列表返回 **403**，脚本先从 `settings.js` 解析精确文件路径再下载
- 配置文件的哈希后缀（如 `.6acdd.js`）随游戏版本变化，需重新获取 `settings.js` 以拿到最新哈希
- 配置文件格式为 **JS 数组**（非 JSON）：`var tmp=[[表头],[数据行],...];`
- 脚本使用 **CommonJS**（`require`）；Web 应用使用 **ESM**（Vite + React）

## 许可证

本项目仅供学习和研究使用。
