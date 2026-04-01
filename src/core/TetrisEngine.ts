import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X,
  INITIAL_DROP_INTERVAL, MIN_DROP_INTERVAL, SPEED_INCREMENT,
  HARD_DROP_SCORE, LOCK_DELAY, MAX_LOCK_MOVES,
  TETROMINOES, WALL_KICKS, I_WALL_KICKS, LINE_SCORES, BOMB_BLOCK_SCORE,
} from '../constants';
import { BoardModel } from './BoardModel';
import { BlockType, randomBlockType } from './BlockType';

export interface ActivePiece {
  type: number;
  rotation: number;
  x: number;
  y: number;
}

export class TetrisEngine {
  private boardModel: BoardModel;

  activePiece!: ActivePiece;
  nextType: number = -1;
  pieceFollowing: boolean = true;

  // Lock delay
  lockTimer: number = 0;
  isLocking: boolean = false;
  lockMoves: number = 0;

  // Gravity
  dropTimer: number = 0;
  dropInterval: number = INITIAL_DROP_INTERVAL;

  // Level/score
  score: number = 0;
  level: number = 1;
  lines: number = 0;

  constructor(boardModel: BoardModel) {
    this.boardModel = boardModel;
  }

  getShape(type: number, rotation: number): number[][] {
    return TETROMINOES[type][rotation];
  }

