import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { LevelProgress, MAX_LEVELS } from '../core/LevelProgress';

const BLOCK_SIZE = 64;
const BLOCK_GAP = 20;
const ROW_GAP = 60;

// Define level positions directly as [x, y] pixel coordinates
// Snake path layout, centered on canvas
const LEVEL_COORDS: [number, number][] = [
  // Row 0: levels 1-4 (left to right)
  [100, 180], [200, 180], [300, 180], [400, 180],
  // Row 1: levels 5-8 (right to left, zigzag)
  [400, 300], [300, 300], [200, 300], [100, 300],
  // Row 2: levels 9-10 (left to right)
  [150, 420], [250, 420],
];

// Connection order (which levels connect to which)
const CONNECTIONS: [number, number][] = [
  [1, 2], [2, 3], [3, 4],
  [4, 5], [5, 6], [6, 7], [7, 8],
  [8, 9], [9, 10],
];

export class LevelSelectScene extends Phaser.Scene {
  private progress: LevelProgress;
  private levelBlocks: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'LevelSelectScene' });
    this.progress = LevelProgress.getInstance();
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x0a0a1a).setOrigin(0, 0);

    // Title
    this.add.text(CANVAS_WIDTH / 2, 60, 'SELECT STAGE', {
      fontSize: '32px', fontFamily: 'monospace',
      color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Draw connections first (behind blocks)
    this.drawConnections();

    // Draw level blocks
    this.drawLevelBlocks();

    // Back button
    this.createBackButton();

    // Reset progress button (for testing)
    this.createResetButton();
  }

  private getBlockCenter(level: number): { x: number; y: number } {
    const [x, y] = LEVEL_COORDS[level - 1];
    return { x, y };
  }

  private drawConnections(): void {
    const gfx = this.add.graphics();
    gfx.lineStyle(3, 0x445566, 0.8);

    for (const [from, to] of CONNECTIONS) {
      const fromPos = this.getBlockCenter(from);
      const toPos = this.getBlockCenter(to);

      // Draw dashed line
      this.drawDashedLine(gfx, fromPos.x, fromPos.y, toPos.x, toPos.y);
    }
  }

  private drawDashedLine(
    gfx: Phaser.GameObjects.Graphics,
    x1: number, y1: number,
    x2: number, y2: number,
  ): void {
    const dashLen = 12;
    const gapLen = 8;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;

    const nx = dx / dist;
    const ny = dy / dist;

    let drawn = 0;
    let isDash = true;
    while (drawn < dist) {
      const len = isDash ? dashLen : gapLen;
      const start = drawn;
      const end = Math.min(drawn + len, dist);

      if (isDash) {
        gfx.beginPath();
        gfx.moveTo(x1 + nx * start, y1 + ny * start);
        gfx.lineTo(x1 + nx * end, y1 + ny * end);
        gfx.strokePath();
      }

      drawn = end;
      isDash = !isDash;
    }
  }

  private drawLevelBlocks(): void {
    for (let level = 1; level <= MAX_LEVELS; level++) {
      const pos = this.getBlockCenter(level);
      const container = this.createLevelBlock(level, pos.x, pos.y);
      this.levelBlocks.push(container);
    }
  }

  private createLevelBlock(level: number, x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const isUnlocked = this.progress.isUnlocked(level);
    const isCleared = this.progress.isCleared(level);

    // Block background
    const bg = this.add.graphics();
    const halfSize = BLOCK_SIZE / 2;

    if (!isUnlocked) {
      // Locked: gray
      bg.fillStyle(0x334455, 0.8);
      bg.fillRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
      bg.lineStyle(2, 0x445566, 0.6);
      bg.strokeRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
    } else if (isCleared) {
      // Cleared: green tint
      bg.fillStyle(0x22aa44, 0.9);
      bg.fillRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
      bg.lineStyle(3, 0x44ff66, 1);
      bg.strokeRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
    } else {
      // Available: colored
      bg.fillStyle(0x4488cc, 0.9);
      bg.fillRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
      bg.lineStyle(3, 0x66aaff, 1);
      bg.strokeRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
    }

    container.add(bg);

    // Level number
    const numColor = isUnlocked ? '#ffffff' : '#667788';
    const numText = this.add.text(0, -4, String(level), {
      fontSize: '28px', fontFamily: 'monospace',
      color: numColor, fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(numText);

    // Checkmark for cleared levels
    if (isCleared) {
      const check = this.add.text(0, 18, '\u2713', {
        fontSize: '18px', fontFamily: 'monospace',
        color: '#ffffff',
      }).setOrigin(0.5);
      container.add(check);
    }

    // Lock icon for locked levels
    if (!isUnlocked) {
      const lock = this.add.text(0, 18, '\u{1F512}', {
        fontSize: '16px',
      }).setOrigin(0.5);
      container.add(lock);
    }

    // Interactive zone for unlocked levels
    if (isUnlocked) {
      const zone = this.add.zone(0, 0, BLOCK_SIZE, BLOCK_SIZE);
      zone.setInteractive({ cursor: 'pointer' });

      zone.on('pointerover', () => {
        bg.clear();
        const hoverColor = isCleared ? 0x33cc55 : 0x55aadd;
        bg.fillStyle(hoverColor, 1);
        bg.fillRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
        bg.lineStyle(4, 0xffffff, 1);
        bg.strokeRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
      });

      zone.on('pointerout', () => {
        bg.clear();
        if (isCleared) {
          bg.fillStyle(0x22aa44, 0.9);
          bg.fillRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
          bg.lineStyle(3, 0x44ff66, 1);
        } else {
          bg.fillStyle(0x4488cc, 0.9);
          bg.fillRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
          bg.lineStyle(3, 0x66aaff, 1);
        }
        bg.strokeRect(-halfSize, -halfSize, BLOCK_SIZE, BLOCK_SIZE);
      });

      zone.on('pointerdown', () => {
        this.scene.start('GameScene', { level });
      });

      container.add(zone);
    }

    return container;
  }

  private createBackButton(): void {
    const btnX = 70;
    const btnY = CANVAS_HEIGHT - 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x334466, 0.8);
    bg.fillRoundedRect(btnX - 50, btnY - 20, 100, 40, 8);
    bg.lineStyle(2, 0x556688, 1);
    bg.strokeRoundedRect(btnX - 50, btnY - 20, 100, 40, 8);

    this.add.text(btnX, btnY, '< BACK', {
      fontSize: '16px', fontFamily: 'monospace',
      color: '#aabbcc',
    }).setOrigin(0.5);

    const zone = this.add.zone(btnX, btnY, 100, 40);
    zone.setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
  }

  private createResetButton(): void {
    const btnX = CANVAS_WIDTH - 70;
    const btnY = CANVAS_HEIGHT - 50;

    const zone = this.add.zone(btnX, btnY, 100, 40);
    zone.setInteractive({ cursor: 'pointer' });

    this.add.text(btnX, btnY, 'RESET', {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#664444',
    }).setOrigin(0.5);

    zone.on('pointerdown', () => {
      this.progress.reset();
      this.scene.restart();
    });
  }
}
