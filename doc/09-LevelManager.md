# 09 - LevelManager — 关卡管理器

**文件路径**: `src/core/LevelManager.ts` (24 行)

## 概述

管理关卡（Stage）进度，追踪当前关卡和已消行数。

## 类：LevelManager

### 属性

| 属性 | 类型 | 初始值 | 说明 |
|------|------|--------|------|
| `currentStage` | `number` | 1 | 当前关卡编号 |
| `linesThisStage` | `number` | 0 | 当前关卡已消行数 |

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `getTargetLines()` | `() => number` | 获取当前关卡目标行数 |
| `onLinesCleared(count)` | `(count) => boolean` | 消行回调，返回是否通关 |
| `advanceStage()` | `() => void` | 进入下一关 |
| `reset()` | `() => void` | 重置到第1关 |

### 目标行数公式

```
target = 5 + (currentStage - 1) * 3
```

| 关卡 | 目标行数 |
|------|----------|
| 1 | 5 |
| 2 | 8 |
| 3 | 11 |
| 4 | 14 |
| 5 | 17 |

### 通关流程

1. 消行 → `onLinesCleared(count)`
2. 达到目标 → 返回 `true`
3. `GameScene` 显示卡牌选择
4. 玩家选牌 → `advanceStage()` → 继续游戏

### 局限性

- 关卡配置完全由公式生成，无差异化
- 无关卡专属规则（特殊方块、速度、棋盘布局等）
- 无关卡数量上限
- 与 `TetrisEngine.level`（速度等级）是两套独立系统

### 依赖

- 无外部依赖

### 扩展建议

- 引入关卡配置接口，支持每关不同参数：
  ```typescript
  interface StageConfig {
    targetLines: number;
    initialDropInterval?: number;
    prefillPattern?: number[][];
    availablePieces?: number[];
    availableCards?: UpgradeId[];
    specialRules?: string[];
  }
  ```
- 关卡配置从 JSON/TS 数据文件加载
- 支持关卡主题（颜色、背景）
- 统一 TetrisEngine.level 与 LevelManager 的关系
