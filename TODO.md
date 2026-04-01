# T-Boom TODO

优先级说明：**P0** 必须先做（其他功能的基础）→ **P1** 核心玩法 → **P2** 锦上添花

---

## P0 — 基础重构（其他功能的前置）

### 1. 得分行为拆分
> 现状：计分逻辑混在一起，无法被卡牌负面效果单独控制。

- [ ] 在 `constants.ts` 或新文件中定义得分倍率字段：`scoreMultiplierLineClear` / `scoreMultiplierBomb` / `scoreMultiplierSlimeKill`
- [ ] `PlayerUpgrades` 增加这三个字段，默认值 `1.0`
- [ ] `TetrisEngine`（消行）、`BombSystem`（炸弹摧毁）、`SlimeSystem`（击杀）分别读取对应倍率计分
- [ ] 相关文件：`src/core/PlayerUpgrades.ts` · `src/core/TetrisEngine.ts` · `src/core/BombSystem.ts` · `src/core/SlimeSystem.ts`

### 2. 卡牌双面效果系统
> 现状：`PlayerUpgrades` 只有正面效果，卡牌无负面效果字段。

- [ ] `PlayerUpgrades.ts` 每种升级新增对应的负面效果字段（如 `slimeJumpMultiplier`、`lineClearScorePenalty` 等）
- [ ] `CardOverlay.ts` 卡牌UI增加负面效果（红色）展示区
- [ ] `data/cards.ts`（新建）：将卡牌定义从代码中分离，包含 `id / name / description / positiveEffect / negativeEffect`
- [ ] 更新 `GameScene` 中卡牌选择后的应用逻辑，同时应用正负效果
- [ ] 相关文件：`src/core/PlayerUpgrades.ts` · `src/rendering/CardOverlay.ts` · `src/scenes/GameScene.ts`

---

## P1 — 核心新玩法

### 3. 特殊方块系统
> 现状：`BoardModel` 每格只存颜色值，无方块类型。

- [ ] `BoardModel.ts`：每格数据从 `number`（颜色）改为 `{ color: number, type: BlockType }` 对象（或 `type` 独立数组）
- [ ] 定义 `BlockType` 枚举：`NORMAL | HARD | CHEST | POISON | SPEED | BOMB_BLOCK`
- [ ] `TetrisEngine.ts`：锁定时随机概率混入特殊方块（第2关起，比例 `min(10% × level, 40%)`）
- [ ] `BoardRenderer.ts`：根据 `BlockType` 绘制不同外观（硬化=深灰纹理 / 宝箱=金色星形 / 毒=紫色骷髅）
- [ ] 消行时触发特殊效果：
  - 硬化方块：该行不计分
  - 宝箱方块：随机奖励（+1血 / +1炸弹 / +50分 / 临时倍率）
  - 毒方块：角色扣1 HP
- [ ] 炸弹爆炸时触发特殊效果：
  - 硬化方块：免疫爆炸
  - 宝箱方块：奖励照常触发
  - 炸弹方块：连锁爆炸（3×3 范围）
- [ ] 相关文件：`src/core/BoardModel.ts` · `src/core/TetrisEngine.ts` · `src/core/BombSystem.ts` · `src/rendering/BoardRenderer.ts`

### 4. BOSS 关卡机制
> 现状：所有关卡逻辑相同，无 BOSS 差异化。

- [ ] `LevelConfig.ts`：增加 `isBoss: boolean` 和 `bossRule: BossRule` 字段
- [ ] `LevelFormulas.ts`（或 `levels.json`）：标记第4、7、10关为 BOSS 关
- [ ] 定义 `BossRule` 枚举/类型：`BOMB_DISABLED | GIANT_SLIME | DARK_BOARD | ...`
- [ ] `GameScene.ts`：进入 BOSS 关时读取规则并激活对应限制
  - `BOMB_DISABLED`：屏蔽炸弹放置输入
  - `GIANT_SLIME`：`SlimeSystem` 生成超大史莱姆（3×3格，高HP）
  - `DARK_BOARD`：定时随机熄灭2行（`BoardRenderer` 支持行可见性）
- [ ] BOSS 关通关后弹出稀有卡牌选择（而非普通卡）
- [ ] 相关文件：`src/data/LevelConfig.ts` · `src/data/LevelFormulas.ts` · `src/scenes/GameScene.ts` · `src/core/SlimeSystem.ts` · `src/rendering/BoardRenderer.ts`

### 5. 分支关卡地图
> 现状：关卡线性推进，无分支。

- [ ] 新建 `src/scenes/MapScene.ts`：可视化关卡地图，节点 + 连线 + 当前位置指示
- [ ] `src/data/mapLayout.ts`（新建）：定义分支树结构（节点ID、连接关系、是否BOSS）
- [ ] 每关通关后跳转到 `MapScene` 而非直接进入下一关
- [ ] 分叉节点显示两条路：BOSS路（标红/金冠）vs 挑战路（标蓝）
- [ ] 玩家点击选择后进入对应 `GameScene`（传入目标关卡ID）
- [ ] `LevelProgress.ts`：记录已通过的节点，已通过的路径变色
- [ ] 相关文件：`src/scenes/MapScene.ts`（新建）· `src/scenes/GameScene.ts` · `src/core/LevelProgress.ts` · `src/data/mapLayout.ts`（新建）

### 6. 二段跳卡牌
> 前置：卡牌双面效果系统（任务2）

- [ ] `CharacterPhysics.ts`：增加 `doubleJumpEnabled` 和 `doubleJumpUsed` 状态，在空中首次跳跃时消耗
- [ ] 落地时重置 `doubleJumpUsed`
- [ ] 卡牌定义中加入 `double_jump`：P=二段跳 / N=史莱姆跳跃高度 +50%
- [ ] 相关文件：`src/core/CharacterPhysics.ts` · `src/data/cards.ts`

---

## P2 — 扩展内容

### 7. 稀有卡牌（BOSS专属）
> 前置：BOSS关卡机制（任务4）+ 卡牌双面效果系统（任务2）

- [ ] 在 `data/cards.ts` 中增加稀有卡牌定义（标记 `rarity: 'rare'`）
  - `chain_bomb` 连锁炸弹：爆炸引爆相邻炸弹 / 自伤范围+1
  - `berserker` 狂战士：低血量加速 / 最大HP上限降至3
  - `gravity_flip` 重力反转：短暂贴附天花板 / 方块下落速度+20%
- [ ] `CardOverlay.ts`：稀有卡牌有特殊金色边框外观
- [ ] `GameScene.ts`：BOSS通关后从稀有卡池抽取，而非普通卡池

### 8. 特殊方块补全（低优先级变体）
> 前置：特殊方块系统（任务3）

- [ ] 毒方块：消行扣1 HP，炸弹摧毁安全
- [ ] 加速方块：锁定后本关方块下落速度永久+1档
- [ ] 为每种特殊方块补充音效

### 9. 隐藏路线
> 前置：分支关卡地图（任务5）

- [ ] 定义解锁条件（如连续3关全程不扣血）
- [ ] `MapScene` 中隐藏路线节点默认不可见，条件达成后显示
- [ ] `LevelProgress.ts` 记录解锁条件的达成状态

---

## 依赖关系

```
任务1（得分拆分）
  └─→ 任务2（卡牌双面效果）
        └─→ 任务6（二段跳）
        └─→ 任务7（稀有卡牌）

任务3（特殊方块）
  └─→ 任务8（特殊方块补全）

任务4（BOSS关卡）
  └─→ 任务7（稀有卡牌）

任务5（分支地图）
  └─→ 任务9（隐藏路线）
```
