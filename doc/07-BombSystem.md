# 07 - BombSystem — 炸弹系统

**文件路径**: `src/core/BombSystem.ts` (203 行)

## 概述

管理炸弹的放置、物理、引信、爆炸、与方块碰撞。**无 Phaser 依赖**。

## 接口

### BombData

```typescript
interface BombData {
  x: number; y: number;     // 像素位置
  vy: number;               // 垂直速度
  timer: number;            // 引信剩余时间（ms）
  grounded: boolean;        // 是否着地
}
```

### ExplosionData

```typescript
interface ExplosionData {
  cells: { col: number; row: number }[];  // 爆炸范围格子
  timer: number;                           // 爆炸动画剩余时间
}
```

### ExplosionResult

```typescript
interface ExplosionResult {
  destroyedCells: { col: number; row: number }[];  // 实际摧毁的格子
  bombCol: number; bombRow: number;                 // 炸弹网格坐标
  hurtCharDist: number;                             // 到角色的切比雪夫距离
}
```

## 类：BombSystem

### 属性

| 属性 | 说明 |
|------|------|
| `bombCount` | 当前持有炸弹数 |
| `bombs` | `BombData[]` — 场上活跃炸弹列表 |
| `explosions` | `ExplosionData[]` — 活跃爆炸效果 |
| `maxBombs` (getter) | 炸弹上限 = `BOMB_MAX_COUNT + upgrades.bombMaxCountBonus` |

### 核心方法

| 方法 | 说明 |
|------|------|
| `addBomb()` | 持有炸弹+1（不超过上限） |
| `placeBomb(charX, charY)` | 在角色脚下放置炸弹，持有-1 |
| `updateBombs(delta)` | 更新所有炸弹的物理和引信，返回待爆炸索引 |
| `explodeBomb(index, charX, charY)` | 执行爆炸：摧毁格子、计算伤害距离 |
| `updateExplosions(delta)` | 更新爆炸动画计时器 |
| `checkPieceBombCollision(piece)` | 检测下落方块是否碰到炸弹 |
| `reset()` | 重置所有炸弹状态 |

### 炸弹生命周期

1. **放置** — 角色按 E，在角色脚底生成
2. **下落** — 受重力影响（800 px/s²），与棋盘碰撞
3. **引信** — 2000ms 倒计时，特定时刻触发滴答声
4. **爆炸** — 摧毁爆破半径内所有格子，产生爆炸视觉效果
5. **方块碰撞** — 下落方块碰到炸弹时提前引爆

### 爆破半径

- 基础爆破半径：1 格（3×3 范围）
- 伤害半径：2 格（切比雪夫距离）
- `bombBlastRadiusBonus` 升级可增加爆破半径

### 炸弹获取

- 每次方块锁定 → `bombCount++`（不超过上限）
- 初始上限：3 个

### 依赖

- `constants.ts` — 炸弹相关常量
- `BoardModel` — 碰撞检测、格子摧毁
- `PlayerUpgrades` — 爆破半径和上限升级

### 扩展建议

- 支持不同类型炸弹（定时/遥控/连锁）
- 支持炸弹升级（威力、范围、特殊效果）
- 炸弹与消行联动（连锁爆炸）
