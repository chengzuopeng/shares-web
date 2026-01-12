# 一日持股法分析工具 (Stock Analysis Web)

基于 React + TypeScript 的 A 股短线选股分析工具，旨在辅助"一日持股法"策略，通过多维度数据筛选出具有上涨潜力的个股。

## 核心功能

- **智能选股**：集成 `stock-sdk`，实时获取全市场 A 股行情数据。
- **多维筛选**：
    - **基础指标**：支持市值、换手率、量比、涨跌幅等范围筛选。
    - **分时分析**：采用分时均价线支撑算法，计算股价在均价线上方的运行时间比例，量化盘口强度。
    - **排除风险**：支持一键过滤 ST/*ST 风险股。
- **交互体验**：
    - 沉浸式粒子背景与流体 UI 动效 (Framer Motion)。
    - 多主题支持（默认 Cyber 风格）。
    - 实时扫描进度反馈。
- **响应式设计**：完美适配桌面端与移动端浏览器。

## 技术栈

- **核心框架**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 动效**: [Framer Motion](https://www.framer.com/motion/)
- **图标库**: [Lucide React](https://lucide.dev/)
- **数据处理**: stock-sdk
- **样式方案**: CSS Modules / Native CSS

## 快速开始

### 前置要求
- Node.js >= 18.0.0
- Yarn (推荐) 或 npm/pnpm

### 安装及运行

1. **安装依赖**

```bash
yarn install
```

2. **启动开发服务器**

```bash
yarn dev
```

3. **构建生产版本**

```bash
yarn build
```

## 默认筛选策略

系统预设了经典的"首板/强势股低吸"辅助策略模型（支持在页面动态调整）：

| 指标 | 默认范围/值 | 说明 |
|------|------------|------|
| **流通市值** | 50亿 - 200亿 | 锁定流动性好且弹性大的中小盘个股 |
| **涨跌幅** | +3% ~ +5% | 寻找处于上升趋势但未加速的个股 |
| **换手率** | 5% - 10% | 确保人气活跃，资金介入明显 |
| **量比** | > 1.2 | 排除无量上涨，确认资金合力 |
| **分时强度** | > 80% | 核心指标：股价全天80%时间在均价线上方 |
| **排除 ST** | 开启 | 规避退市风险股 |

## 目录结构

```
src/
├── components/          # 业务与 UI 组件
│   ├── FilterCard/      # 筛选条件配置卡片
│   ├── StockCard/       # 股票结果展示卡片
│   ├── StartButton/     # 启动按钮
│   ├── LoadingOverlay/  # 加载状态遮罩
│   └── ...
├── types/               # TypeScript 类型定义
├── App.tsx              # 主业务逻辑（筛选流程控制）
├── index.css            # 全局样式与变量
└── main.tsx             # 入口文件
```

## 许可证

[MIT](./LICENSE)
