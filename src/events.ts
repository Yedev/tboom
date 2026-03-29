/** Central event name constants for decoupled communication. */
export const GameEvents = {
  /** A tetromino piece has been locked onto the board. Payload: { cells: {row, col, value}[] } */
  PIECE_LOCKED: 'piece-locked',

  /** The active piece position/rotation changed. */
  PIECE_MOVED: 'piece-moved',

  /** Full rows detected and are being cleared. Payload: { rows: number[] } */
  LINES_CLEARED: 'lines-cleared',

  /** Board cells changed (lock, clear, or bomb). */
  BOARD_CHANGED: 'board-changed',

  /** A bomb exploded. Payload: { col: number, row: number, destroyedCells: {col, row}[] } */
  BOMB_EXPLODED: 'bomb-exploded',

  /** The character's HP reached zero. */
  CHARACTER_DIED: 'character-died',

  /** Game state transitioned. Payload: { from: GameState, to: GameState } */
  STATE_CHANGED: 'state-changed',
} as const;
