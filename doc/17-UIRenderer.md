# 17 - UIRenderer — UI 渲染器

**文件路径**: `src/rendering/UIRenderer.ts` (164 行)

## 概述

渲染游戏侧边面板的所有 UI 元素：分数、等级、行数、关卡进度、下一方块预览、操作帮助、游戏结束覆盖层。

## 类：UIRenderer

### 布局

侧边面板位于 x=390，所有 Y 坐标相对于 BOARD_Y (40)：

| 元素 | Y偏移 | 说明 |
|------|-------|------|
| SCORE 标签/值 | 0 / 22 | 分数 |
| LEVEL 标签/值 | 56 / 78 | 等级 |
| LINES 标签/值 | 112 / 130 | 总消行数 |
| STAGE 标签/值/进度 | 156 / 174 / 192 | 当前关卡 + 进度 |
| NEXT 标签/预览 | 218 / 240 | 下一方块预览 |
| HP 标签 | 310 | 生命值（由 CharacterRenderer 绘制） |
| BOMB 标签 | 350 | 炸弹数（由 CharacterRenderer 绘制） |
| Controls 帮助 | 420 | 操作说明 |

### 方法

| 方法 | 说明 |
|------|------|
| `create()` | 初始化所有 UI 元素（棋盘边框、网格线、文本、游戏结束层） |
| `updateScore(score)` | 更新分数 |
| `updateLevel(level)` | 更新等级 |
| `updateLines(lines)` | 更新行数 |
| `updateAll(score, level, lines)` | 批量更新 |
| `updateStage(stage, current, target)` | 更新关卡信息 |
| `drawNextPreview(nextType, tetrominoes)` | 绘制下一方块预览 |
| `showGameOver()` / `hideGameOver()` | 显示/隐藏游戏结束覆盖层 |

### 棋盘装饰

- 棋盘边框：2px 蓝灰色描边
- 网格线：0.5px 深色细线

### 下一方块预览

- 24×24 像素的小方块
- 显示下一个方块的初始旋转态

### 游戏结束覆盖层

- 居中黑色半透明背景
- "GAME OVER" 红色大标题
- "Press R to Restart" 提示文字
- 使用 Phaser Container 管理

### 依赖

- `Phaser.Scene`
- `constants.ts` — 布局、颜色、尺寸

## 扩展建议

- 添加关卡主题/名称显示
- 添加玩家升级列表显示
- 添加暂停菜单
- 支持不同语言的 UI 文本
