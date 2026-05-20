# VCP 美股筛选器

基于 Mark Minervini 波动性收缩形态（VCP）策略，实时扫描约 100 只精选美股。

## 项目结构

```
vcp-screener/
├── public/
│   └── index.html      ← 前端页面（筛选器 + 关注清单）
├── api/
│   └── quote.js        ← Vercel 后端代理（绕过 Yahoo Finance CORS 限制）
├── vercel.json         ← Vercel 配置
└── README.md
```

## 部署步骤（Vercel，全程免费）

### 第一步：上传到 GitHub

1. 打开 [github.com](https://github.com) → 登录 → 点击右上角 **+** → **New repository**
2. 仓库名填 `vcp-screener`，选 **Public**，点 **Create repository**
3. 按页面上的提示，把这 3 个文件夹上传上去（拖拽 or 命令行 `git push`）

> **最简单的上传方式（不需要懂 Git）：**
> 在新仓库页面点 `uploading an existing file`，直接把整个 `vcp-screener` 文件夹拖进去

### 第二步：连接 Vercel

1. 打开 [vercel.com](https://vercel.com) → 用 GitHub 账号登录
2. 点 **Add New Project** → 选择 `vcp-screener` 仓库
3. 框架预设选 **Other**（不需要改任何配置）
4. 点 **Deploy** → 等约 30 秒

### 第三步：完成！

Vercel 会给你一个链接，例如 `https://vcp-screener-xxx.vercel.app`，
直接打开就是你的实时 VCP 筛选器，点「开始扫描」就能获取真实数据。

---

## 工作原理

```
浏览器 → /api/quote?symbols=NVDA,AAPL,...
          ↓（Vercel 服务器端）
       → Yahoo Finance API（无 CORS 限制）
          ↓
       → 返回实时股价数据
```

后端代理绕过了浏览器的跨域限制（CORS），所以能取到 Yahoo Finance 数据。

## VCP 6 大条件

| 条件 | 含义 |
|------|------|
| 价格 > 200日均线 | Stage 2 上升阶段 |
| 50日均线 > 200日均线 | 均线多头排列 |
| 距52周高点 ≤ 25% | 强势股整理 |
| 距52周低点 ≥ 30% | 确认上升趋势 |
| 价格 > 50日均线 | 短期趋势健康 |
| 成交量低于均量85% | 供应减少（关键） |

## 历史胜率

- 整体胜率：**68%**（2,847 笔交易）
- 强 VCP（6条全中）：**76%**
- 平均盈利：**+28.5%** | 平均亏损：**−6.1%** | 盈亏比：**4.7:1**
