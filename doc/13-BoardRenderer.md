# 13 - BoardRenderer — 棋盘渲染器

**文件路径**: `src/rendering/BoardRenderer.ts` (81 行)

## 概述

将 `BoardModel` 的二维数组数据渲染为可视化棋盘，支持脏标记优化和消行闪烁动画。

## 类：BoardRenderer

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `markDirty()` | `() => void` | 标记需要重绘 |
| `isDirty()` | `() => boolean` | 查询脏标记 |
| `render()` | `(board, clearingLines?, clearedRows?, clearAnimTimer?) => void` | 渲染棋盘 |
| `clear()` | `() => void` | 清空画布 |

### 渲染逻辑

1. 检查脏标记或消行动画状态，跳过不必要的重绘
2. 遍历 20×10 棋盘数组
3. 非零格子绘制彩色方块（含高光+阴影斜面效果）
4. 消行中的行：白/原色交替闪烁

### 脏标记机制

- 棋盘格子变化（锁定/消行/爆炸）→ `markDirty()`
- 渲染后自动清除脏标记
- 消行动画期间每帧都重绘（忽略脏标记）

### 方块绘制效果

每个方块（32×32px）包含：
- 主体填充色
- 顶部+左侧白色高光条（alpha 0.2）
- 底部+右侧黑色阴影条（alpha 0.3）
- 边框线

### 依赖

- `Phaser.Scene` — Graphics 对象
- `constants.ts` — 颜色、尺寸、动画参数

## 扩展建议

- 支持关卡主题色配置
- 支持不同棋盘背景样式
- 添加格子悬浮高亮效果
