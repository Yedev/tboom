import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y,
  CHAR_WIDTH, CHAR_HEIGHT, CHAR_GRAVITY, CHAR_JUMP_VELOCITY, CHAR_MOVE_SPEED,
  CHAR_MAX_HP, CHAR_CRUSH_DAMAGE, CHAR_INVINCIBLE_DURATION,
  CHAR_ABOVE_BOARD_BLOCKS, CHAR_FALL_OFF_MARGIN,
  MAX_DELTA_MS, FIND_FREE_STEP, FIND_FREE_MAX_RADIUS,
} from '../constants';
import { BoardModel } from './BoardModel';
import { PlayerUpgrades } from './PlayerUpgrades';

export interface CharacterInput {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  bomb: boolean;
}

export interface CharacterState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  hp: number;
  alive: boolean;
  invincibleTimer: number;
  animTime: number;
}

export class CharacterPhysics {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  hp: number;
  alive: boolean = true;
  grounded: boolean = false;
  invincibleTimer: number = 0;
  animTime: number = 0;

  private boardModel: BoardModel;
  private upgrades: PlayerUpgrades;

  constructor(boardModel: BoardModel, upgrades: PlayerUpgrades) {
    this.boardModel = boardModel;
    this.upgrades   = upgrades;
    this.x          = 0;
    this.y          = 0;
    this.hp         = this.maxHp;
    this.spawnAtBottom();
  }

  get maxHp(): number {
    return CHAR_MAX_HP + this.upgrades.maxHpBonus;
  }

  getCharCenterX(): number { return this.x + CHAR_WIDTH  / 2; }
  getCharCenterY(): number { return this.y + CHAR_HEIGHT / 2; }

  update(delta: number, input: CharacterInput): void {
    if (!this.alive) return;
    const dt = Math.min(delta, MAX_DELTA_MS) / 1000;
    this.animTime += dt;

    this.vx = 0;
    if (input.moveLeft)  this.vx = -CHAR_MOVE_SPEED * this.upgrades.moveSpeedMult;
    if (input.moveRight) this.vx =  CHAR_MOVE_SPEED * this.upgrades.moveSpeedMult;
    if (input.jump && this.grounded) {
      this.vy      = CHAR_JUMP_VELOCITY * this.upgrades.jumpVelocityMult;
      this.grounded = false;
    }

    this.vy += CHAR_GRAVITY * dt;

    this.x += this.vx * dt;
    this.resolveCollisionsX();
    this.y += this.vy * dt;
    this.resolveCollisionsY();

    this.clampToBounds();

    if (this.y + CHAR_HEIGHT > BOARD_Y + ROWS * BLOCK_SIZE + CHAR_FALL_OFF_MARGIN) {
      this.takeDamage(this.maxHp);
    }

    if (this.invincibleTimer > 0) this.invincibleTimer -= delta;
  }

  checkCrushOnLock(): boolean {
    if (!this.alive) return false;
    const board = this.boardModel.getBoard();
    const left   = this.x;
    const right  = this.x + CHAR_WIDTH  - 1;
    const top    = this.y;
    const bottom = this.y + CHAR_HEIGHT - 1;

    const minCol = Math.max(0, Math.floor((left  - BOARD_X) / BLOCK_SIZE));
    const maxCol = Math.min(COLS - 1, Math.floor((right - BOARD_X) / BLOCK_SIZE));
    const minRow = Math.max(0, Math.floor((top   - BOARD_Y) / BLOCK_SIZE));
    const maxRow = Math.min(ROWS - 1, Math.floor((bottom - BOARD_Y) / BLOCK_SIZE));

    let crushed = false;
    for (let r = minRow; r <= maxRow && !crushed; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (board[r][c] !== 0) {
          const cellLeft = BOARD_X + c * BLOCK_SIZE;
          const cellTop  = BOARD_Y + r * BLOCK_SIZE;
          if (left  <= cellLeft + BLOCK_SIZE - 1 && right  >= cellLeft &&
              top   <= cellTop  + BLOCK_SIZE - 1 && bottom >= cellTop) {
            crushed = true;
            break;
          }
        }
      }
    }

