# 03 - events.ts — 事件常量定义

**文件路径**: `src/events.ts` (23 行)

## 概述

定义用于子系统解耦通信的事件名称常量。

## 事件列表

| 事件名 | 常量 | 说明 |
|--------|------|------|
| 方块锁定 | `PIECE_LOCKED` | 方块锁定到棋盘，payload: `{ cells }` |
| 方块移动 | `PIECE_MOVED` | 活动方块位置/旋转变化 |
| 消行 | `LINES_CLEARED` | 检测到满行，payload: `{ rows }` |
| 棋盘变化 | `BOARD_CHANGED` | 棋盘格子发生变化（锁定/消行/炸弹） |
| 炸弹爆炸 | `BOMB_EXPLODED` | 炸弹引爆，payload: `{ col, row, destroyedCells }` |
| 角色死亡 | `CHARACTER_DIED` | 角色HP归零 |
| 状态切换 | `STATE_CHANGED` | 游戏状态转换，payload: `{ from, to }` |

## 当前状态

**未被任何模块导入使用。** 预留为未来事件总线的基础。

当前子系统间通信通过 `GameScene` 直接方法调用实现。

## 设计意图

使用 Phaser 的 EventEmitter 或自定义事件总线时，这些常量将作为事件名使用，实现子系统间松耦合。

## 扩展建议

- 在 `GameScene` 中集成事件总线，用这些常量替代直接方法调用
- 可减少 GameScene 作为"上帝类"的复杂度
- 为每个事件定义明确的 payload 类型
