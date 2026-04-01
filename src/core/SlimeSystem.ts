import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y, MAX_DELTA_MS,
  SLIME_SIZE, SLIME_GRAVITY,
} from '../constants';
import { SlimeConfig } from '../data/LevelConfig';
import { BoardModel } from './BoardModel';

export interface SlimeData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  jumpTimer: number;
}

export interface SlimeDeathEffect {
  x: number;
  y: number;
  timer: number;     // ms remaining
  maxTimer: number;
}

export class SlimeSystem {
  slimes: SlimeData[] = [];
  deathEffects: SlimeDeathEffect[] = [];

  private boardModel: BoardModel;
  private cfg: SlimeConfig | null;
  private spawnTimer: number;

  constructor(boardModel: BoardModel, cfg: SlimeConfig | undefined) {
    this.boardModel = boardModel;
    this.cfg = cfg ?? null;
    this.spawnTimer = cfg?.firstSpawn ?? 0;
  }

  /** Update all slimes. Returns indices of slimes touching the player.
   *  @param moveMult  multiplier applied to slime move speed (from upgrades)
   *  @param jumpMult  multiplier applied to slime jump velocity magnitude (from upgrades)
   */
  update(
    delta: number,
    charX: number, charY: number, charW: number, charH: number,
    moveMult: number = 1.0, jumpMult: number = 1.0,
  ): number[] {
    if (!this.cfg) return [];

    const cfg = this.cfg;
    const dt = Math.min(delta, MAX_DELTA_MS) / 1000;
    const contactIndices: number[] = [];

    // Spawn timer
    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0 && this.slimes.length < cfg.maxCount) {
      this.spawnSlime();
      this.spawnTimer = cfg.spawnInterval;
    }

    // Update death effects
    for (const e of this.deathEffects) e.timer -= delta;
    this.deathEffects = this.deathEffects.filter(e => e.timer > 0);

    const charCX = charX + charW / 2;

    for (let i = 0; i < this.slimes.length; i++) {
      const slime = this.slimes[i];

      slime.vy += SLIME_GRAVITY * dt;

      // Jump toward player when grounded and timer fires
      slime.jumpTimer -= delta;
      if (slime.jumpTimer <= 0 && slime.grounded) {
        slime.vy = cfg.jumpVelocity * jumpMult;
        slime.grounded = false;
        const slimeCX = slime.x + SLIME_SIZE / 2;
        slime.vx = slimeCX < charCX
          ? cfg.moveSpeed * moveMult
          : -cfg.moveSpeed * moveMult;
        slime.jumpTimer = cfg.jumpInterval + (Math.random() * 500 - 250);
      }

      slime.x += slime.vx * dt;
      resolveSlimeX(slime, this.boardModel.getBoard());

      slime.y += slime.vy * dt;
      resolveSlimeY(slime, this.boardModel.getBoard());

      // Clamp horizontal to board
      if (slime.x < BOARD_X) { slime.x = BOARD_X; slime.vx = 0; }
      if (slime.x + SLIME_SIZE > BOARD_X + COLS * BLOCK_SIZE) {
        slime.x = BOARD_X + COLS * BLOCK_SIZE - SLIME_SIZE;
        slime.vx = 0;
      }

      // AABB overlap with player
      if (
        slime.x < charX + charW && slime.x + SLIME_SIZE > charX &&
        slime.y < charY + charH && slime.y + SLIME_SIZE > charY
      ) {
        contactIndices.push(i);
      }
    }

    // Remove slimes that fell off the bottom (no death effect)
    this.slimes = this.slimes.filter(s => s.y < BOARD_Y + ROWS * BLOCK_SIZE + BLOCK_SIZE * 2);

    return contactIndices;
  }

  /** Kill slimes in explosion blast cells. Returns count killed. */
  killSlimesInExplosion(blastCells: { col: number; row: number }[]): number {
    const cellSet = new Set(blastCells.map(c => `${c.col},${c.row}`));
    let killed = 0;
    this.slimes = this.slimes.filter(slime => {
      const sc = Math.floor((slime.x + SLIME_SIZE / 2 - BOARD_X) / BLOCK_SIZE);
      const sr = Math.floor((slime.y + SLIME_SIZE / 2 - BOARD_Y) / BLOCK_SIZE);
      if (cellSet.has(`${sc},${sr}`)) {
        this.addDeathEffect(slime);
        killed++;
        return false;
      }
      return true;
    });
    return killed;
  }

  /** Kill slimes overlapping a newly-locked board piece. Returns count killed. */
  killSlimesUnderPiece(): number {
    const board = this.boardModel.getBoard();
    let killed = 0;
    this.slimes = this.slimes.filter(slime => {
      const c0 = Math.max(0, Math.floor((slime.x - BOARD_X) / BLOCK_SIZE));
      const c1 = Math.min(COLS - 1, Math.floor((slime.x + SLIME_SIZE - 1 - BOARD_X) / BLOCK_SIZE));
      const r0 = Math.max(0, Math.floor((slime.y - BOARD_Y) / BLOCK_SIZE));
      const r1 = Math.min(ROWS - 1, Math.floor((slime.y + SLIME_SIZE - 1 - BOARD_Y) / BLOCK_SIZE));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (board[r][c] !== 0) {
            const cellL = BOARD_X + c * BLOCK_SIZE;
            const cellT = BOARD_Y + r * BLOCK_SIZE;
            if (
              slime.x < cellL + BLOCK_SIZE && slime.x + SLIME_SIZE > cellL &&
              slime.y < cellT + BLOCK_SIZE && slime.y + SLIME_SIZE > cellT
            ) {
              this.addDeathEffect(slime);
              killed++;
              return false;
            }
          }
        }
      }
      return true;
    });
    return killed;
  }

  reset(): void {
    this.slimes = [];
    this.deathEffects = [];
    this.spawnTimer = this.cfg?.firstSpawn ?? 0;
  }

  private addDeathEffect(slime: SlimeData): void {
    this.deathEffects.push({
      x: slime.x + SLIME_SIZE / 2,
      y: slime.y + SLIME_SIZE / 2,
      timer: 450,
      maxTimer: 450,
    });
  }

  private spawnSlime(): void {
    const col = Math.floor(Math.random() * COLS);
    const x = BOARD_X + col * BLOCK_SIZE + (BLOCK_SIZE - SLIME_SIZE) / 2;
    const y = BOARD_Y - SLIME_SIZE - 4;
    this.slimes.push({
      x, y, vx: 0, vy: 0, grounded: false,
      jumpTimer: this.cfg?.jumpInterval ?? 2000,
    });
  }
}

