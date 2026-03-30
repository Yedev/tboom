# 10 - PlayerUpgrades — 升级卡牌系统

**文件路径**: `src/core/PlayerUpgrades.ts` (63 行)

## 概述

定义升级卡牌和管理玩家的升级状态。每通过一关可选择一张卡牌。

## 类型与接口

### UpgradeId

```typescript
type UpgradeId = 'jump_boost' | 'hp_boost' | 'speed_boost' |
                'bomb_radius' | 'bomb_capacity' | 'score_multiplier';
```

### UpgradeCard

```typescript
interface UpgradeCard {
  id: UpgradeId;
  name: string;          // 中文名
  description: string;   // 中文描述
  color: number;         // 卡牌主题色
}
```

## 卡牌列表

| ID | 名称 | 效果 | 颜色 |
|----|------|------|------|
| `jump_boost` | 弹簧腿 | 跳跃高度 +25% | 0x44aaff |
| `hp_boost` | 铁甲心 | 最大血量 +2 | 0xff4444 |
| `speed_boost` | 疾步者 | 移动速度 +20% | 0x44ff88 |
| `bomb_radius` | 烈焰弹 | 炸弹范围 +1格 | 0xff8800 |
| `bomb_capacity` | 弹药库 | 炸弹上限 +1 | 0xffcc00 |
| `score_multiplier` | 财神附体 | 得分倍率 +50% | 0xcc44ff |

## 类：PlayerUpgrades

### 属性

| 属性 | 初始值 | 效果 |
|------|--------|------|
| `jumpVelocityMult` | 1.0 | 跳跃力度倍率 |
| `maxHpBonus` | 0 | 额外最大HP |
| `moveSpeedMult` | 1.0 | 移动速度倍率 |
| `bombBlastRadiusBonus` | 0 | 额外爆破半径 |
| `bombMaxCountBonus` | 0 | 额外炸弹上限 |
| `scoreMultiplier` | 1.0 | 分数倍率 |

### 方法

| 方法 | 说明 |
|------|------|
| `applyCard(card)` | 应用卡牌效果，叠加对应属性 |
| `reset()` | 重置所有升级为初始值 |

### 效果叠加

所有效果都是**线性叠加**，无上限：
- 多次选择同一卡牌效果叠加（如 3 次弹簧腿 → `jumpVelocityMult = 1.75`）
- 无最大叠加次数限制

## 函数：pickRandomCards

```typescript
function pickRandomCards(count: number): UpgradeCard[]
```

从全部卡池中随机抽取指定数量，不放回。

### 抽卡规则

- 从 6 张牌中随机抽 3 张
- 不放回（一局抽卡不会重复）
- 每次通关都从完整池子重新抽取
- 无稀有度系统

## 局限性

- 卡牌定义硬编码，无法通过配置扩展
- 无稀有度分级
- 无卡牌解锁机制
- 无最大叠加限制
- 无关卡专属卡池
- 效果类型固定（6 种数值加成），无特殊效果

## 扩展建议

- 引入卡牌稀有度系统（普通/稀有/传说）
- 添加特殊效果卡牌（如：二段跳、临时无敌、时间减速）
- 支持关卡专属卡池配置
- 添加最大叠加限制
- 引入卡牌互斥/协同机制
- 将卡牌数据抽取为外部配置文件
