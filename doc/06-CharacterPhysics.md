# 06 - CharacterPhysics — 角色物理系统

**文件路径**: `src/core/CharacterPhysics.ts` (288 行)

## 概述

管理角色的平台跳跃物理：重力、碰撞检测、受伤、挤压判定。**无 Phaser 依赖**。

## 接口

### CharacterInput

```typescript
interface CharacterInput {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  bomb: boolean;
}
```

### CharacterState

```typescript
interface CharacterState {
  x: number; y: number;           // 像素位置
  vx: number; vy: number;         // 速度
  grounded: boolean;              // 是否着地
  hp: number; alive: boolean;     // 生命
  invincibleTimer: number;        // 无敌计时器
  animTime: number;               // 动画时间
}
```

## 类：CharacterPhysics

### 属性

| 属性 | 说明 |
|------|------|
| `x, y` | 像素坐标 |
| `vx, vy` | 速度（px/s） |
| `hp` | 当前生命值 |
| `alive` | 是否存活 |
| `grounded` | 是否着地 |
| `invincibleTimer` | 无敌剩余时间（ms） |
| `animTime` | 动画累计时间 |
| `maxHp` (getter) | 最大HP = `CHAR_MAX_HP + upgrades.maxHpBonus` |

### 核心方法

| 方法 | 说明 |
|------|------|
| `update(delta, input)` | 主更新循环：输入→重力→碰撞→边界 |
| `takeDamage(amount)` | 受伤（无敌时间内无效） |
| `checkCrushOnLock()` | 方块锁定后检测挤压，返回是否被压 |
| `getState()` | 获取当前状态快照 |
| `reset()` | 重置所有状态 |
| `getCharCenterX/Y()` | 获取角色中心坐标 |

### 碰撞系统

采用**分轴碰撞检测**（AABB）：

1. **移动 X** → `resolveCollisionsX()` → 推出重叠
2. **移动 Y** → `resolveCollisionsY()` → 推出重叠，检测着地
3. 额外**地面探测**：在角色脚下 1px 处检测是否有方块

### 挤压检测

- 方块锁定后检查角色是否与新格子重叠
- 若被压：受 2 点伤害 + 传送到最近空位
- 找不到空位：直接死亡

### 受伤与无敌

- 受伤后进入 1500ms 无敌时间
- 无敌期间不受伤，渲染层闪烁效果
- HP 归零 → `alive = false`

### 升级系统集成

- `jumpVelocityMult` — 跳跃力度倍率
- `moveSpeedMult` — 移动速度倍率
- `maxHpBonus` — 额外最大HP

### 依赖

- `constants.ts` — 角色物理常量
- `BoardModel` — 碰撞检测用棋盘数据
- `PlayerUpgrades` — 升级倍率

### 扩展建议

- 可添加二段跳、冲刺等能力（配合升级卡牌）
- 可添加角色技能系统
- 可支持不同角色类型（不同物理参数）
