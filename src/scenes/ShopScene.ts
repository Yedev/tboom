import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { UpgradeCard } from '../core/PlayerUpgrades';
import { PlayerInventory, MAX_CARDS, pickShopCards } from '../core/PlayerInventory';

const SHOP_CARD_W   = 130;
const SHOP_CARD_H   = 195;
const SHOP_CARD_GAP = 14;

const INV_CARD_W   = 82;
const INV_CARD_H   = 110;
const INV_CARD_GAP = 8;
const INV_START_Y  = 390;

interface ShopCardState {
  card:      UpgradeCard;
  bgGfx:     Phaser.GameObjects.Graphics;
  zone:      Phaser.GameObjects.Zone;
  priceText: Phaser.GameObjects.Text;
}

export class ShopScene extends Phaser.Scene {
  private inventory!: PlayerInventory;
  private shopCards: UpgradeCard[] = [];

  private goldText!:  Phaser.GameObjects.Text;
  private shopStates: ShopCardState[] = [];

  /** Index of the shop card waiting for a replacement pick (-1 = none). */
  private replacingShopIdx: number = -1;
  private replacePromptText!: Phaser.GameObjects.Text;

  // Inventory slot display objects (rebuilt on purchase)
  private invSlotGfx:  Phaser.GameObjects.Graphics[] = [];
  private invSlotText: Phaser.GameObjects.Text[]     = [];

  constructor() {
    super({ key: 'ShopScene' });
  }

  init(data: { goldAwarded?: number }): void {
    this.inventory = PlayerInventory.getInstance();
    if (data.goldAwarded) {
      this.inventory.addGold(data.goldAwarded);
    }
    this.shopCards = pickShopCards(3);
    this.replacingShopIdx = -1;
  }

  create(): void {
    // Background
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x08081a).setOrigin(0, 0);

