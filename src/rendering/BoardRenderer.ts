import Phaser from 'phaser';
import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y,
  PIECE_COLORS, PIECE_BORDER_COLORS,
  BLOCK_HIGHLIGHT_ALPHA, BLOCK_SHADOW_ALPHA, BLOCK_BEVEL_SIZE,
  CLEAR_FLASH_INTERVAL, CLEAR_FLASH_COLOR,
} from '../constants';
import { BlockType } from '../core/BlockType';

export class BoardRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private dirty = true;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  markDirty(): void {
    this.dirty = true;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  render(
    board: number[][],
    blockTypes: BlockType[][],
    clearingLines: boolean = false,
    clearedRows: number[] = [],
    clearAnimTimer: number = 0,
  ): void {
    if (!this.dirty && !clearingLines) return;
    this.dirty = false;

    this.graphics.clear();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (cell === 0) continue;

        const px = BOARD_X + c * BLOCK_SIZE;
        const py = BOARD_Y + r * BLOCK_SIZE;

        if (clearingLines && clearedRows.includes(r)) {
          const flash = Math.floor(clearAnimTimer / CLEAR_FLASH_INTERVAL) % 2 === 0;
          if (flash) {
            this.drawBlock(px, py, CLEAR_FLASH_COLOR, CLEAR_FLASH_COLOR);
          } else {
            this.drawBlock(px, py, PIECE_COLORS[cell], PIECE_BORDER_COLORS[cell]);
          }
        } else {
          this.drawBlock(px, py, PIECE_COLORS[cell], PIECE_BORDER_COLORS[cell]);
          const btype = blockTypes?.[r]?.[c] ?? BlockType.NORMAL;
          this.drawBlockTypeOverlay(px, py, btype);
        }
      }
    }
  }

  clear(): void {
    this.graphics.clear();
  }

  private drawBlock(px: number, py: number, color: number, borderColor: number, alpha: number = 1): void {
    const s = BLOCK_SIZE;
    this.graphics.fillStyle(color, alpha);
    this.graphics.fillRect(px, py, s, s);

    this.graphics.fillStyle(0xffffff, BLOCK_HIGHLIGHT_ALPHA * alpha);
    this.graphics.fillRect(px, py, s, BLOCK_BEVEL_SIZE);
    this.graphics.fillRect(px, py, BLOCK_BEVEL_SIZE, s);

    this.graphics.fillStyle(0x000000, BLOCK_SHADOW_ALPHA * alpha);
    this.graphics.fillRect(px, py + s - BLOCK_BEVEL_SIZE, s, BLOCK_BEVEL_SIZE);
    this.graphics.fillRect(px + s - BLOCK_BEVEL_SIZE, py, BLOCK_BEVEL_SIZE, s);

    this.graphics.lineStyle(1, borderColor, alpha);
    this.graphics.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
  }

  /** Draw a visual overlay on top of the base block color to indicate special type */
  private drawBlockTypeOverlay(px: number, py: number, btype: BlockType): void {
    const s = BLOCK_SIZE;
    const cx = px + s / 2;
    const cy = py + s / 2;

    switch (btype) {
      case BlockType.HARD: {
        // Dark semi-transparent overlay + cross-hatch lines
        this.graphics.fillStyle(0x000000, 0.35);
        this.graphics.fillRect(px, py, s, s);
        this.graphics.lineStyle(1, 0x888888, 0.7);
        for (let d = 0; d <= s; d += 8) {
          this.graphics.lineBetween(px + d, py, px, py + d);
          this.graphics.lineBetween(px + s, py + d, px + d, py + s);
        }
        break;
      }
      case BlockType.CHEST: {
        // Gold border + simple diamond shape in center
        this.graphics.lineStyle(2, 0xffdd00, 1);
        this.graphics.strokeRect(px + 2, py + 2, s - 4, s - 4);
        this.graphics.fillStyle(0xffdd00, 0.9);
        this.graphics.fillTriangle(cx, cy - 5, cx + 5, cy, cx, cy + 5);
        this.graphics.fillTriangle(cx, cy - 5, cx - 5, cy, cx, cy + 5);
        break;
      }
      case BlockType.POISON: {
        // Purple tint overlay + two small circles (skull eye effect)
        this.graphics.fillStyle(0x9900cc, 0.30);
        this.graphics.fillRect(px, py, s, s);
        this.graphics.fillStyle(0xcc44ff, 0.9);
        this.graphics.fillCircle(cx - 4, cy - 2, 3);
        this.graphics.fillCircle(cx + 4, cy - 2, 3);
        this.graphics.lineStyle(1, 0xcc44ff, 0.8);
        this.graphics.lineBetween(cx - 4, cy + 3, cx + 4, cy + 3);
        break;
      }
      case BlockType.BOMB_BLOCK: {
        // Red tint + bomb circle with fuse dot
        this.graphics.fillStyle(0xdd0000, 0.25);
        this.graphics.fillRect(px, py, s, s);
        this.graphics.lineStyle(2, 0xff3300, 0.9);
        this.graphics.strokeCircle(cx, cy + 2, 6);
        this.graphics.fillStyle(0xff6600, 1);
        this.graphics.fillCircle(cx + 4, cy - 5, 2);
        break;
      }
      // NORMAL: no overlay
    }
  }
}