function resolveSlimeX(slime: SlimeData, board: number[][]): void {
  const left   = slime.x;
  const right  = slime.x + SLIME_SIZE - 1;
  const top    = slime.y;
  const bottom = slime.y + SLIME_SIZE - 1;

  const minCol = Math.max(0, Math.floor((left  - BOARD_X) / BLOCK_SIZE));
  const maxCol = Math.min(COLS - 1, Math.floor((right - BOARD_X) / BLOCK_SIZE));
  const minRow = Math.max(0, Math.floor((top   - BOARD_Y) / BLOCK_SIZE));
  const maxRow = Math.min(ROWS - 1, Math.floor((bottom - BOARD_Y) / BLOCK_SIZE));

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (board[r][c] === 0) continue;
      const cl = BOARD_X + c * BLOCK_SIZE;
      const cr = cl + BLOCK_SIZE;
      const ct = BOARD_Y + r * BLOCK_SIZE;
      const cb = ct + BLOCK_SIZE;
      if (slime.x + SLIME_SIZE <= cl || slime.x >= cr ||
          slime.y + SLIME_SIZE <= ct || slime.y >= cb) continue;
      const oL = (slime.x + SLIME_SIZE) - cl;
      const oR = cr - slime.x;
      slime.x  = oL < oR ? cl - SLIME_SIZE : cr;
      slime.vx = 0;
    }
  }
}

function resolveSlimeY(slime: SlimeData, board: number[][]): void {
  slime.grounded = false;
  const left   = slime.x;
  const right  = slime.x + SLIME_SIZE - 1;
  const top    = slime.y;
  const bottom = slime.y + SLIME_SIZE - 1;

  const minCol = Math.max(0, Math.floor((left  - BOARD_X) / BLOCK_SIZE));
  const maxCol = Math.min(COLS - 1, Math.floor((right - BOARD_X) / BLOCK_SIZE));
  const minRow = Math.max(0, Math.floor((top   - BOARD_Y) / BLOCK_SIZE));
  const maxRow = Math.min(ROWS - 1, Math.floor((bottom - BOARD_Y) / BLOCK_SIZE));

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (board[r][c] === 0) continue;
      const cl = BOARD_X + c * BLOCK_SIZE;
      const cr = cl + BLOCK_SIZE;
      const ct = BOARD_Y + r * BLOCK_SIZE;
      const cb = ct + BLOCK_SIZE;
      if (slime.x + SLIME_SIZE <= cl || slime.x >= cr ||
          slime.y + SLIME_SIZE <= ct || slime.y >= cb) continue;
      const oT = (slime.y + SLIME_SIZE) - ct;
      const oB = cb - slime.y;
      if (oT < oB) {
        slime.y        = ct - SLIME_SIZE;
        slime.vy       = 0;
        slime.grounded = true;
      } else {
        slime.y  = cb;
        slime.vy = 0;
      }
    }
  }

  // Ground probe 1px below
  if (!slime.grounded && slime.vy >= 0) {
    const probeY   = slime.y + SLIME_SIZE;
    const probeRow = Math.floor((probeY - BOARD_Y) / BLOCK_SIZE);
    if (probeRow >= 0 && probeRow < ROWS && probeY <= BOARD_Y + ROWS * BLOCK_SIZE) {
      const pMinCol = Math.max(0, Math.floor((slime.x - BOARD_X) / BLOCK_SIZE));
      const pMaxCol = Math.min(COLS - 1, Math.floor((slime.x + SLIME_SIZE - 1 - BOARD_X) / BLOCK_SIZE));
      for (let c = pMinCol; c <= pMaxCol; c++) {
        if (board[probeRow][c] !== 0) { slime.grounded = true; break; }
      }
    }
  }

  // Board bottom floor
  const boardBottom = BOARD_Y + ROWS * BLOCK_SIZE;
  if (slime.y + SLIME_SIZE >= boardBottom) {
    slime.y        = boardBottom - SLIME_SIZE;
    slime.vy       = 0;
    slime.grounded = true;
  }
}
