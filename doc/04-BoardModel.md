# 04 - BoardModel — 棋盘数据模型

**文件路径**: `src/core/BoardModel.ts` (69 行)

## 概述

纯数据模型，管理 10×20 俄罗斯方块棋盘的格子状态。**无 Phaser 依赖**，可独立单元测试。

## 类：BoardModel

### 数据结构

- `board: number[][]` — 20行×10列的二维数组
- 值含义：`0` = 空，`1-7` = 对应方块类型（I/J/L/O/S/T/Z）

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `init()` | `() => void` | 初始化为全零棋盘 |
| `getBoard()` | `() => number[][]` | 获取棋盘数组引用 |
| `getCell()` | `(row, col) => number` | 获取指定格子值 |
| `setCell()` | `(row, col, value) => void` | 设置格子值（边界检查） |
| `clearCell()` | `(row, col) => void` | 清空格子 |
| `isCellEmpty()` | `(row, col) => boolean` | 格子是否为空 |
| `isInBounds()` | `(row, col) => boolean` | 坐标是否在范围内 |
| `getFullRows()` | `() => number[]` | 返回满行的行号（从底到顶） |
| `removeRows()` | `(rows) => void` | 移除指定行，顶部补空行 |

### 关键行为

- `getBoard()` 返回内部数组的**直接引用**（非拷贝），性能优先
- `removeRows()` 排序后从低到高逐行 `splice` + `unshift`
- 边界检查：`isCellEmpty()` 对越界坐标返回 `false`

## 依赖

- `constants.ts` — `COLS`, `ROWS`

## 被依赖

- `TetrisEngine` — 方块锁定、消行
- `CharacterPhysics` — 角色碰撞检测
- `BombSystem` — 炸弹碰撞、爆炸摧毁
- `BoardRenderer` — 读取棋盘数据进行渲染

## 扩展建议

- 可添加预填充棋盘方法，用于关卡初始布局
- 可添加 `loadFromConfig(data)` 方法支持关卡配置加载
- 可添加 `clone()` 方法用于状态快照/回退
