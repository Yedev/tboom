export type UpgradeId =
  | 'jump_boost'
  | 'hp_boost'
  | 'speed_boost'
  | 'bomb_radius'
  | 'bomb_capacity'
  | 'score_multiplier'
  | 'double_jump'
  // Rare (BOSS-only) cards
  | 'chain_bomb'
  | 'berserker';

export interface UpgradeCard {
  id: UpgradeId;
  name: string;
  /** Positive effect shown in green */
  description: string;
  /** Negative effect shown in red */
  negativeDescription: string;
  color: number;
}

export class PlayerUpgrades {
  // ---- Positive effect fields ----
  jumpVelocityMult: number = 1.0;
  maxHpBonus: number = 0;
  moveSpeedMult: number = 1.0;
  bombBlastRadiusBonus: number = 0;
  bombMaxCountBonus: number = 0;
  doubleJumpEnabled: boolean = false;

  // ---- Score multipliers (split by source) ----
  lineClearScoreMult: number = 1.0;
  bombScoreMult: number = 1.0;
  slimeKillScoreMult: number = 1.0;

  // ---- Negative effect fields ----
  /** Extra cells added to bomb self-hurt radius */
  bombSelfHurtRadiusBonus: number = 0;
  /** Multiplier applied to slime move speed (>1 = faster) */
  slimeMoveSpeedMult: number = 1.0;
  /** Multiplier applied to slime jump velocity magnitude (>1 = higher) */
  slimeJumpVelocityMult: number = 1.0;

  // ---- Rare card effect fields ----
  /** chain_bomb: bomb blasts that hit a placed bomb trigger it immediately */
  chainBombEnabled: boolean = false;
  /** berserker: speed/jump scale up as HP decreases; but maxHP is capped at 3 */
  berserkerMode: boolean = false;

  applyCard(card: UpgradeCard): void {
    switch (card.id) {
      case 'jump_boost':
        this.jumpVelocityMult    += 0.25;
        this.lineClearScoreMult  -= 0.15;
        break;
      case 'hp_boost':
        this.maxHpBonus   += 2;
        this.bombScoreMult -= 0.20;
        break;
      case 'speed_boost':
        this.moveSpeedMult       += 0.20;
        this.slimeMoveSpeedMult  += 0.20;
        break;
      case 'bomb_radius':
        this.bombBlastRadiusBonus   += 1;
        this.bombSelfHurtRadiusBonus += 1;
        break;
      case 'bomb_capacity':
        this.bombMaxCountBonus += 1;
        // targetLinesBonus is handled by LevelManager via GameScene
        break;
      case 'score_multiplier':
        this.lineClearScoreMult += 0.50;
        this.bombScoreMult      -= 0.30;
        break;
      case 'double_jump':
        this.doubleJumpEnabled      = true;
        this.slimeJumpVelocityMult += 0.50;
        break;
      case 'chain_bomb':
        this.chainBombEnabled        = true;
        this.bombSelfHurtRadiusBonus += 1;
        break;
      case 'berserker':
        this.berserkerMode = true;
        // maxHP cap of 3 enforced in CharacterPhysics.maxHp getter
        break;
    }
  }

  reset(): void {
    this.jumpVelocityMult        = 1.0;
    this.maxHpBonus              = 0;
    this.moveSpeedMult           = 1.0;
    this.bombBlastRadiusBonus    = 0;
    this.bombMaxCountBonus       = 0;
    this.doubleJumpEnabled       = false;
    this.lineClearScoreMult      = 1.0;
    this.bombScoreMult           = 1.0;
    this.slimeKillScoreMult      = 1.0;
    this.bombSelfHurtRadiusBonus = 0;
    this.slimeMoveSpeedMult      = 1.0;
    this.slimeJumpVelocityMult   = 1.0;
    this.chainBombEnabled        = false;
    this.berserkerMode           = false;
  }
}

export const ALL_UPGRADE_CARDS: UpgradeCard[] = [
  {
    id: 'jump_boost',
    name: '弹簧腿',
    description: '跳跃高度 +25%',
    negativeDescription: '消行得分 -15%',
    color: 0x44aaff,
  },
  {
    id: 'hp_boost',
    name: '铁甲心',
    description: '最大血量 +2',
    negativeDescription: '炸弹得分 -20%',
    color: 0xff4444,
  },
  {
    id: 'speed_boost',
    name: '疾步者',
    description: '移动速度 +20%',
    negativeDescription: '史莱姆移速 +20%',
    color: 0x44ff88,
  },
  {
    id: 'bomb_radius',
    name: '烈焰弹',
    description: '炸弹破坏范围 +1格',
    negativeDescription: '自伤范围同步扩大',
    color: 0xff8800,
  },
  {
    id: 'bomb_capacity',
    name: '弹药库',
    description: '炸弹持有上限 +1',
    negativeDescription: '本关目标行数 +2',
    color: 0xffcc00,
  },
  {
    id: 'score_multiplier',
    name: '财神附体',
    description: '消行得分 +50%',
    negativeDescription: '炸弹得分 -30%',
    color: 0xcc44ff,
  },
  {
    id: 'double_jump',
    name: '二段跳',
    description: '空中可再次跳跃',
    negativeDescription: '史莱姆跳跃高度 +50%',
    color: 0x00ddff,
  },
];

export const BOSS_UPGRADE_CARDS: UpgradeCard[] = [
  {
    id: 'chain_bomb',
    name: '连锁炸弹',
    description: '爆炸引爆范围内的炸弹',
    negativeDescription: '自伤范围 +1格',
    color: 0xff2200,
  },
  {
    id: 'berserker',
    name: '狂战士',
    description: '血量越低移动/跳跃越快(最高+50%)',
    negativeDescription: '最大血量上限降至 3',
    color: 0xdd0066,
  },
];

export function pickRandomCards(count: number): UpgradeCard[] {
  const pool = [...ALL_UPGRADE_CARDS];
  const result: UpgradeCard[] = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(...pool.splice(idx, 1));
  }
  return result;
}
