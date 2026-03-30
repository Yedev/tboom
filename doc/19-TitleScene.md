# 19 - TitleScene — 标题场景

**文件路径**: `src/scenes/TitleScene.ts` (132 行)

## 概述

游戏启动后的第一个场景，显示标题、游戏说明和装饰元素。

## 类：TitleScene

### 场景结构

```
┌────────────────────────────┐
│   ○○ (装饰方块)     ○○    │
│                            │
│        T-BOOM              │  ← 主标题（金色 68px）
│    TETRIS + PLATFORMER     │  ← 副标题
│   ──────────────────       │  ← 分割线
│     — How to Play —        │
│   Jump on locked blocks    │
│   Place bombs to destroy   │
│   Clear lines for stages   │
│   Choose upgrades!         │
│   Avoid being crushed!     │  ← 红色警告
│                            │
│   A/D Move  Space Jump     │  ← 操作说明
│   Q Rotate  W Drop         │
│                            │
│   Press SPACE / Tap Start  │  ← 闪烁提示
│                            │
│   ○○○ (装饰方块)    ○○○   │
└────────────────────────────┘
```

### 功能

- 绘制装饰性俄罗斯方块（四角分布）
- 标题带发光效果（偏移 2px 的半透明底层）
- 620ms 间隔闪烁的 "Press SPACE / Tap to Start" 提示
- 键盘（Space/Enter）或触控点击进入 `GameScene`

### 装饰方块

左右两侧各分布若干彩色方块，模拟 I/T/Z/S 方块：
- 左上：I 方块（青色）
- 左下：T 方块（紫色）
- 右上：Z 方块（红色）
- 右下：S 方块（绿色）

每个方块 30×30px，带高光和阴影效果。

### 依赖

- `Phaser.Scene`
- `constants.ts` — 画布尺寸

## 扩展建议

- 添加背景动画（方块缓慢下落）
- 添加最高分显示
- 添加关卡选择入口
- 添加设置/音量调节
