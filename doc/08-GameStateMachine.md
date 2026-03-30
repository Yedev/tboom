# 08 - GameStateMachine — 游戏状态机

**文件路径**: `src/core/GameStateMachine.ts` (59 行)

## 概述

基于有限状态机（FSM）管理游戏全局状态，确保状态转换合法。

## 枚举：GameState

| 状态 | 值 | 说明 |
|------|-----|------|
| `PLAYING` | `'playing'` | 正常游戏 |
| `PAUSED` | `'paused'` | 暂停 |
| `CLEARING_LINES` | `'clearing_lines'` | 消行动画中 |
| `STAGE_CLEAR` | `'stage_clear'` | 关卡通卡，等待选牌 |
| `GAME_OVER` | `'game_over'` | 游戏结束 |

## 类型：StateEvent

```
'pause' | 'unpause' | 'linesDetected' | 'animDone' |
'stageClear' | 'cardSelected' | 'characterDied' | 'pieceOverlap' | 'restart'
```

## 状态转换表

| 当前状态 | 事件 | 目标状态 |
|----------|------|----------|
| PLAYING | `pause` | PAUSED |
| PLAYING | `linesDetected` | CLEARING_LINES |
| PLAYING | `characterDied` / `pieceOverlap` | GAME_OVER |
| PAUSED | `unpause` | PLAYING |
| CLEARING_LINES | `animDone` | PLAYING |
| CLEARING_LINES | `stageClear` | STAGE_CLEAR |
| STAGE_CLEAR | `cardSelected` | PLAYING |
| GAME_OVER | `restart` | PLAYING |

## 类：GameStateMachine

### 方法

| 方法 | 说明 |
|------|------|
| `transition(event)` | 触发事件，返回是否成功转换 |
| `getState()` | 获取当前状态 |
| `isPlaying()` / `isPaused()` / ... | 状态检查快捷方法 |
| `reset()` | 重置为 PLAYING |

### 关键行为

- 非法事件被静默忽略（返回 `false`）
- 转换成功返回 `true`

## 依赖

- 无外部依赖

## 扩展建议

- 可添加 `STAGE_INTRO` 状态用于关卡过渡动画
- 可添加 `MENU` 状态用于游戏内菜单
- 可添加状态进入/退出回调机制
- 可记录状态历史用于调试