    if (crushed) {
      this.takeDamage(CHAR_CRUSH_DAMAGE);
      const free = this.findNearestFreePosition();
      if (free) { this.x = free.x; this.y = free.y; }
      else       { this.takeDamage(this.maxHp); }
      return true;
    }
    return false;
  }

  takeDamage(amount: number): void {
    if (!this.alive || this.invincibleTimer > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleTimer = CHAR_INVINCIBLE_DURATION;
    if (this.hp <= 0) this.alive = false;
  }

  getState(): CharacterState {
    return {
      x: this.x, y: this.y, vx: this.vx, vy: this.vy,
      grounded: this.grounded, hp: this.hp, alive: this.alive,
      invincibleTimer: this.invincibleTimer, animTime: this.animTime,
    };
  }

  reset(): void {
    this.hp              = this.maxHp;
    this.alive           = true;
    this.vx              = 0;
    this.vy              = 0;
    this.invincibleTimer = 0;
    this.grounded        = false;
    this.animTime        = 0;
    this.spawnAtBottom();
  }

  private spawnAtBottom(): void {
    this.x = BOARD_X + Math.floor(COLS / 2) * BLOCK_SIZE + (BLOCK_SIZE - CHAR_WIDTH) / 2;
    this.y = BOARD_Y + (ROWS - 1) * BLOCK_SIZE - CHAR_HEIGHT;
    const board = this.boardModel.getBoard();
    for (let r = ROWS - 1; r >= 0; r--) {
      const c1 = Math.floor((this.x - BOARD_X) / BLOCK_SIZE);
      const c2 = Math.floor((this.x + CHAR_WIDTH - 1 - BOARD_X) / BLOCK_SIZE);
      let blocked = false;
      for (let c = c1; c <= Math.min(c2, COLS - 1); c++) {
        if (board[r][c] !== 0) { blocked = true; break; }
      }
      if (!blocked) { this.y = BOARD_Y + r * BLOCK_SIZE - CHAR_HEIGHT; break; }
    }
  }

  private findNearestFreePosition(): { x: number; y: number } | null {
    const board = this.boardModel.getBoard();
    const step  = FIND_FREE_STEP;
    const maxR  = FIND_FREE_MAX_RADIUS;
    for (let radius = 0; radius <= maxR; radius += step) {
      const offsets: [number, number][] = [];
      if (radius === 0) { offsets.push([0, 0]); }
      else {
        for (let d = -radius; d <= radius; d += step) { offsets.push([d, -radius]); offsets.push([d, radius]); }
        for (let d = -radius + step; d < radius; d += step) { offsets.push([-radius, d]); offsets.push([radius, d]); }
      }
      for (const [dx, dy] of offsets) {
        const tx = this.x + dx, ty = this.y + dy;
        if (tx < BOARD_X || tx + CHAR_WIDTH  > BOARD_X + COLS * BLOCK_SIZE) continue;
        if (ty < BOARD_Y || ty + CHAR_HEIGHT > BOARD_Y + ROWS * BLOCK_SIZE) continue;
        const c0 = Math.floor((tx - BOARD_X) / BLOCK_SIZE);
        const c1 = Math.floor((tx + CHAR_WIDTH  - 1 - BOARD_X) / BLOCK_SIZE);
        const r0 = Math.floor((ty - BOARD_Y) / BLOCK_SIZE);
        const r1 = Math.floor((ty + CHAR_HEIGHT - 1 - BOARD_Y) / BLOCK_SIZE);
        let hit = false;
        for (let r = r0; r <= r1 && !hit; r++)
          for (let c = c0; c <= c1; c++)
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] !== 0) { hit = true; break; }
        if (!hit) return { x: tx, y: ty };
      }
    }
    return null;
  }

  private resolveCollisionsX(): void {
    const board = this.boardModel.getBoard();
    const left   = this.x;
    const right  = this.x + CHAR_WIDTH  - 1;
    const top    = this.y;
    const bottom = this.y + CHAR_HEIGHT - 1;

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
        if (this.x + CHAR_WIDTH <= cl || this.x >= cr ||
            this.y + CHAR_HEIGHT <= ct || this.y >= cb) continue;
        const oL = (this.x + CHAR_WIDTH) - cl;
        const oR = cr - this.x;
        this.x  = oL < oR ? cl - CHAR_WIDTH : cr;
        this.vx = 0;
      }
    }
  }

  private resolveCollisionsY(): void {
    const board = this.boardModel.getBoard();
    this.grounded = false;

    const left   = this.x;
    const right  = this.x + CHAR_WIDTH  - 1;
    const top    = this.y;
    const bottom = this.y + CHAR_HEIGHT - 1;

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
        if (this.x + CHAR_WIDTH <= cl || this.x >= cr ||
            this.y + CHAR_HEIGHT <= ct || this.y >= cb) continue;
        const oT = (this.y + CHAR_HEIGHT) - ct;
        const oB = cb - this.y;
        if (oT < oB) {
          this.y       = ct - CHAR_HEIGHT;
          this.vy      = 0;
          this.grounded = true;
        } else {
          this.y  = cb;
          this.vy = 0;
        }
      }
    }

    // Ground probe 1px below
    if (!this.grounded && this.vy >= 0) {
      const probeY = this.y + CHAR_HEIGHT;
      if (probeY <= BOARD_Y + ROWS * BLOCK_SIZE) {
        const pMinCol  = Math.max(0, Math.floor((this.x - BOARD_X) / BLOCK_SIZE));
        const pMaxCol  = Math.min(COLS - 1, Math.floor((this.x + CHAR_WIDTH - 1 - BOARD_X) / BLOCK_SIZE));
        const probeRow = Math.floor((probeY - BOARD_Y) / BLOCK_SIZE);
        if (probeRow >= 0 && probeRow < ROWS) {
          for (let c = pMinCol; c <= pMaxCol; c++) {
            if (board[probeRow][c] !== 0) { this.grounded = true; break; }
          }
        }
      }
    }
  }

  private clampToBounds(): void {
    const minX = BOARD_X;
    const maxX = BOARD_X + COLS * BLOCK_SIZE - CHAR_WIDTH;
    const minY = BOARD_Y - BLOCK_SIZE * CHAR_ABOVE_BOARD_BLOCKS;
    const maxY = BOARD_Y + ROWS * BLOCK_SIZE - CHAR_HEIGHT;
    if (this.x < minX) { this.x = minX; this.vx = 0; }
    if (this.x > maxX) { this.x = maxX; this.vx = 0; }
    if (this.y < minY) { this.y = minY; this.vy = 0; }
    if (this.y > maxY) { this.y = maxY; this.vy = 0; this.grounded = true; }
  }
}
