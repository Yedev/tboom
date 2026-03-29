import Phaser from 'phaser';
import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y,
  PIECE_COLORS, PIECE_BORDER_COLORS,
  BLOCK_HIGHLIGHT_ALPHA, BLOCK_SHADOW_ALPHA, BLOCK_BEVEL_SIZE,
  CLEAR_FLASH_INTERVAL, CLEAR_FLASH_COLOR,
} from '../constants';

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

  /**
   * Redraw the board. Only actually renders if dirty or during line-clear animation.
   * @param board The 2D board array
   * @param clearingLines Whether line-clear animation is active
   * @param clearedRows Rows being cleared
   * @param clearAnimTimer Animation timer for flash effect
   */
  render(
    board: number[][],
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
        if (cell !== 0) {
          if (clearingLines && clearedRows.includes(r)) {
            const flash = Math.floor(clearAnimTimer / CLEAR_FLASH_INTERVAL) % 2 === 0;
            if (flash) {
              this.drawBlock(BOARD_X + c * BLOCK_SIZE, BOARD_Y + r * BLOCK_SIZE, CLEAR_FLASH_COLOR, CLEAR_FLASH_COLOR);
            } else {
              this.drawBlock(BOARD_X + c * BLOCK_SIZE, BOARD_Y + r * BLOCK_SIZE, PIECE_COLORS[cell], PIECE_BORDER_COLORS[cell]);
            }
          } else {
            this.drawBlock(BOARD_X + c * BLOCK_SIZE, BOARD_Y + r * BLOCK_SIZE, PIECE_COLORS[cell], PIECE_BORDER_COLORS[cell]);
          }
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
}
