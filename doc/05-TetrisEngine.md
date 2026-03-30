# 05 - TetrisEngine — 俄罗斯方块引擎

**文件路径**: `src/core/TetrisEngine.ts` (272 行)

## 概述

管理方块（Tetromino）的完整生命周期：生成、移动、旋转、重力、锁定、消行、计分。**无 Phaser 依赖**。

## 接口：ActivePiece

```typescript
interface ActivePiece {
  type: number;      // 方块类型 0-7
  rotation: number;  // 旋转状态 0-3
  x: number;         // 棋盘列坐标
  y: number;         // 棋盘行坐标（可为负数）
}
```

## 类：TetrisEngine

### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `activePiece` | `ActivePiece` | 当前方块 |
| `nextType` | `number` | 下一个方块类型 |
| `pieceFollowing` | `boolean` | 是否跟随角色 |
| `lockTimer` | `number` | 锁定计时器 |
| `isLocking` | `boolean` | 是否在锁定延迟中 |
| `lockMoves` | `number` | 锁定延迟内移动计数 |
| `dropTimer` | `number` | 下落计时器 |
| `dropInterval` | `number` | 当前下落间隔（ms） |
| `score` | `number` | 分数 |
| `level` | `number` | 等级（每10行+1） |
| `lines` | `number` | 总消行数 |

### 核心方法

| 方法 | 说明 |
|------|------|
| `spawnPiece()` | 生成新方块，返回是否成功（失败=游戏结束） |
| `movePiece(dx, dy)` | 移动方块，锁定延迟内移动会重置计时器 |
| `rotatePiece(direction)` | 旋转方块，支持 SRS 墙踢 |
| `lockPiece()` | 锁定方块到棋盘，返回写入的格子列表 |
| `hardDrop()` | 硬降到底部，取消跟随模式 |
| `applyGravity(delta)` | 应用重力，返回是否移动和是否该锁定 |
| `updateLock(delta)` | 更新锁定延迟，返回是否该锁定 |
| `updateFollowing(charX)` | 跟随角色X位置（仅 `pieceFollowing=true`） |
| `checkLines()` | 检测满行 |
| `clearLines(rows)` | 消行并更新分数/等级 |
| `addBombScore(count, mult)` | 炸弹摧毁得分 |
| `getGhostY()` | 获取幽灵方块Y位置（硬降预测） |

### 关键机制

#### 跟随模式
- 新方块默认跟随角色 X 位置
- 按 W/Drop 按钮或硬降（S）取消跟随
- `updateFollowing()` 计算目标列，尝试对齐角色中心

#### SRS 旋转系统
- 支持 J/L/S/T/Z 和 I 方块的不同墙踢表
- 旋转失败时依次尝试 5 个偏移位置

#### 锁定延迟
- 方块触底后进入 500ms 锁定延迟
- 移动/旋转可重置延迟（最多 15 次）
- 超过次数或超时则强制锁定

#### 等级系统
- 每 10 行升一级
- 下落间隔 = `max(50, 800 - (level-1) * 40)` ms
- **注意**：此等级与 `LevelManager.currentStage` 独立

### 依赖

- `constants.ts` — 大量常量
- `BoardModel` — 棋盘数据

### 扩展建议

- 支持 7-bag 随机算法替代纯随机
- 支持方块包（bag）配置，关卡可自定义可用方块
- 将等级系统与 LevelManager 统一
- 支持Hold功能（暂存方块）
