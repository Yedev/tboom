import Phaser from 'phaser';
import {
  BLOCK_SIZE, BOARD_X, BOARD_Y, BOMB_SIZE, BOMB_FUSE_TIME, BOMB_BLAST_RADIUS,
  BOMB_FLASH_RATE_MIN, BOMB_FLASH_RATE_MAX, BOMB_BODY_DARK, BOMB_BODY_LIGHT,
  BOMB_HIGHLIGHT_COLOR, BOMB_HIGHLIGHT_ALPHA, BOMB_FUSE_COLOR,
  BOMB_SPARK_COLOR, BOMB_SPARK_GLOW_COLOR, BOMB_SPARK_GLOW_ALPHA,
  BOMB_EXPLOSION_DURATION, EXPLOSION_FLASH_INTERVAL, EXPLOSION_FLASH_ALPHA,
  EXPLOSION_COLOR_A, EXPLOSION_COLOR_B, CHAR_SCALE,
} from '../constants';

export interface BombRenderData {
  x: number;
  y: number;
  timer: number;
  graphics: Phaser.GameObjects.Graphics;
}

export interface ExplosionRenderData {
  cells: { col: number; row: number }[];
  timer: number;
  graphics: Phaser.GameObjects.Graphics;
}

export class BombRenderer {
  drawBomb(bomb: BombRenderData): void {
    bomb.graphics.clear();
    const cx = bomb.x + BOMB_SIZE / 2;
    const cy = bomb.y + BOMB_SIZE / 2;
    const ratio = Math.max(0, bomb.timer / BOMB_FUSE_TIME);
    const flashRate = BOMB_FLASH_RATE_MIN + ratio * BOMB_FLASH_RATE_MAX;
    const flash = Math.floor(bomb.timer / flashRate) % 2 === 0;
    const S = CHAR_SCALE;

    bomb.graphics.fillStyle(flash ? BOMB_BODY_LIGHT : BOMB_BODY_DARK);
    bomb.graphics.fillCircle(cx, cy + 1 * S, 6 * S);

    bomb.graphics.fillStyle(BOMB_HIGHLIGHT_COLOR, BOMB_HIGHLIGHT_ALPHA);
    bomb.graphics.fillCircle(cx - 2 * S, cy - 1 * S, 2 * S);

    bomb.graphics.lineStyle(1.5 * S, BOMB_FUSE_COLOR);
    bomb.graphics.lineBetween(cx, cy - 5 * S, cx + 2 * S, cy - 8 * S);

    if (flash) {
      bomb.graphics.fillStyle(BOMB_SPARK_COLOR);
      bomb.graphics.fillCircle(cx + 2 * S, cy - 8 * S, 2 * S);
      bomb.graphics.fillStyle(BOMB_SPARK_GLOW_COLOR, BOMB_SPARK_GLOW_ALPHA);
      bomb.graphics.fillCircle(cx + 2 * S, cy - 9 * S, 1 * S);
    }
  }

  drawExplosions(explosions: ExplosionRenderData[]): void {
    for (const exp of explosions) {
      exp.timer -= 0; // Timer is managed externally, we just read
      exp.graphics.clear();
      const alpha = Math.max(0, exp.timer / BOMB_EXPLOSION_DURATION);
      for (const cell of exp.cells) {
        const px = BOARD_X + cell.col * BLOCK_SIZE;
        const py = BOARD_Y + cell.row * BLOCK_SIZE;
        const flash = Math.floor(exp.timer / EXPLOSION_FLASH_INTERVAL) % 2 === 0;
        exp.graphics.fillStyle(flash ? EXPLOSION_COLOR_A : EXPLOSION_COLOR_B, alpha * EXPLOSION_FLASH_ALPHA);
        exp.graphics.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}
