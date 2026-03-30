# 02 - constants.ts — 全局常量与游戏参数

**文件路径**: `src/constants.ts` (243 行)

## 概述

所有游戏参数的集中定义文件。不导入任何其他模块，作为最底层依赖。

## 常量分组

### 画布与布局

| 常量 | 值 | 说明 |
|------|-----|------|
| `CANVAS_WIDTH` | 520 | 画布宽度（像素） |
| `CANVAS_HEIGHT` | 960 | 画布高度（像素） |
| `CANVAS_BG_COLOR` | `'#0a0a1a'` | 背景色 |
| `BOARD_X` | 40 | 棋盘左上角 X |
| `BOARD_Y` | 40 | 棋盘左上角 Y |
| `PANEL_X` | 390 | 侧边面板 X 坐标 |

### 棋盘

| 常量 | 值 | 说明 |
|------|-----|------|
| `COLS` | 10 | 棋盘列数 |
| `ROWS` | 20 | 棋盘行数 |
| `BLOCK_SIZE` | 32 | 每格像素大小 |

### 方块形状与旋转

- `TETROMINOES` — 7 种方块 × 4 个旋转状态的 4D 数组
- `WALL_KICKS` — SRS 墙踢数据（J/L/S/T/Z）
- `I_WALL_KICKS` — I 方块专用墙踢数据

### 颜色

- `PIECE_COLORS` — 方块填充色（索引 0-7，0 为空）
- `PIECE_BORDER_COLORS` — 方块边框色

### 计时与速度

| 常量 | 值 | 说明 |
|------|-----|------|
| `INITIAL_DROP_INTERVAL` | 800 | 初始下落间隔（ms） |
| `MIN_DROP_INTERVAL` | 50 | 最小下落间隔 |
| `SPEED_INCREMENT` | 40 | 每级加速量 |
| `LOCK_DELAY` | 500 | 锁定延迟 |
| `MAX_LOCK_MOVES` | 15 | 锁定延迟内最大移动次数 |
| `CLEAR_ANIM_DURATION` | 400 | 消行动画时长 |

### 角色

| 常量 | 值 | 说明 |
|------|-----|------|
| `CHAR_WIDTH` | 20 | 角色宽度 |
| `CHAR_HEIGHT` | 24 | 角色高度 |
| `CHAR_GRAVITY` | 1200 | 重力加速度（px/s²） |
| `CHAR_JUMP_VELOCITY` | -420 | 跳跃速度（负=向上） |
| `CHAR_MOVE_SPEED` | 160 | 水平移动速度 |
| `CHAR_MAX_HP` | 5 | 初始最大生命 |
| `CHAR_CRUSH_DAMAGE` | 2 | 被压伤害 |
| `CHAR_INVINCIBLE_DURATION` | 1500 | 无敌时间（ms） |

### 炸弹

| 常量 | 值 | 说明 |
|------|-----|------|
| `BOMB_SIZE` | 16 | 炸弹实体大小 |
| `BOMB_GRAVITY` | 800 | 炸弹重力 |
| `BOMB_FUSE_TIME` | 2000 | 引信时间（ms） |
| `BOMB_BLAST_RADIUS` | 1 | 爆破半径（1=3×3） |
| `BOMB_HURT_RADIUS` | 2 | 伤害半径 |
| `BOMB_DAMAGE` | 2 | 爆炸伤害 |
| `BOMB_MAX_COUNT` | 3 | 初始炸弹上限 |

### 计分

| 常量 | 值 | 说明 |
|------|-----|------|
| `LINE_SCORES` | [0,100,300,500,800] | 消1/2/3/4行基础分 |
| `SOFT_DROP_SCORE` | 1 | 软降每格得分 |
| `HARD_DROP_SCORE` | 2 | 硬降每格得分 |
| `BOMB_BLOCK_SCORE` | 15 | 炸弹摧毁每格得分 |

### 触控布局

- `DPAD_CX`, `DPAD_CY` — 方向键中心坐标
- `DPAD_SIZE`, `DPAD_GAP` — 方向键尺寸
- `BTN_CLUSTER_CX`, `BTN_CLUSTER_CY` — 按钮组中心
- `BTN_BIG_R`, `BTN_SMALL_R` — 大/小按钮半径

## 设计说明

- 所有值硬编码，修改需编辑源码
- 无外部配置文件（JSON/YAML）
- 被几乎所有其他模块导入

## 扩展建议

- 将关卡相关参数抽取为关卡配置文件（JSON/TS）
- 将角色、炸弹参数改为可配置项，由关卡配置覆盖
- 考虑引入难度曲线配置，替代线性公式
