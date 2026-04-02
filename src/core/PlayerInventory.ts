import { UpgradeCard, ALL_UPGRADE_CARDS, BOSS_UPGRADE_CARDS } from './PlayerUpgrades';

const STORAGE_KEY = 'tboom_inventory';
export const MAX_CARDS = 5;

/** Gold cost for each card id. */
export const CARD_PRICE: Record<string, number> = {
  jump_boost:       25,
  hp_boost:         25,
  speed_boost:      25,
  bomb_radius:      30,
  bomb_capacity:    30,
  score_multiplier: 25,
  double_jump:      35,
  chain_bomb:       50,
  berserker:        50,
};

/** Persistent player inventory (gold + up to 5 cards). Singleton. */
export class PlayerInventory {
  private static _instance: PlayerInventory;

  gold: number = 0;
  cards: UpgradeCard[] = [];  // max MAX_CARDS

  static getInstance(): PlayerInventory {
    if (!PlayerInventory._instance) {
      PlayerInventory._instance = new PlayerInventory();
      PlayerInventory._instance.load();
    }
    return PlayerInventory._instance;
  }

  addGold(amount: number): void {
    this.gold += amount;
    this.save();
  }

  cardPrice(card: UpgradeCard): number {
    return CARD_PRICE[card.id] ?? 30;
  }

  canAfford(card: UpgradeCard): boolean {
    return this.gold >= this.cardPrice(card);
  }

  isFull(): boolean {
    return this.cards.length >= MAX_CARDS;
  }

  /**
   * Buy a card. If replaceIndex is provided, replaces that slot.
   * Returns true on success.
   */
  buyCard(card: UpgradeCard, replaceIndex?: number): boolean {
    const price = this.cardPrice(card);
    if (this.gold < price) return false;

    if (replaceIndex !== undefined && replaceIndex >= 0 && replaceIndex < this.cards.length) {
      this.cards[replaceIndex] = card;
    } else if (!this.isFull()) {
      this.cards.push(card);
    } else {
      return false;
    }

    this.gold -= price;
    this.save();
    return true;
  }

  sellCard(index: number): void {
    if (index < 0 || index >= this.cards.length) return;
    this.cards.splice(index, 1);
    this.save();
  }

  reset(): void {
    this.gold = 0;
    this.cards = [];
    this.save();
  }

  save(): void {
    const data = {
      gold:  this.gold,
      cards: this.cards.map(c => c.id),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore storage errors
    }
  }

  load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      this.gold = typeof data.gold === 'number' ? data.gold : 0;
      const all = [...ALL_UPGRADE_CARDS, ...BOSS_UPGRADE_CARDS];
      this.cards = (Array.isArray(data.cards) ? data.cards : [])
        .map((id: string) => all.find(c => c.id === id))
        .filter((c: UpgradeCard | undefined): c is UpgradeCard => c !== undefined)
        .slice(0, MAX_CARDS);
    } catch {
      // ignore parse errors
    }
  }
}

/** Gold awarded at the end of a level. */
export function computeGoldReward(level: number, score: number): number {
  return 20 + level * 10 + Math.floor(score / 100);
}

/** Pick shop cards: weighted pool (rare cards at ~15% each slot). */
export function pickShopCards(count: number): UpgradeCard[] {
  const pool: UpgradeCard[] = [];
  for (const c of ALL_UPGRADE_CARDS)  pool.push(c);
  for (const c of BOSS_UPGRADE_CARDS) pool.push(c); // rare — appear once alongside normals

  const result: UpgradeCard[] = [];
  const remaining = [...pool];
  while (result.length < count && remaining.length > 0) {
    // Weight: boss cards are already at ~22% chance (2 of 9 total). That's close enough.
    const idx = Math.floor(Math.random() * remaining.length);
    result.push(...remaining.splice(idx, 1));
  }
  return result;
}
