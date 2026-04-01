import Phaser from 'phaser';
import { UpgradeCard } from '../core/PlayerUpgrades';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const CARD_W  = 130;
const CARD_H  = 210;
const CARD_GAP = 16;
const CARDS_START_Y = 340;

export class CardOverlay {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene     = scene;
    this.container = scene.add.container(0, 0);
    this.container.setVisible(false);
    this.container.setDepth(100);
  }

  show(
    cards: UpgradeCard[],
    clearedStage: number,
    onSelect: (card: UpgradeCard) => void,
  ): void {
    this.container.removeAll(true);

    // Dim background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.88);
    bg.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(CANVAS_WIDTH / 2, 180,
      `STAGE ${clearedStage} CLEAR!`, {
        fontSize: '34px', fontFamily: 'monospace',
        color: '#ffdd44', fontStyle: 'bold',
      },
    ).setOrigin(0.5);
    this.container.add(title);

    const sub = this.scene.add.text(CANVAS_WIDTH / 2, 228, '选择一项强化', {
      fontSize: '20px', fontFamily: 'monospace', color: '#aabbcc',
    }).setOrigin(0.5);
    this.container.add(sub);

    // Cards
    const totalW  = cards.length * CARD_W + (cards.length - 1) * CARD_GAP;
    const startX  = (CANVAS_WIDTH - totalW) / 2;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const cx   = startX + i * (CARD_W + CARD_GAP);
      const cy   = CARDS_START_Y;

      this.buildCard(card, cx, cy, onSelect);
    }

    this.container.setVisible(true);
  }

  private buildCard(
    card: UpgradeCard,
    cx: number,
    cy: number,
    onSelect: (card: UpgradeCard) => void,
  ): void {
    const scene = this.scene;

    const bg = scene.add.graphics();
    this.drawCardBg(bg, cx, cy, card.color, false);
    this.container.add(bg);

    // Colored header bar
    const header = scene.add.graphics();
    header.fillStyle(card.color, 0.85);
    header.fillRect(cx, cy, CARD_W, 44);
    this.container.add(header);

    // Card name
    const nameText = scene.add.text(cx + CARD_W / 2, cy + 22, card.name, {
      fontSize: '17px', fontFamily: 'monospace',
      color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(nameText);

    // Positive description (green)
    const desc = scene.add.text(cx + CARD_W / 2, cy + 58, `✦ ${card.description}`, {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#66ff88', wordWrap: { width: CARD_W - 16 }, align: 'center',
    }).setOrigin(0.5, 0);
    this.container.add(desc);

    // Divider
    const divider = scene.add.graphics();
    divider.lineStyle(1, 0x334455, 0.8);
    divider.lineBetween(cx + 10, cy + 118, cx + CARD_W - 10, cy + 118);
    this.container.add(divider);

    // Negative description (red)
    const negDesc = scene.add.text(cx + CARD_W / 2, cy + 126, `✦ ${card.negativeDescription}`, {
      fontSize: '13px', fontFamily: 'monospace',
      color: '#ff6655', wordWrap: { width: CARD_W - 16 }, align: 'center',
    }).setOrigin(0.5, 0);
    this.container.add(negDesc);

    // Click hint
    const hint = scene.add.text(cx + CARD_W / 2, cy + CARD_H - 22, '点击选择', {
      fontSize: '12px', fontFamily: 'monospace', color: '#8899aa',
    }).setOrigin(0.5);
    this.container.add(hint);

    // Interactive hit zone
    const zone = scene.add.zone(cx, cy, CARD_W, CARD_H).setOrigin(0, 0);
    zone.setInteractive({ cursor: 'pointer' });
    zone.on('pointerover', () => {
      this.drawCardBg(bg, cx, cy, card.color, true);
      hint.setColor('#ffdd44');
    });
    zone.on('pointerout', () => {
      this.drawCardBg(bg, cx, cy, card.color, false);
      hint.setColor('#8899aa');
    });
    zone.on('pointerdown', () => {
      this.hide();
      onSelect(card);
    });
    this.container.add(zone);
  }

  private drawCardBg(
    gfx: Phaser.GameObjects.Graphics,
    cx: number, cy: number,
    color: number,
    hovered: boolean,
  ): void {
    gfx.clear();
    gfx.fillStyle(hovered ? 0x1e2240 : 0x111830, 1);
    gfx.fillRoundedRect(cx, cy, CARD_W, CARD_H, 8);
    gfx.lineStyle(hovered ? 3 : 2, color, hovered ? 1 : 0.7);
    gfx.strokeRoundedRect(cx, cy, CARD_W, CARD_H, 8);
  }

  hide(): void {
    this.container.setVisible(false);
    this.container.removeAll(true);
  }
}
