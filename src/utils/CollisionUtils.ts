import { COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y } from '../constants';

export interface GridBounds {
  minCol: number;
  maxCol: number;
  minRow: number;
  maxRow: number;
}

export interface GridCoord {
  col: number;
  row: number;
}

export interface PixelRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Convert pixel position to grid coordinate. */
export function pixelToGrid(px: number, py: number): GridCoord {
  return {
    col: Math.floor((px - BOARD_X) / BLOCK_SIZE),
    row: Math.floor((py - BOARD_Y) / BLOCK_SIZE),
  };
}

/**
 * Compute the range of grid cells overlapping a pixel rectangle.
 * Clamps to valid board bounds [0..COLS-1] x [0..ROWS-1].
 */
export function pixelRectToGridBounds(px: number, py: number, pw: number, ph: number): GridBounds {
  return {
    minCol: Math.max(0, Math.floor((px - BOARD_X) / BLOCK_SIZE)),
    maxCol: Math.min(COLS - 1, Math.floor((px + pw - 1 - BOARD_X) / BLOCK_SIZE)),
    minRow: Math.max(0, Math.floor((py - BOARD_Y) / BLOCK_SIZE)),
    maxRow: Math.min(ROWS - 1, Math.floor((py + ph - 1 - BOARD_Y) / BLOCK_SIZE)),
  };
}

/** Get pixel bounds of a grid cell. */
export function cellPixelBounds(col: number, row: number): PixelRect {
  const left = BOARD_X + col * BLOCK_SIZE;
  const top = BOARD_Y + row * BLOCK_SIZE;
  return {
    left,
    top,
    right: left + BLOCK_SIZE,
    bottom: top + BLOCK_SIZE,
  };
}

/** Test AABB overlap between two pixel rectangles. */
export function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Test overlap between a pixel rectangle and a grid cell. */
export function overlapsCell(px: number, py: number, pw: number, ph: number, col: number, row: number): boolean {
  const cell = cellPixelBounds(col, row);
  return px < cell.right && px + pw > cell.left && py < cell.bottom && py + ph > cell.top;
}

/** Check if a grid coordinate is within valid board bounds. */
export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}
