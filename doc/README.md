# T-Boom 模块文档索引

T-Boom 是一款混合了俄罗斯方块 + 平台跳跃 + 炸弹玩法的游戏，使用 Phaser 3 + TypeScript + Vite 构建。

## 文档列表

### 入口与配置
- [01-main.md](01-main.md) — 游戏入口与 Phaser 配置
- [02-constants.md](02-constants.md) — 全局常量与游戏参数
- [03-events.md](03-events.md) — 事件常量定义

### 核心逻辑层 (core/)
- [04-BoardModel.md](04-BoardModel.md) — 棋盘数据模型
- [05-TetrisEngine.md](05-TetrisEngine.md) — 俄罗斯方块引擎
- [06-CharacterPhysics.md](06-CharacterPhysics.md) — 角色物理系统
- [07-BombSystem.md](07-BombSystem.md) — 炸弹系统
- [08-GameStateMachine.md](08-GameStateMachine.md) — 游戏状态机
- [09-LevelManager.md](09-LevelManager.md) — 关卡管理器
- [10-PlayerUpgrades.md](10-PlayerUpgrades.md) — 升级卡牌系统

### 输入层 (input/)
- [11-InputManager.md](11-InputManager.md) — 输入管理器
- [12-TouchControls.md](12-TouchControls.md) — 触控系统

### 渲染层 (rendering/)
- [13-BoardRenderer.md](13-BoardRenderer.md) — 棋盘渲染器
- [14-PieceRenderer.md](14-PieceRenderer.md) — 方块渲染器
- [15-CharacterRenderer.md](15-CharacterRenderer.md) — 角色渲染器
- [16-BombRenderer.md](16-BombRenderer.md) — 炸弹渲染器
- [17-UIRenderer.md](17-UIRenderer.md) — UI 渲染器
- [18-CardOverlay.md](18-CardOverlay.md) — 卡牌选择界面

### 场景层 (scenes/)
- [19-TitleScene.md](19-TitleScene.md) — 标题场景
- [20-GameScene.md](20-GameScene.md) — 游戏主场景

### 工具层 (utils/)
- [21-CollisionUtils.md](21-CollisionUtils.md) — 碰撞工具函数

## 项目结构

```
src/
  main.ts                        — 游戏入口
  constants.ts                   — 全局常量
  events.ts                      — 事件常量
  core/                          — 核心逻辑（无 Phaser 依赖）
    BoardModel.ts                — 棋盘数据
    TetrisEngine.ts              — 方块引擎
    CharacterPhysics.ts          — 角色物理
    BombSystem.ts                — 炸弹系统
    GameStateMachine.ts          — 状态机
    LevelManager.ts              — 关卡管理
    PlayerUpgrades.ts            — 升级卡牌
  input/                         — 输入处理
    InputManager.ts              — 输入管理
  TouchControls.ts               — 触控 UI
  rendering/                     — 渲染层
    BoardRenderer.ts             — 棋盘绘制
    PieceRenderer.ts             — 方块绘制
    CharacterRenderer.ts         — 角色绘制
    BombRenderer.ts              — 炸弹绘制
    UIRenderer.ts                — UI 绘制
    CardOverlay.ts               — 卡牌选择 UI
  scenes/                        — 场景
    TitleScene.ts                — 标题场景
    GameScene.ts                 — 主游戏场景
  utils/                         — 工具
    CollisionUtils.ts            — 碰撞计算
```
