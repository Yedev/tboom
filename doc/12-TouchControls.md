# 12 - TouchControls — 触控系统

**文件路径**: `src/TouchControls.ts` (361 行)

## 概述

移动端触控覆盖层，提供虚拟方向键和功能按钮。支持多点触控。

## 布局

```
     [放置]              [暂停]
  ┌──┐  ┌──┐         ┌──────┐
  │←│  │→│          │ 旋转  │
  └──┘  └──┘      ┌──────┐ ┌──────┐
     [速降]        │ 炸弹  │ │ 跳跃  │
                  └──────┘ └──────┘
```

- 左侧：D-Pad 方向键（左/右移动，上=放置，下=速降）
- 右侧：圆形按钮组（跳跃=大按钮，旋转+炸弹=小按钮，暂停=小按钮）

## 内部数据结构

### DpadButton

```typescript
interface DpadButton {
  dir: 'left' | 'right' | 'up' | 'down' | null;
  x: number; y: number; w: number; h: number;
  pressed: boolean;
  consumed: boolean;
  pointerId: number;
}
```

### RoundButton

```typescript
interface RoundButton {
  cx: number; cy: number; r: number;
  label: string; color: number;
  pressed: boolean; consumed: boolean;
  pointerIds: Set<number>;      // 支持多指
  graphics: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
}
```

## 类：TouchControls

### 生命周期

1. **构造** — 仅在触控设备上创建（`this.sys.game.device.input.touch`）
2. **初始化** — 创建 D-Pad 和按钮的 Graphics + Text
3. **事件监听** — `pointerdown/up/cancel/move`
4. **每帧更新** — 脏标记检测，仅在状态变化时重绘

### 公开 API

| 方法 | 说明 |
|------|------|
| `isLeftDown()` | 左键是否按下（持续） |
| `isRightDown()` | 右键是否按下（持续） |
| `consumeJump()` | 消费跳跃输入（一次性） |
| `consumeBomb()` | 消费炸弹输入 |
| `consumeRotate()` | 消费旋转输入 |
| `consumeDrop()` | 消费放置/脱离输入 |
| `consumeHardDrop()` | 消费硬降输入 |
| `consumePause()` | 消费暂停输入 |
| `update()` | 每帧更新（脏标记渲染） |
| `destroy()` | 清理所有 Graphics |

### 脏标记优化

- 跟踪每个按钮的上一帧状态
- 只有状态变化时才重绘
- `dirty` 标记强制重绘

### 多点触控

- 支持最多 4 个触点（`scene.input.addPointer(3)`）
- 每个按钮用 `Set<number>` 跟踪关联的触点 ID
- D-Pad 使用单一 `pointerId` 跟踪

### 依赖

- `Phaser.Scene`
- `constants.ts` — 布局常量

## 扩展建议

- 按钮位置支持配置化
- 支持透明度/大小自定义
- 添加触觉反馈（Vibration API）
