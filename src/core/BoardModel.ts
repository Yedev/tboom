import { COLS, ROWS } from '../constants';
import { BlockType } from './BlockType';

/**
 * Pure data model for the Tetris board.
 * Single source of truth for board state — no rendering or game logic.
 *
 * Two parallel arrays:
 *   board[r][c]      — colour index (0 = empty, 1-7 = piece colour)
 *   blockTypes[r][c] — BlockType enum (NORMAL by default)
 */
export class BoardModel {
  private board: number[][];
  private blockTypes: BlockType[][];

  constructor() {
    this.board = [];
    this.blockTypes = [];
    this.init();
  }

  init(): void {
    this.board = [];
    this.blockTypes = [];
    for (let r = 0; r < ROWS; r++) {
      this.board.push(new Array(COLS).fill(0));
      this.blockTypes.push(new Array(COLS).fill(BlockType.NORMAL));
    }
  }

  getBoard(): number[][] {
    return this.board;
  }

  getBlockTypes(): BlockType[][] {
    return this.blockTypes;
  }

  getCell(row: number, col: number): number {
    return this.board[row][col];
  }

  getBlockType(row: number, col: number): BlockType {
    if (!this.isInBounds(row, col)) return BlockType.NORMAL;
    return this.blockTypes[row][col];
  }

  setCell(row: number, col: number, value: number): void {
    if (this.isInBounds(row, col)) {
      this.board[row][col] = value;
    }
  }

  setBlockType(row: number, col: number, type: BlockType): void {
    if (this.isInBounds(row, col)) {
      this.blockTypes[row][col] = type;
    }
  }

  clearCell(row: number, col: number): void {
    if (this.isInBounds(row, col)) {
      this.board[row][col] = 0;
      this.blockTypes[row][col] = BlockType.NORMAL;
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
      this.blockTypes.splice(row, 1);
      this.blockTypes.unshift(new Array(COLS).fill(BlockType.NORMAL));
    }
  }

  /**
   * Snapshot of block types in the given rows (read before removeRows).
   * Returns a flat array of types for all cells in those rows.
   */
  getBlockTypesInRows(rows: number[]): BlockType[] {
    const result: BlockType[] = [];
    for (const r of rows) {
      if (this.isInBounds(r, 0)) {
        for (let c = 0; c < COLS; c++) {
          result.push(this.blockTypes[r][c]);
        }
      }
    }
    return result;
  }
}
