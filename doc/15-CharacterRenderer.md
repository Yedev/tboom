# 15 - CharacterRenderer — 角色渲染器

**文件路径**: `src/rendering/CharacterRenderer.ts` (161 行)

## 概述

用程序化像素风格渲染角色和 UI 信息（HP、炸弹数）。

## 接口：CharacterRenderState

```typescript
interface CharacterRenderState {
  x: number; y: number;
  vx: number; vy: number;
  grounded: boolean;
  invincibleTimer: number;
  animTime: number;
  alive: boolean;
}
```

## 类：CharacterRenderer

### 方法

| 方法 | 说明 |
|------|------|
| `draw(state)` | 根据状态渲染角色 |
| `drawHP(hp, maxHp)` | 绘制生命值（心形字符） |
| `drawBombCount(count)` | 绘制炸弹数量 |

### 角色绘制

角色由程序化像素图形组成（20×24 像素）：

- **头部**（14×10）— 包含眼睛
- **身体**（16×13）— 包含手臂
- **腿部**（5×4 × 2）

### 动画状态

| 状态 | 动画效果 |
|------|----------|
| 站立 | 呼吸效果（正弦上下），周期性眨眼 |
| 行走 | 左右腿交替前后摆动 |
| 跳跃 | 身体上移，手臂举起，腿并拢 |
| 下落 | 手臂向下，腿微张 |
| 受伤 | 红色色调，X 眼 |
| 无敌 | 闪烁（每 80ms 切换可见性） |

### 眼睛绘制

- 正常：白色眼球 + 黑色瞳孔（跟随移动方向偏移）
- 眨眼：黑色横线
- 受伤：X 形

### HP 显示

使用 Unicode 心形字符：
- 满血：♥
- 空血：♡

### 依赖

- `Phaser.Scene`
- `constants.ts` — 角色尺寸、颜色、动画参数

## 扩展建议

- 支持不同角色皮肤/颜色
- 添加受伤动画特效（星星、晕眩）
- 支持角色方向翻转
