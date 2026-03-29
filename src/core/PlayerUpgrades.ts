export type UpgradeId =
  | 'jump_boost'
  | 'hp_boost'
  | 'speed_boost'
  | 'bomb_radius'
  | 'bomb_capacity'
  | 'score_multiplier';

export interface UpgradeCard {
  id: UpgradeId;
  name: string;
  description: string;
  color: number;
}

export class PlayerUpgrades {
  jumpVelocityMult: number = 1.0;
  maxHpBonus: number = 0;
  moveSpeedMult: number = 1.0;
  bombBlastRadiusBonus: number = 0;
  bombMaxCountBonus: number = 0;
  scoreMultiplier: number = 1.0;

  applyCard(card: UpgradeCard): void {
    switch (card.id) {
      case 'jump_boost':       this.jumpVelocityMult   += 0.25; break;
      case 'hp_boost':         this.maxHpBonus         += 2;    break;
      case 'speed_boost':      this.moveSpeedMult      += 0.20; break;
      case 'bomb_radius':      this.bombBlastRadiusBonus += 1;  break;
      case 'bomb_capacity':    this.bombMaxCountBonus  += 1;    break;
      case 'score_multiplier': this.scoreMultiplier    += 0.5;  break;
    }
  }

  reset(): void {
    this.jumpVelocityMult     = 1.0;
    this.maxHpBonus           = 0;
    this.moveSpeedMult        = 1.0;
    this.bombBlastRadiusBonus = 0;
    this.bombMaxCountBonus    = 0;
    this.scoreMultiplier      = 1.0;
  }
}

export const ALL_UPGRADE_CARDS: UpgradeCard[] = [
  { id: 'jump_boost',       name: '弹簧腿',   description: '跳跃高度 +25%',  color: 0x44aaff },
  { id: 'hp_boost',         name: '铁甲心',   description: '最大血量 +2',    color: 0xff4444 },
  { id: 'speed_boost',      name: '疾步者',   description: '移动速度 +20%',  color: 0x44ff88 },
  { id: 'bomb_radius',      name: '烈焰弹',   description: '炸弹范围 +1格',  color: 0xff8800 },
  { id: 'bomb_capacity',    name: '弹药库',   description: '炸弹上限 +1',    color: 0xffcc00 },
  { id: 'score_multiplier', name: '财神附体', description: '得分倍率 +50%',  color: 0xcc44ff },
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
