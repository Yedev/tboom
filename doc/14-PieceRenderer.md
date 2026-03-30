# 14 - PieceRenderer — 方块渲染器

**文件路径**: `src/rendering/PieceRenderer.ts` (149 行)

## 概述

渲染活动方块、幽灵方块（硬降预览）和连接线（跟随模式）。

## 接口：PieceRenderInfo

```typescript
interface PieceRenderInfo {
  type: number;       // 方块类型
  rotation: number;   // 旋转状态
  x: number;          // 网格列
  y: number;          // 网格行
}
```

## 类：PieceRenderer

### Graphics 层

| Graphics | 用途 |
|----------|------|
| `pieceGraphics` | 活动方块 |
| `ghostGraphics` | 幽灵方块 |
| `linkGraphics` | 连接线 |

### 方法

| 方法 | 说明 |
|------|------|
| `isPieceDirty(piece)` | 检测方块位置/旋转是否变化 |
| `drawActivePiece(piece, gameOver, clearingLines)` | 绘制活动方块 |
| `drawGhost(piece, ghostY, gameOver, clearingLines)` | 绘制幽灵方块（半透明） |
| `drawLinkLine(piece, charCX, charCY, following)` | 绘制跟随连线 |
| `clear()` | 清空所有 Graphics |

### 脏标记缓存

缓存上一次的 `x, y, rotation`，仅在变化时重绘方块。

### 幽灵方块

- 半透明（alpha 0.2）的方块投影
- 仅在 `ghostY !== piece.y` 时绘制
- 表示方块硬降后的最终位置

### 连接线

- 跟随模式下绘制角色中心到方块中心的虚线
- 虚线参数：8px 线段，4px 间距
- 颜色：0x6688aa，alpha 0.5
- 取消跟随后不显示

### 隐藏规则

- `gameOver = true` → 不绘制活动方块和幽灵
- `clearingLines = true` → 不绘制活动方块和幽灵

### 依赖

- `Phaser.Scene`
- `constants.ts` — 颜色、尺寸、线条参数
- `TETROMINOES` — 方块形状数据（构造时传入）

## 扩展建议

- 支持 Hold 方块显示
- 支持方块锁定动画
- 连接线可在关卡配置中开关
