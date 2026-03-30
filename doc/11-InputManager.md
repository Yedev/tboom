# 11 - InputManager — 输入管理器

**文件路径**: `src/input/InputManager.ts` (77 行)

## 概述

统一管理键盘和触控输入，提供 OR 逻辑合并的输入接口。

## 接口

### CharacterInput

```typescript
interface CharacterInput {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;      // 按下触发（JustDown）
  bomb: boolean;      // 按下触发（JustDown）
}
```

### TetrisInput

```typescript
interface TetrisInput {
  rotate: boolean;    // 按下触发
  drop: boolean;      // 按下触发
  hardDrop: boolean;  // 按下触发
}
```

### SystemInput

```typescript
interface SystemInput {
  pause: boolean;
  restart: boolean;
}
```

## 类：InputManager

### 键盘映射

| 键 | 功能 | 输入类型 |
|----|------|----------|
| A | 角色左移 | 持续 (isDown) |
| D | 角色右移 | 持续 (isDown) |
| Space | 跳跃 | 按下 (JustDown) |
| E | 放置炸弹 | 按下 (JustDown) |
| Q | 旋转方块 | 按下 (JustDown) |
| W | 放置/脱离跟随 | 按下 (JustDown) |
| S | 硬降 | 按下 (JustDown) |
| P | 暂停/恢复 | 按下 (JustDown) |
| R | 重新开始 | 按下 (JustDown) |

### 方法

| 方法 | 说明 |
|------|------|
| `getCharacterInput()` | 获取角色输入（键盘 OR 触控） |
| `getTetrisInput()` | 获取方块输入（键盘 OR 触控） |
| `getSystemInput()` | 获取系统输入（键盘 OR 触控） |

### 输入合并逻辑

```typescript
// 持续输入（移动）
moveLeft: keyA.isDown || touchControls.isLeftDown()

// 一次性输入（跳跃、炸弹等）
jump: JustDown(keySpace) || touchControls.consumeJump()
```

触控使用 `consume*()` 模式：按下时返回 `true` 并标记已消费，防止重复触发。

### 依赖

- `Phaser.Scene` — 键盘输入系统
- `TouchControls` — 触控输入（可选）

## 扩展建议

- 支持按键重映射
- 支持手柄输入
- 支持输入录制/回放
