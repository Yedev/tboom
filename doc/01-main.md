# 01 - main.ts — 游戏入口与 Phaser 配置

**文件路径**: `src/main.ts` (22 行)

## 概述

游戏的入口文件，创建 Phaser.Game 实例并配置全局参数。

## 功能

- 创建 Phaser 游戏实例
- 配置画布尺寸（520x960 竖屏）
- 注册场景列表：`TitleScene` → `GameScene`
- 设置 FIT 缩放模式，自动居中
- 启用 WebAudio

## 关键配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `type` | `Phaser.AUTO` | 自动选择 WebGL/Canvas |
| `width` | 520 | 画布宽度 |
| `height` | 960 | 画布高度（竖屏） |
| `scale.mode` | `Phaser.Scale.FIT` | 自适应缩放 |
| `scale.autoCenter` | `Phaser.Scale.CENTER_BOTH` | 居中显示 |
| `audio.disableWebAudio` | `false` | 启用 WebAudio |

## 场景注册

```typescript
scene: [TitleScene, GameScene]
```

Phaser 按数组顺序初始化场景，`TitleScene` 首先启动。

## 依赖

- `TitleScene` — 标题场景
- `GameScene` — 游戏主场景
- `constants.ts` — `CANVAS_WIDTH`, `CANVAS_HEIGHT`, `CANVAS_BG_COLOR`

## 扩展建议

- 如需添加关卡选择场景，在此处注册新场景
- 如需全局加载画面，可添加 `PreloadScene`
- 如需持久化数据，可在 main.ts 中初始化存储系统
