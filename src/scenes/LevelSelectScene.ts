import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { LevelProgress } from '../core/LevelProgress';
import { PlayerInventory, MAX_CARDS } from '../core/PlayerInventory';
import { MAP_NODES, MapNode } from '../data/mapLayout';

const NODE_R = 32;   // node circle radius

export class LevelSelectScene extends Phaser.Scene {
  private progress:  LevelProgress;
  private inventory: PlayerInventory;

  constructor() {
    super({ key: 'LevelSelectScene' });
    this.progress  = LevelProgress.getInstance();
    this.inventory = PlayerInventory.getInstance();
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x0a0a1a).setOrigin(0, 0);

    this.add.text(CANVAS_WIDTH / 2, 20, 'SELECT STAGE', {
      fontSize: '26px', fontFamily: 'monospace',
      color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    const gfx = this.add.graphics();

    // ── Draw edges ───────────────────────────────────────────────────
    gfx.lineStyle(2, 0x445566, 0.7);
    for (const node of MAP_NODES) {
      for (const nextId of node.next) {
        const target = MAP_NODES.find(n => n.id === nextId);
        if (!target) continue;
        const cleared = this.progress.isNodeCleared(node.id);
        gfx.lineStyle(2, cleared ? 0x44aa66 : 0x445566, cleared ? 0.9 : 0.5);
        this.drawDashedLine(gfx, node.x, node.y, target.x, target.y);
      }
    }

    // ── Draw nodes ───────────────────────────────────────────────────
    for (const node of MAP_NODES) {
      this.drawNode(node, gfx);
    }

    // ── Card collection panel ────────────────────────────────────────
    this.drawCardPanel();

    // ── Back button ──────────────────────────────────────────────────
    this.createButton(70, CANVAS_HEIGHT - 40, '< BACK', 0x334466, () => {
      this.scene.start('TitleScene');
    });

    // ── Reset button ─────────────────────────────────────────────────
    this.createButton(CANVAS_WIDTH - 70, CANVAS_HEIGHT - 40, 'RESET', 0x442222, () => {
      this.progress.reset();
      this.scene.restart();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────

  private drawCardPanel(): void {
    const panelY = CANVAS_HEIGHT - 110;
    const panelW = CANVAS_WIDTH - 20;
    const panelH = 66;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0d0d20, 0.92);
    bg.fillRoundedRect(10, panelY, panelW, panelH, 8);
    bg.lineStyle(1, 0x334466, 0.6);
    bg.strokeRoundedRect(10, panelY, panelW, panelH, 8);

    // Gold label
    this.add.text(18, panelY + 6, `💰 ${this.inventory.gold}`, {
      fontSize: '14px', fontFamily: 'monospace',
      color: '#ffd700', fontStyle: 'bold',
    });

    // Card slots
    const SLOT_W   = 84;
    const SLOT_H   = 40;
    const SLOT_GAP = 6;
    const totalW   = MAX_CARDS * SLOT_W + (MAX_CARDS - 1) * SLOT_GAP;
    const startX   = (CANVAS_WIDTH - totalW) / 2;
    const slotY    = panelY + panelH / 2 - SLOT_H / 2;

    for (let i = 0; i < MAX_CARDS; i++) {
      const cx   = startX + i * (SLOT_W + SLOT_GAP);
      const card = this.inventory.cards[i];

      const slotGfx = this.add.graphics();
      if (card) {
        slotGfx.fillStyle(card.color, 0.2);
        slotGfx.fillRoundedRect(cx, slotY, SLOT_W, SLOT_H, 5);
        slotGfx.lineStyle(1, card.color, 0.9);
        slotGfx.strokeRoundedRect(cx, slotY, SLOT_W, SLOT_H, 5);
        this.add.text(cx + SLOT_W / 2, slotY + SLOT_H / 2, card.name, {
          fontSize: '11px', fontFamily: 'monospace',
          color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5);
      } else {
        slotGfx.fillStyle(0x1a1a2e, 0.8);
        slotGfx.fillRoundedRect(cx, slotY, SLOT_W, SLOT_H, 5);
        slotGfx.lineStyle(1, 0x334455, 0.4);
        slotGfx.strokeRoundedRect(cx, slotY, SLOT_W, SLOT_H, 5);
        this.add.text(cx + SLOT_W / 2, slotY + SLOT_H / 2, '空', {
          fontSize: '16px', fontFamily: 'monospace', color: '#334455',
        }).setOrigin(0.5);
      }
    }
  }

  private drawNode(node: MapNode, _gfx: Phaser.GameObjects.Graphics): void {
    const cleared  = this.progress.isNodeCleared(node.id);
    const reachable = this.isReachable(node);

    let fillColor: number;
    let borderColor: number;
    let alpha: number;

    if (!reachable) {
      fillColor   = 0x222233;
      borderColor = 0x334455;
      alpha       = 0.5;
    } else if (cleared) {
      fillColor   = 0x226644;
      borderColor = 0x44ff88;
      alpha       = 1;
    } else if (node.isBoss) {
      fillColor   = 0x661122;
      borderColor = 0xff3344;
      alpha       = 1;
    } else if (node.isSkip) {
      fillColor   = 0x224466;
      borderColor = 0x4488cc;
      alpha       = 0.85;
    } else {
      fillColor   = 0x224488;
      borderColor = 0x4488ff;
      alpha       = 1;
    }

    const gfx2 = this.add.graphics();
    gfx2.fillStyle(fillColor, alpha);
    gfx2.fillCircle(node.x, node.y, NODE_R);
    gfx2.lineStyle(cleared ? 3 : 2, borderColor, alpha);
    gfx2.strokeCircle(node.x, node.y, NODE_R);

    // Boss crown indicator
    if (node.isBoss && reachable) {
      this.add.text(node.x, node.y - NODE_R - 12, '★', {
        fontSize: '14px', fontFamily: 'monospace', color: '#ffcc00',
      }).setOrigin(0.5);
    }

    // Skip indicator
    if (node.isSkip && reachable) {
      this.add.text(node.x, node.y - NODE_R - 12, '>>>', {
        fontSize: '11px', fontFamily: 'monospace', color: '#88ccff',
      }).setOrigin(0.5);
    }

    // Label
    const labelColor = reachable ? '#ffffff' : '#445566';
    this.add.text(node.x, node.y, node.label, {
      fontSize: '13px', fontFamily: 'monospace',
      color: labelColor, fontStyle: 'bold', align: 'center',
    }).setOrigin(0.5);

    // Checkmark
    if (cleared) {
      this.add.text(node.x + NODE_R - 6, node.y - NODE_R + 6, '✓', {
        fontSize: '12px', fontFamily: 'monospace', color: '#44ff88',
      }).setOrigin(0.5);
    }

    // Interactive zone
    if (reachable && !cleared) {
      const zone = this.add.zone(node.x, node.y, NODE_R * 2, NODE_R * 2);
      zone.setInteractive({ cursor: 'pointer' });
      zone.on('pointerover', () => {
        gfx2.clear();
        const hoverFill = node.isBoss ? 0x882233 : node.isSkip ? 0x336688 : 0x3366bb;
        gfx2.fillStyle(hoverFill, 1);
        gfx2.fillCircle(node.x, node.y, NODE_R);
        gfx2.lineStyle(3, 0xffffff, 1);
        gfx2.strokeCircle(node.x, node.y, NODE_R);
      });
      zone.on('pointerout', () => {
        gfx2.clear();
        gfx2.fillStyle(fillColor, alpha);
        gfx2.fillCircle(node.x, node.y, NODE_R);
        gfx2.lineStyle(2, borderColor, alpha);
        gfx2.strokeCircle(node.x, node.y, NODE_R);
      });
      zone.on('pointerdown', () => {
        this.scene.start('GameScene', { level: node.level, nodeId: node.id });
      });
    }
  }

  /**
   * A node is reachable if it is the start (level 1) OR if any node that
   * connects to it has been cleared.
   */
  private isReachable(node: MapNode): boolean {
    if (node.id === '1') return true;
    for (const n of MAP_NODES) {
      if (n.next.includes(node.id) && this.progress.isNodeCleared(n.id)) return true;
    }
    return false;
  }

  private drawDashedLine(
    gfx: Phaser.GameObjects.Graphics,
    x1: number, y1: number,
    x2: number, y2: number,
  ): void {
    const dashLen = 10;
    const gapLen  = 7;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return;
    const nx = dx / dist;
    const ny = dy / dist;
    let drawn = 0;
    let isDash = true;
    while (drawn < dist) {
      const segLen = isDash ? dashLen : gapLen;
      const end = Math.min(drawn + segLen, dist);
      if (isDash) {
        gfx.beginPath();
        gfx.moveTo(x1 + nx * drawn, y1 + ny * drawn);
        gfx.lineTo(x1 + nx * end,   y1 + ny * end);
        gfx.strokePath();
      }
      drawn  = end;
      isDash = !isDash;
    }
  }

  private createButton(x: number, y: number, label: string, color: number, cb: () => void): void {
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.8);
    bg.fillRoundedRect(x - 50, y - 18, 100, 36, 8);
    this.add.text(x, y, label, {
      fontSize: '14px', fontFamily: 'monospace', color: '#aabbcc',
    }).setOrigin(0.5);
    const zone = this.add.zone(x, y, 100, 36);
    zone.setInteractive({ cursor: 'pointer' });
    zone.on('pointerdown', cb);
  }
}