    // Title
    this.add.text(CANVAS_WIDTH / 2, 22, '商  店', {
      fontSize: '30px', fontFamily: 'monospace',
      color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Gold display
    this.goldText = this.add.text(CANVAS_WIDTH / 2, 64, this.goldLabel(), {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    // Section: for sale
    this.add.text(CANVAS_WIDTH / 2, 102, '── 今日上架 ──', {
      fontSize: '15px', fontFamily: 'monospace', color: '#8899bb',
    }).setOrigin(0.5, 0);

    this.buildShopCards();

    // Divider
    const divGfx = this.add.graphics();
    divGfx.lineStyle(1, 0x334455, 0.6);
    divGfx.lineBetween(20, 332, CANVAS_WIDTH - 20, 332);

    // Section: inventory
    this.add.text(CANVAS_WIDTH / 2, 340, '── 我的卡牌 ──', {
      fontSize: '15px', fontFamily: 'monospace', color: '#8899bb',
    }).setOrigin(0.5, 0);

    this.replacePromptText = this.add.text(CANVAS_WIDTH / 2, 363, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffaa44',
    }).setOrigin(0.5, 0);

    this.buildInventorySlots();

    // Skip / Continue button
    this.buildSkipButton();
  }

  // ─── Shop cards ────────────────────────────────────────────────────────────

  private buildShopCards(): void {
    const totalW = this.shopCards.length * SHOP_CARD_W + (this.shopCards.length - 1) * SHOP_CARD_GAP;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    for (let i = 0; i < this.shopCards.length; i++) {
      const cx = startX + i * (SHOP_CARD_W + SHOP_CARD_GAP);
      this.buildShopCard(this.shopCards[i], cx, 124, i);
    }
  }

  private buildShopCard(card: UpgradeCard, cx: number, cy: number, idx: number): void {
    const price = this.inventory.cardPrice(card);

    const bgGfx = this.add.graphics();
    this.drawShopCardBg(bgGfx, cx, cy, card.color, false);

    const header = this.add.graphics();
    header.fillStyle(card.color, 0.80);
    header.fillRect(cx, cy, SHOP_CARD_W, 40);

    this.add.text(cx + SHOP_CARD_W / 2, cy + 20, card.name, {
      fontSize: '16px', fontFamily: 'monospace',
      color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx + SHOP_CARD_W / 2, cy + 50, `✦ ${card.description}`, {
      fontSize: '12px', fontFamily: 'monospace',
      color: '#66ff88', wordWrap: { width: SHOP_CARD_W - 12 }, align: 'center',
    }).setOrigin(0.5, 0);

    const dg = this.add.graphics();
    dg.lineStyle(1, 0x334455, 0.7);
    dg.lineBetween(cx + 8, cy + 112, cx + SHOP_CARD_W - 8, cy + 112);

    this.add.text(cx + SHOP_CARD_W / 2, cy + 118, `✦ ${card.negativeDescription}`, {
      fontSize: '12px', fontFamily: 'monospace',
      color: '#ff6655', wordWrap: { width: SHOP_CARD_W - 12 }, align: 'center',
    }).setOrigin(0.5, 0);

    const canBuy    = this.inventory.canAfford(card);
    const priceText = this.add.text(cx + SHOP_CARD_W / 2, cy + SHOP_CARD_H - 22,
      `${price} 金`, {
        fontSize: '15px', fontFamily: 'monospace',
        color: canBuy ? '#ffd700' : '#aa5533', fontStyle: 'bold',
      }).setOrigin(0.5);

    const zone = this.add.zone(cx, cy, SHOP_CARD_W, SHOP_CARD_H).setOrigin(0, 0);
    zone.setInteractive({ cursor: 'pointer' });

    const state: ShopCardState = { card, bgGfx, zone, priceText };
    this.shopStates.push(state);

    zone.on('pointerover', () => this.drawShopCardBg(bgGfx, cx, cy, card.color, true));
    zone.on('pointerout',  () => this.drawShopCardBg(bgGfx, cx, cy, card.color, false));
    zone.on('pointerdown', () => this.onShopCardClick(idx, cx, cy));
  }

  private drawShopCardBg(
    gfx: Phaser.GameObjects.Graphics,
    cx: number, cy: number,
    color: number, hovered: boolean,
  ): void {
    gfx.clear();
    gfx.fillStyle(hovered ? 0x1e2240 : 0x111830, 1);
    gfx.fillRoundedRect(cx, cy, SHOP_CARD_W, SHOP_CARD_H, 8);
    gfx.lineStyle(hovered ? 3 : 2, color, hovered ? 1 : 0.65);
    gfx.strokeRoundedRect(cx, cy, SHOP_CARD_W, SHOP_CARD_H, 8);
  }

  private onShopCardClick(shopIdx: number, cx: number, cy: number): void {
    const card = this.shopCards[shopIdx];
    if (!this.inventory.canAfford(card)) return;

    if (!this.inventory.isFull()) {
      this.inventory.buyCard(card);
      this.markShopCardBought(shopIdx, cx, cy);
    } else {
      // Toggle replace mode for this card
      if (this.replacingShopIdx === shopIdx) {
        this.replacingShopIdx = -1;
        this.replacePromptText.setText('');
      } else {
        this.replacingShopIdx = shopIdx;
        this.replacePromptText.setText('点击下方一张卡牌将其替换');
      }
    }
  }

  private markShopCardBought(idx: number, cx: number, cy: number): void {
    const state = this.shopStates[idx];
    if (!state) return;
    state.zone.disableInteractive();
    // Dim the card
    const dimGfx = this.add.graphics();
    dimGfx.fillStyle(0x000000, 0.55);
    dimGfx.fillRoundedRect(cx, cy, SHOP_CARD_W, SHOP_CARD_H, 8);
    state.priceText.setText('已购买').setColor('#446644');

    this.replacingShopIdx = -1;
    this.replacePromptText.setText('');
    this.goldText.setText(this.goldLabel());
    this.refreshShopPriceColors();
    this.rebuildInventorySlots();
  }

  private refreshShopPriceColors(): void {
    for (const s of this.shopStates) {
      const canBuy = this.inventory.canAfford(s.card);
      s.priceText.setColor(canBuy ? '#ffd700' : '#aa5533');
    }
  }

  // ─── Inventory slots ────────────────────────────────────────────────────────

  private buildInventorySlots(): void {
    const totalW = MAX_CARDS * INV_CARD_W + (MAX_CARDS - 1) * INV_CARD_GAP;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    for (let i = 0; i < MAX_CARDS; i++) {
      const cx = startX + i * (INV_CARD_W + INV_CARD_GAP);
      this.buildInvSlot(i, cx, INV_START_Y);
    }
  }

  private buildInvSlot(idx: number, cx: number, cy: number): void {
    const card = this.inventory.cards[idx];

    const bgGfx = this.add.graphics();
    this.invSlotGfx.push(bgGfx);

    if (card) {
      this.drawInvSlotBg(bgGfx, cx, cy, card.color, false);

      const header = this.add.graphics();
      header.fillStyle(card.color, 0.70);
      header.fillRect(cx, cy, INV_CARD_W, 26);
      this.invSlotGfx.push(header);

      const nameText = this.add.text(cx + INV_CARD_W / 2, cy + 13, card.name, {
        fontSize: '12px', fontFamily: 'monospace',
        color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
      this.invSlotText.push(nameText);

      const descText = this.add.text(cx + INV_CARD_W / 2, cy + 32, card.description, {
        fontSize: '10px', fontFamily: 'monospace',
        color: '#99ffaa', wordWrap: { width: INV_CARD_W - 8 }, align: 'center',
      }).setOrigin(0.5, 0);
      this.invSlotText.push(descText);

      const zone = this.add.zone(cx, cy, INV_CARD_W, INV_CARD_H).setOrigin(0, 0);
      zone.setInteractive({ cursor: 'pointer' });
      zone.on('pointerover', () => {
        if (this.replacingShopIdx >= 0) {
          this.drawInvSlotBg(bgGfx, cx, cy, card.color, true);
        }
      });
      zone.on('pointerout', () => {
        this.drawInvSlotBg(bgGfx, cx, cy, card.color, false);
      });
      zone.on('pointerdown', () => {
        if (this.replacingShopIdx < 0) return;
        const shopCard = this.shopCards[this.replacingShopIdx];
        const shopCx   = this.getShopCardX(this.replacingShopIdx);
        const prevIdx  = this.replacingShopIdx;
        this.inventory.buyCard(shopCard, idx);
        this.markShopCardBought(prevIdx, shopCx, 124);
        // rebuildInventorySlots is called inside markShopCardBought
      });
    } else {
      this.drawInvSlotBg(bgGfx, cx, cy, 0x334455, false);
      const emptyText = this.add.text(cx + INV_CARD_W / 2, cy + INV_CARD_H / 2 - 8, '空', {
        fontSize: '22px', fontFamily: 'monospace', color: '#334455',
      }).setOrigin(0.5);
      this.invSlotText.push(emptyText);

      const countText = this.add.text(cx + INV_CARD_W / 2, cy + INV_CARD_H / 2 + 16,
        `${this.inventory.cards.length}/${MAX_CARDS}`, {
          fontSize: '11px', fontFamily: 'monospace', color: '#445566',
        }).setOrigin(0.5);
      this.invSlotText.push(countText);
    }
  }

  private drawInvSlotBg(
    gfx: Phaser.GameObjects.Graphics,
    cx: number, cy: number,
    color: number, hovered: boolean,
  ): void {
    gfx.clear();
    if (color === 0x334455) {
      gfx.fillStyle(0x0d0d1f, 1);
      gfx.fillRoundedRect(cx, cy, INV_CARD_W, INV_CARD_H, 6);
      gfx.lineStyle(1, 0x223344, 0.5);
      gfx.strokeRoundedRect(cx, cy, INV_CARD_W, INV_CARD_H, 6);
    } else {
      gfx.fillStyle(hovered ? 0x1e2240 : 0x111830, 1);
      gfx.fillRoundedRect(cx, cy, INV_CARD_W, INV_CARD_H, 6);
      gfx.lineStyle(hovered ? 3 : 2, color, hovered ? 1 : 0.7);
      gfx.strokeRoundedRect(cx, cy, INV_CARD_W, INV_CARD_H, 6);
    }
  }

  /** Destroy and recreate all inventory slot objects. */
  private rebuildInventorySlots(): void {
    for (const g of this.invSlotGfx)  g.destroy();
    for (const t of this.invSlotText) t.destroy();
    this.invSlotGfx  = [];
    this.invSlotText = [];
    this.buildInventorySlots();
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private getShopCardX(idx: number): number {
    const totalW = this.shopCards.length * SHOP_CARD_W + (this.shopCards.length - 1) * SHOP_CARD_GAP;
    const startX = (CANVAS_WIDTH - totalW) / 2;
    return startX + idx * (SHOP_CARD_W + SHOP_CARD_GAP);
  }

  private goldLabel(): string {
    return `金币: ${this.inventory.gold}`;
  }

  // ─── Skip button ───────────────────────────────────────────────────────────

  private buildSkipButton(): void {
    const bx = CANVAS_WIDTH / 2;
    const by = CANVAS_HEIGHT - 55;

    const bg = this.add.graphics();
    const drawBg = (hover: boolean): void => {
      bg.clear();
      bg.fillStyle(hover ? 0x4466aa : 0x334466, hover ? 1 : 0.9);
      bg.fillRoundedRect(bx - 70, by - 20, 140, 40, 8);
    };
    drawBg(false);

    const label = this.add.text(bx, by, '继续 ▶', {
      fontSize: '18px', fontFamily: 'monospace',
      color: '#aabbcc', fontStyle: 'bold',
    }).setOrigin(0.5);

    const zone = this.add.zone(bx - 70, by - 20, 140, 40).setOrigin(0, 0);
    zone.setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => { drawBg(true);  label.setColor('#ffffff'); });
    zone.on('pointerout',  () => { drawBg(false); label.setColor('#aabbcc'); });
    zone.on('pointerdown', () => { this.scene.start('LevelSelectScene'); });
  }
}
