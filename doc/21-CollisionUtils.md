# 21 - CollisionUtils — 碰撞工具函数

**文件路径**: `src/utils/CollisionUtils.ts` (72 行)

## 概述

提供像素坐标与网格坐标转换、AABB碰撞检测等通用工具函数。

## 接口

### GridCoord

```typescript
interface GridCoord { col: number; row: number; }
```

### GridBounds

```typescript
interface GridBounds { minCol: number; maxCol: number; minRow: number; maxRow: number; }
```

### PixelRect

```typescript
interface PixelRect { left: number; top: number; right: number; bottom: number; }
```

## 函数列表

| 函数 | 签名 | 说明 |
|------|------|------|
| `pixelToGrid` | `(px, py) => GridCoord` | 像素坐标 → 网格坐标 |
| `pixelRectToGridBounds` | `(px, py, pw, ph) => GridBounds` | 像素矩形 → 覆盖的网格范围（夹紧到棋盘内） |
| `cellPixelBounds` | `(col, row) => PixelRect` | 网格格子 → 像素边界 |
| `aabbOverlap` | `(ax,ay,aw,ah, bx,by,bw,bh) => boolean` | AABB 碰撞检测 |
| `overlapsCell` | `(px,py,pw,ph, col,row) => boolean` | 像素矩形与网格格子碰撞 |
| `isInBounds` | `(row, col) => boolean` | 网格坐标是否在棋盘范围内 |

## 当前状态

**未被任何模块导入使用。**

以下模块各自内联了相似的碰撞逻辑：
- `CharacterPhysics` — `resolveCollisionsX/Y()`, `checkCrushOnLock()`, `findNearestFreePosition()`
- `BombSystem` — 炸弹碰撞检测、爆炸范围计算

## 设计意图

作为共享工具函数，消除 CharacterPhysics 和 BombSystem 中的重复碰撞计算代码。

## 扩展建议

- **立即重构**：将 CharacterPhysics 和 BombSystem 中的内联碰撞逻辑替换为这些工具函数
- 可添加 `gridToPixel()` 反向转换
- 可添加 `clampToBounds()` 边界夹紧
- 可添加 `findNearestFreePosition()` 通用版本
