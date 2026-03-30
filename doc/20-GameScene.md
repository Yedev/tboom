# 20 - GameScene — 游戏主场景

**文件路径**: `src/scenes/GameScene.ts` (502 行)

## 概述

游戏的核心场景，作为**薄编排器**（Thin Orchestrator）创建所有子系统并协调其交互。

## 类：GameScene

### 管理的子系统

| 类别 | 系统 | 说明 |
|------|------|------|
| 核心 | `BoardModel` | 棋盘数据 |
| 核心 | `TetrisEngine` | 方块引擎 |
| 核心 | `CharacterPhysics` | 角色物理 |
| 核心 | `BombSystem` | 炸弹系统 |
| 核心 | `GameStateMachine` | 状态机 |
| 核心 | `LevelManager` | 关卡管理 |
| 核心 | `PlayerUpgrades` | 升级状态 |
| 渲染 | `BoardRenderer` | 棋盘绘制 |
| 渲染 | `PieceRenderer` | 方块绘制 |
| 渲染 | `CharacterRenderer` | 角色绘制 |
| 渲染 | `BombRenderer` | 炸弹绘制 |
| 渲染 | `UIRenderer` | UI 绘制 |
| 渲染 | `CardOverlay` | 卡牌选择 |
| 输入 | `InputManager` | 输入管理 |
| 输入 | `TouchControls` | 触控（仅移动端） |

### 生命周期

#### preload()

加载 9 个音频文件：
- `step`, `step2` — 脚步声
- `jump` — 跳跃
- `land` — 着地
- `tick` — 炸弹滴答
- `explode` — 爆炸
- `rotate` — 旋转
- `harddrop` — 硬降
- `place` — 放置

#### create()

1. 创建 `PlayerUpgrades` 和 `LevelManager`（最先创建）
2. 创建核心系统（BoardModel → TetrisEngine → Character → Bomb → StateMachine）
3. 创建输入系统（TouchControls → InputManager）
4. 创建渲染器
5. 加载音频引用
6. 生成第一个方块并初始化 UI

#### update(_time, delta)

主循环，按状态分发：

```
GAME_OVER → 检测重新开始输入
STAGE_CLEAR → 冻结游戏逻辑
PAUSED → 检测取消暂停
PLAYING → 完整游戏循环
```

### PLAYING 状态更新流程

1. 触控更新
2. 角色物理更新 + 音频
3. 角色死亡检测
4. 炸弹放置
5. 炸弹系统更新（物理+爆炸）
6. 消行动画更新（如正在消行）
7. 方块输入处理（旋转/放置/硬降）
8. 方块跟随更新
9. 方块重力
10. 锁定延迟
11. 渲染

### 核心流程

#### lockPiece() 流程

1. 锁定方块到棋盘
2. 检测角色挤压
3. 增加炸弹
4. 检测满行
5. 有满行 → 进入消行动画
6. 无满行 → 生成新方块

#### 消行完成流程

1. 执行消行，更新分数
2. 检查关卡目标
3. 关卡通过 → 显示卡牌选择
4. 玩家选牌 → 应用升级 → 继续
5. 未通关 → 直接生成新方块

#### 炸弹爆炸流程

1. 引信到时或方块碰撞触发
2. 计算爆炸范围和摧毁的格子
3. 计算角色伤害距离
4. 在范围内 → 角色受伤
5. 创建爆炸视觉效果
6. 更新分数

### 音频系统

| 音效 | 触发时机 |
|------|----------|
| step/step2 | 角色行走（250ms间隔交替） |
| jump | 跳跃时 |
| land | 着地瞬间 |
| tick | 炸弹滴答（引信特定时刻） |
| explode | 炸弹爆炸 |
| rotate | 方块旋转成功 |
| harddrop | 硬降 |
| place | 脱离跟随 |

### restart() 流程

1. 重置所有核心系统
2. 销毁动态 Graphics（炸弹/爆炸）
3. 重置音频状态
4. 清空渲染器
5. 重新生成方块

### 依赖

- 所有 core/ 模块
- 所有 rendering/ 模块
- InputManager, TouchControls
- constants.ts

## 架构问题

- **502行偏大**：作为编排器承担了较多逻辑
- **直接方法调用**：未使用 events.ts 的事件系统
- **重复代码**：`updateBombSystem()` 和 `checkAndExplodeBombCollisions()` 有相似的爆炸处理逻辑
- **Graphics 管理**：炸弹/爆炸的 Graphics 创建销毁在 GameScene 中管理

## 扩展建议

- 引入事件总线替代直接调用，降低 GameScene 复杂度
- 将炸弹 Graphics 管理提取到专门的类
- 添加关卡过渡动画
- 添加暂停菜单场景
- 分离音频管理为独立模块
