import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y,
  CHAR_WIDTH, CHAR_HEIGHT,
  BOMB_SIZE, BOMB_GRAVITY, BOMB_FUSE_TIME,
  BOMB_BLAST_RADIUS, BOMB_HURT_RADIUS, BOMB_DAMAGE,
  BOMB_EXPLOSION_DURATION, MAX_DELTA_MS, BOMB_TICK_TIMINGS,
  BOMB_MAX_COUNT,
  TETROMINOES,
} from '../constants';
import { BoardModel } from './BoardModel';
import { PlayerUpgrades } from './PlayerUpgrades';

export interface BombData {
  x: number;
  y: number;
  vy: number;
  timer: number;
  grounded: boolean;
}

export interface ExplosionData {
  cells: { col: number; row: number }[];
  timer: number;
}

export interface ExplosionResult {
  destroyedCells: { col: number; row: number }[];
  bombCol: number;
  bombRow: number;
  hurtCharDist: number;
}

export class BombSystem {
  private boardModel: BoardModel;
  private upgrades: PlayerUpgrades;

  bombCount: number = 0;
  bombs: BombData[] = [];
  explosions: ExplosionData[] = [];

  constructor(boardModel: BoardModel, upgrades: PlayerUpgrades) {
    this.boardModel = boardModel;
    this.upgrades   = upgrades;
  }

  get maxBombs(): number {
    return BOMB_MAX_COUNT + this.upgrades.bombMaxCountBonus;
  }

  addBomb(): void {
    if (this.bombCount < this.maxBombs) this.bombCount++;
  }

  placeBomb(charX: number, charY: number): void {
    if (this.bombCount <= 0) return;
    this.bombCount--;
    const bx = charX + (CHAR_WIDTH - BOMB_SIZE) / 2;
    const by = charY + CHAR_HEIGHT - BOMB_SIZE;
    this.bombs.push({
      x: bx, y: by, vy: 0,
      timer: BOMB_FUSE_TIME,
      grounded: false,
    });
  }

  updateBombs(delta: number): { toExplode: number[]; ticks: boolean[] } {
    const board = this.boardModel.getBoard();
    const dt = Math.min(delta, MAX_DELTA_MS) / 1000;
    const toExplode: number[] = [];
    const ticks: boolean[] = [];

    for (let i = 0; i < this.bombs.length; i++) {
      const bomb = this.bombs[i];

      bomb.vy += BOMB_GRAVITY * dt;
      bomb.y  += bomb.vy * dt;

      bomb.grounded = false;
      const bBottom    = bomb.y + BOMB_SIZE;
      const boardBottom = BOARD_Y + ROWS * BLOCK_SIZE;

      if (bBottom >= boardBottom) {
        bomb.y       = boardBottom - BOMB_SIZE;
        bomb.vy      = 0;
        bomb.grounded = true;
      }

      const bCenterX = bomb.x + BOMB_SIZE / 2;
      const col = Math.floor((bCenterX - BOARD_X) / BLOCK_SIZE);
      if (col >= 0 && col < COLS) {
        const bTop = bomb.y;
        for (let r = ROWS - 1; r >= 0; r--) {
          if (board[r][col] === 0) continue;
          const cellTop = BOARD_Y + r * BLOCK_SIZE;
          if (bBottom > cellTop && bTop < cellTop) {
            bomb.y       = cellTop - BOMB_SIZE;
            bomb.vy      = 0;
            bomb.grounded = true;
            break;
          }
        }
      }

      bomb.timer -= delta;
      let ticked = false;
      for (const threshold of BOMB_TICK_TIMINGS) {
        if (bomb.timer <= threshold && bomb.timer + delta > threshold) {
          ticked = true;
        }
      }
      ticks.push(ticked);

      if (bomb.timer <= 0) toExplode.push(i);
    }

    return { toExplode, ticks };
  }

  explodeBomb(bombIndex: number, charX: number, charY: number): ExplosionResult {
    const bomb  = this.bombs[bombIndex];
    const board = this.boardModel.getBoard();
    const bCol  = Math.floor((bomb.x + BOMB_SIZE / 2 - BOARD_X) / BLOCK_SIZE);
    const bRow  = Math.floor((bomb.y + BOMB_SIZE / 2 - BOARD_Y) / BLOCK_SIZE);

    const blastRadius = BOMB_BLAST_RADIUS + this.upgrades.bombBlastRadiusBonus;

    const destroyedCells: { col: number; row: number }[] = [];
    for (let dr = -blastRadius; dr <= blastRadius; dr++) {
      for (let dc = -blastRadius; dc <= blastRadius; dc++) {
        const r = bRow + dr;
        const c = bCol + dc;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] !== 0) {
          board[r][c] = 0;
          destroyedCells.push({ col: c, row: r });
        }
      }
    }

    // Explosion visual cells (all in blast area, including empty)
    const allCells: { col: number; row: number }[] = [];
    for (let dr = -blastRadius; dr <= blastRadius; dr++) {
      for (let dc = -blastRadius; dc <= blastRadius; dc++) {
        const r = bRow + dr;
        const c = bCol + dc;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          allCells.push({ col: c, row: r });
        }
      }
    }
    this.explosions.push({ cells: allCells, timer: BOMB_EXPLOSION_DURATION });

    // Character hurt distance (Chebyshev)
    const charCol = (charX + CHAR_WIDTH  / 2 - BOARD_X) / BLOCK_SIZE;
    const charRow = (charY + CHAR_HEIGHT / 2 - BOARD_Y) / BLOCK_SIZE;
    const dist = Math.max(Math.abs(charCol - bCol), Math.abs(charRow - bRow));

    this.bombs.splice(bombIndex, 1);

    return {
      destroyedCells,
      bombCol: bCol,
      bombRow: bRow,
      hurtCharDist: dist,
    };
  }

  updateExplosions(delta: number): void {
    for (const exp of this.explosions) exp.timer -= delta;
    this.explosions = this.explosions.filter(e => e.timer > 0);
  }

  checkPieceBombCollision(piece: { type: number; rotation: number; x: number; y: number }): number[] {
    const shape = TETROMINOES[piece.type][piece.rotation];
    const pieceCells: { col: number; row: number }[] = [];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          pieceCells.push({ col: piece.x + c, row: piece.y + r });
        }
      }
    }

    const hitIndices: number[] = [];
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      const bCol = Math.floor((bomb.x + BOMB_SIZE / 2 - BOARD_X) / BLOCK_SIZE);
      const bRow = Math.floor((bomb.y + BOMB_SIZE / 2 - BOARD_Y) / BLOCK_SIZE);
      for (const cell of pieceCells) {
        if (cell.col === bCol && cell.row === bRow) {
          hitIndices.push(i);
          break;
        }
      }
    }
    return hitIndices;
  }

  reset(): void {
    this.bombCount  = 0;
    this.bombs      = [];
    this.explosions = [];
  }
}
