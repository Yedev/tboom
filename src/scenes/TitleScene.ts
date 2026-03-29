import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export class TitleScene extends Phaser.Scene {
  private flashText!: Phaser.GameObjects.Text;
  private flashTimer  = 0;
  private showFlash   = true;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    // Background
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x0a0a1a).setOrigin(0, 0);

    this.drawDecorativeBlocks();

    // T-BOOM title with glow effect (layered text)
    this.add.text(CANVAS_WIDTH / 2 + 2, 202, 'T-BOOM', {
      fontSize: '68px', fontFamily: 'monospace', color: '#aa6600', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.5);
    this.add.text(CANVAS_WIDTH / 2, 200, 'T-BOOM', {
      fontSize: '68px', fontFamily: 'monospace', color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(CANVAS_WIDTH / 2, 278, 'TETRIS + PLATFORMER', {
      fontSize: '17px', fontFamily: 'monospace', color: '#8899bb', letterSpacing: 3,
    }).setOrigin(0.5);

    // Divider
    const div = this.add.graphics();
    div.lineStyle(1, 0x334466, 0.8);
    div.lineBetween(60, 312, CANVAS_WIDTH - 60, 312);

    // How to play
    const infoY   = 334;
    const bodyClr = '#667788';
    const headClr = '#99aacc';
    this.add.text(CANVAS_WIDTH / 2, infoY,       '— How to Play —', {
      fontSize: '15px', fontFamily: 'monospace', color: headClr,
    }).setOrigin(0.5);
    this.add.text(CANVAS_WIDTH / 2, infoY + 30,  'Jump on locked Tetris blocks', {
      fontSize: '14px', fontFamily: 'monospace', color: bodyClr,
    }).setOrigin(0.5);
    this.add.text(CANVAS_WIDTH / 2, infoY + 52,  'Place bombs (E) to destroy blocks', {
      fontSize: '14px', fontFamily: 'monospace', color: bodyClr,
    }).setOrigin(0.5);
    this.add.text(CANVAS_WIDTH / 2, infoY + 74,  'Clear lines to complete stages', {
      fontSize: '14px', fontFamily: 'monospace', color: bodyClr,
    }).setOrigin(0.5);
    this.add.text(CANVAS_WIDTH / 2, infoY + 96,  'Choose upgrades between stages!', {
      fontSize: '14px', fontFamily: 'monospace', color: bodyClr,
    }).setOrigin(0.5);
    this.add.text(CANVAS_WIDTH / 2, infoY + 118, 'Avoid being crushed!', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ff6644',
    }).setOrigin(0.5);

    // Controls
    const ctrlY   = infoY + 158;
    const ctrlClr = '#445566';
    this.add.text(CANVAS_WIDTH / 2, ctrlY,      'A/D  Move    Space  Jump    E  Bomb', {
      fontSize: '12px', fontFamily: 'monospace', color: ctrlClr,
    }).setOrigin(0.5);
    this.add.text(CANVAS_WIDTH / 2, ctrlY + 18, 'Q  Rotate    W  Drop    S  Hard Drop', {
      fontSize: '12px', fontFamily: 'monospace', color: ctrlClr,
    }).setOrigin(0.5);

    // Flashing start prompt
    this.flashText = this.add.text(CANVAS_WIDTH / 2, 664, 'Press SPACE / Tap to Start', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Keyboard
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        this.scene.start('GameScene');
      }
    });

    // Touch / click
    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }

  update(_time: number, delta: number): void {
    this.flashTimer += delta;
    if (this.flashTimer >= 620) {
      this.flashTimer = 0;
      this.showFlash  = !this.showFlash;
      this.flashText.setVisible(this.showFlash);
    }
  }

  private drawDecorativeBlocks(): void {
    const gfx = this.add.graphics();

    const blocks: Array<{ x: number; y: number; color: number; alpha?: number }> = [
      // Left column — cyan I pieces
      { x: 22,  y: 76,  color: 0x00f0f0 },
      { x: 54,  y: 76,  color: 0x00f0f0 },
      { x: 22,  y: 108, color: 0x00f0f0 },
      // Left lower — purple T piece
      { x: 22,  y: 580, color: 0xa000f0 },
      { x: 54,  y: 548, color: 0xa000f0 },
      { x: 54,  y: 580, color: 0xa000f0 },
      { x: 86,  y: 580, color: 0xa000f0 },
      // Right column — red Z pieces
      { x: 434, y: 76,  color: 0xf00000 },
      { x: 434, y: 108, color: 0xf00000 },
      { x: 466, y: 108, color: 0xf00000 },
      // Right lower — green S
      { x: 434, y: 548, color: 0x00f000 },
      { x: 434, y: 580, color: 0x00f000 },
      { x: 466, y: 580, color: 0x00f000 },
    ];

    for (const b of blocks) {
      const s = 30;
      const a = b.alpha ?? 0.55;
      gfx.fillStyle(b.color, a);
      gfx.fillRect(b.x, b.y, s, s);
      gfx.fillStyle(0xffffff, 0.12);
      gfx.fillRect(b.x, b.y, s, 3);
      gfx.fillRect(b.x, b.y, 3, s);
      gfx.fillStyle(0x000000, 0.15);
      gfx.fillRect(b.x + s - 3, b.y, 3, s);
      gfx.fillRect(b.x, b.y + s - 3, s, 3);
    }
  }
}
