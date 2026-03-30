# 16 - BombRenderer — 炸弹渲染器

**文件路径**: `src/rendering/BombRenderer.ts` (65 行)

## 概述

渲染炸弹实体和爆炸效果。每个炸弹和爆炸使用独立的 Phaser Graphics 对象。

## 接口

### BombRenderData

```typescript
interface BombRenderData {
  x: number; y: number;     // 像素位置
  timer: number;            // 引信剩余时间
  graphics: Phaser.GameObjects.Graphics;
}
```

### ExplosionRenderData

```typescript
interface ExplosionRenderData {
  cells: { col: number; row: number }[];  // 爆炸范围格子
  timer: number;                           // 动画剩余时间
  graphics: Phaser.GameObjects.Graphics;
}
```

## 类：BombRenderer

### 方法

| 方法 | 说明 |
|------|------|
| `drawBomb(bomb)` | 绘制单个炸弹 |
| `drawExplosions(explosions)` | 绘制所有爆炸效果 |

### 炸弹绘制

炸弹外观由以下部分组成：
- **弹体**：圆形（半径 6px），深灰/浅灰交替闪烁
- **高光**：白色圆形，模拟光泽
- **引信**：从弹体延伸的线段
- **火花**：引信末端的橙色/黄色光点（闪烁时显示）

#### 闪烁频率

引信剩余比例越大，闪烁越慢：
```
flashRate = 150 + (timer / fuseTime) * 350
```
即将爆炸时闪烁加快。

### 爆炸绘制

- 遍历爆炸范围内的所有格子
- 橙色/黄色交替闪烁（60ms 间隔）
- 透明度随时间衰减：`alpha = timer / duration * 0.85`

### Graphics 管理

炸弹和爆炸的 Graphics 对象由 `GameScene` 动态创建/销毁，`BombRenderer` 只负责绘制内容。

### 依赖

- `constants.ts` — 炸弹视觉参数

## 扩展建议

- 支持不同类型炸弹的视觉区分
- 添加爆炸粒子效果
- 支持爆炸范围预览（放置时显示）
