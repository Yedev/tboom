import { COLS, ROWS } from '../constants';

/**
 * Pure data model for the Tetris board.
 * Single source of truth for board state — no rendering or game logic.
 */
export class BoardModel {
  private board: number[][];

  constructor() {
    this.board = [];
    this.init();
  }

  init(): void {
    this.board = [];
    for (let r = 0; r < ROWS; r++) {
      this.board.push(new Array(COLS).fill(0));
    }
  }

  getBoard(): number[][] {
    return this.board;
  }

  getCell(row: number, col: number): number {
    return this.board[row][col];
  }

  setCell(row: number, col: number, value: number): void {
    if (this.isInBounds(row, col)) {
      this.board[row][col] = value;
    }
  }

  clearCell(row: number, col: number): void {
    if (this.isInBounds(row, col)) {
      this.board[row][col] = 0;
    }
  }

  isCellEmpty(row: number, col: number): boolean {
    if (!this.isInBounds(row, col)) return false;
    return this.board[row][col] === 0;
  }

  isInBounds(row: number, col: number): boolean {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
  }

  /** Returns indices of fully completed rows (bottom to top). */
  getFullRows(): number[] {
    const full: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== 0)) {
        full.push(r);
      }
    }
    return full;
  }

  /** Remove the specified rows and add empty rows at the top. */
  removeRows(rows: number[]): void {
    for (const row of rows.sort((a, b) => a - b)) {
      this.board.splice(row, 1);
      this.board.unshift(new Array(COLS).fill(0));
    }
  }
}