  isValidPosition(x: number, y: number, rotation: number): boolean {
    const shape = this.getShape(this.activePiece.type, rotation);
    const board = this.boardModel.getBoard();
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardX = x + c;
          const boardY = y + r;
          if (boardX < 0 || boardX >= COLS || boardY >= ROWS) return false;
          if (boardY >= 0 && board[boardY][boardX] !== 0) return false;
        }
      }
    }
    return true;
  }

  movePiece(dx: number, dy: number): boolean {
    const newX = this.activePiece.x + dx;
    const newY = this.activePiece.y + dy;
    if (this.isValidPosition(newX, newY, this.activePiece.rotation)) {
      this.activePiece.x = newX;
      this.activePiece.y = newY;
      if (this.isLocking && dx !== 0) {
        this.lockTimer = 0;
        this.lockMoves++;
        if (this.lockMoves >= MAX_LOCK_MOVES) return true; // signal to lock
      }
      return true;
    }
    return false;
  }

  rotatePiece(direction: number): boolean {
    const oldRotation = this.activePiece.rotation;
    const newRotation = (oldRotation + direction + 4) % 4;
    const kickKey = `${oldRotation}>${newRotation}`;
    const kicks = this.activePiece.type === 0 ? I_WALL_KICKS[kickKey] : WALL_KICKS[kickKey];

    if (kicks) {
      for (const [kx, ky] of kicks) {
        if (this.isValidPosition(this.activePiece.x + kx, this.activePiece.y - ky, newRotation)) {
          this.activePiece.x += kx;
          this.activePiece.y -= ky;
          this.activePiece.rotation = newRotation;
          if (this.isLocking) {
            this.lockTimer = 0;
            this.lockMoves++;
          }
          return true;
        }
      }
    }
    return false;
  }

  spawnPiece(): boolean {
    if (this.nextType === -1) {
      this.nextType = this.randomType();
    }

    const type = this.nextType;
    this.nextType = this.randomType();

    this.activePiece = {
      type,
      rotation: 0,
      x: Math.floor(COLS / 2) - 1,
      y: type === 0 ? -1 : 0,
    };

    if (!this.isValidPosition(this.activePiece.x, this.activePiece.y, this.activePiece.rotation)) {
      return false; // game over
    }

    this.pieceFollowing = true;
    this.isLocking = false;
    this.lockMoves = 0;
    this.lockTimer = 0;
    this.dropTimer = 0;
    return true;
  }

  private randomType(): number {
    return Math.floor(Math.random() * 7);
  }

  lockPiece(): { row: number; col: number; value: number }[] {
    const shape = this.getShape(this.activePiece.type, this.activePiece.rotation);
    const cells: { row: number; col: number; value: number }[] = [];
    const board = this.boardModel.getBoard();
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = this.activePiece.y + r;
          const boardX = this.activePiece.x + c;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            board[boardY][boardX] = shape[r][c];
            this.boardModel.setBlockType(boardY, boardX, randomBlockType(this.level));
            cells.push({ row: boardY, col: boardX, value: shape[r][c] });
          }
        }
      }
    }
    this.isLocking = false;
    return cells;
  }

  getGhostY(): number {
    let ghostY = this.activePiece.y;
    while (this.isValidPosition(this.activePiece.x, ghostY + 1, this.activePiece.rotation)) {
      ghostY++;
    }
    return ghostY;
  }

  hardDrop(): number {
    if (this.pieceFollowing) {
      this.pieceFollowing = false;
    }
    let dropped = 0;
    while (this.movePiece(0, 1)) {
      dropped++;
    }
    this.score += dropped * HARD_DROP_SCORE;
    return dropped;
  }

  updateFollowing(charCenterX: number): void {
    const shape = this.getShape(this.activePiece.type, this.activePiece.rotation);
    const pieceCols = shape[0].length;

    let firstCol = pieceCols, lastCol = 0;
    for (let c = 0; c < pieceCols; c++) {
      for (let r = 0; r < shape.length; r++) {
        if (shape[r][c] !== 0) {
          firstCol = Math.min(firstCol, c);
          lastCol = Math.max(lastCol, c);
          break;
        }
      }
    }
    const minX = -firstCol;
    const maxX = COLS - 1 - lastCol;
    const span = maxX - minX;

    const charCol = (charCenterX - BOARD_X) / BLOCK_SIZE;
    let targetCol = Math.round(charCol - (firstCol + lastCol + 1) / 2);
    targetCol = Math.max(minX, Math.min(maxX, targetCol));

    if (this.isValidPosition(targetCol, this.activePiece.y, this.activePiece.rotation)) {
      this.activePiece.x = targetCol;
      return;
    }
    for (let off = 1; off <= span; off++) {
      if (targetCol - off >= minX &&
          this.isValidPosition(targetCol - off, this.activePiece.y, this.activePiece.rotation)) {
        this.activePiece.x = targetCol - off;
        return;
      }
      if (targetCol + off <= maxX &&
          this.isValidPosition(targetCol + off, this.activePiece.y, this.activePiece.rotation)) {
        this.activePiece.x = targetCol + off;
        return;
      }
    }
  }

  applyGravity(delta: number): { moved: boolean; shouldLock: boolean } {
    this.dropTimer += delta;
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0;
      if (!this.movePiece(0, 1)) {
        if (!this.isLocking) {
          this.isLocking = true;
          this.lockTimer = 0;
        }
        return { moved: false, shouldLock: false };
      } else {
        this.isLocking = false;
        this.lockTimer = 0;
        return { moved: true, shouldLock: false };
      }
    }
    return { moved: false, shouldLock: false };
  }

  updateLock(delta: number): boolean {
    if (!this.isLocking) return false;
    this.lockTimer += delta;
    if (this.lockTimer >= LOCK_DELAY) {
      return true; // should lock
    }
    return false;
  }

  checkLines(): number[] {
    return this.boardModel.getFullRows();
  }

  clearLines(rows: number[], lineClearScoreMult: number = 1.0): void {
    this.boardModel.removeRows(rows);
    const count = rows.length;
    this.lines += count;
    this.score += Math.floor(LINE_SCORES[count] * this.level * lineClearScoreMult);
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.dropInterval = Math.max(MIN_DROP_INTERVAL, INITIAL_DROP_INTERVAL - (this.level - 1) * SPEED_INCREMENT);
    }
  }

  addBombScore(destroyedCount: number, multiplier: number): void {
    if (destroyedCount <= 0) return;
    this.score += Math.floor(destroyedCount * BOMB_BLOCK_SCORE * this.level * multiplier);
  }

  reset(): void {
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.dropInterval = INITIAL_DROP_INTERVAL;
    this.nextType = -1;
    this.pieceFollowing = true;
    this.isLocking = false;
    this.lockMoves = 0;
    this.lockTimer = 0;
    this.dropTimer = 0;
  }
}
