import Phaser from 'phaser';
import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y,
  PIECE_COLORS, PIECE_BORDER_COLORS,
  LINK_LINE_WIDTH, LINK_LINE_COLOR, LINK_LINE_ALPHA, LINK_DASH_LENGTH,
} from '../constants';

export interface PieceRenderInfo {
  type: number;
  rotation: number;
  x: number;
  y: number;
}

export class PieceRenderer {
  private pieceGraphics: Phaser.GameObjects.Graphics;
  private ghostGraphics: Phaser.GameObjects.Graphics;
  private linkGraphics: Phaser.GameObjects.Graphics;
  private TETROMINOES: number[][][][];

  // Cache for dirty check
  private lastPieceX = -999;
  private lastPieceY = -999;
  private lastRotation = -1;

  constructor(scene: Phaser.Scene, tetrominoes: number[][][][]) {
    this.pieceGraphics = scene.add.graphics();
    this.ghostGraphics = scene.add.graphics();
    this.linkGraphics = scene.add.graphics();
    this.TETROMINOES = tetrominoes;
  }

  isPieceDirty(piece: PieceRenderInfo): boolean {
    return piece.x !== this.lastPieceX || piece.y !== this.lastPieceY || piece.rotation !== this.lastRotation;
  }

  drawActivePiece(piece: PieceRenderInfo, gameOver: boolean, clearingLines: boolean): void {
    this.lastPieceX = piece.x;
    this.lastPieceY = piece.y;
    this.lastRotation = piece.rotation;

    this.pieceGraphics.clear();
    if (gameOver || clearingLines) return;

    const shape = this.TETROMINOES[piece.type][piece.rotation];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = piece.y + r;
          if (boardY < 0) continue;
          this.drawBlock(this.pieceGraphics,
            BOARD_X + (piece.x + c) * BLOCK_SIZE,
            BOARD_Y + boardY * BLOCK_SIZE,
            PIECE_COLORS[shape[r][c]], PIECE_BORDER_COLORS[shape[r][c]]);
        }
      }
    }
  }

  drawGhost(piece: PieceRenderInfo, ghostY: number, gameOver: boolean, clearingLines: boolean): void {
    this.ghostGraphics.clear();
    if (gameOver || clearingLines) return;
    if (ghostY === piece.y) return;

    const shape = this.TETROMINOES[piece.type][piece.rotation];
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = ghostY + r;
          if (boardY < 0) continue;
          this.drawBlock(this.ghostGraphics,
            BOARD_X + (piece.x + c) * BLOCK_SIZE,
            BOARD_Y + boardY * BLOCK_SIZE,
            PIECE_COLORS[shape[r][c]], PIECE_BORDER_COLORS[shape[r][c]], 0.2);
        }
      }
    }
  }

  drawLinkLine(piece: PieceRenderInfo, charCenterX: number, charCenterY: number, following: boolean): void {
    this.linkGraphics.clear();
    if (!following) return;

    const shape = this.TETROMINOES[piece.type][piece.rotation];
    let sumX = 0, sumY = 0, count = 0;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardY = piece.y + r;
          if (boardY < 0) continue;
          sumX += BOARD_X + (piece.x + c) * BLOCK_SIZE + BLOCK_SIZE / 2;
          sumY += BOARD_Y + boardY * BLOCK_SIZE + BLOCK_SIZE / 2;
          count++;
        }
      }
    }

    if (count === 0) return;
    const pieceCX = sumX / count;
    const pieceCY = sumY / count;

    this.linkGraphics.lineStyle(LINK_LINE_WIDTH, LINK_LINE_COLOR, LINK_LINE_ALPHA);
    const dx = charCenterX - pieceCX;
    const dy = charCenterY - pieceCY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const dashLen = LINK_DASH_LENGTH;
      const gapLen = 4;
      const step = dashLen + gapLen;
      const nx = dx / dist;
      const ny = dy / dist;
      for (let d = 0; d < dist; d += step) {
        const end = Math.min(d + dashLen, dist);
        this.linkGraphics.lineBetween(
          pieceCX + nx * d, pieceCY + ny * d,
          pieceCX + nx * end, pieceCY + ny * end,
        );
      }
    }
  }

  clear(): void {
    this.pieceGraphics.clear();
    this.ghostGraphics.clear();
    this.linkGraphics.clear();
  }

  private drawBlock(
    graphics: Phaser.GameObjects.Graphics,
    px: number, py: number,
    color: number, borderColor: number,
    alpha: number = 1,
  ): void {
    const s = BLOCK_SIZE;
    graphics.fillStyle(color, alpha);
    graphics.fillRect(px, py, s, s);

    graphics.fillStyle(0xffffff, 0.2 * alpha);
    graphics.fillRect(px, py, s, 2);
    graphics.fillRect(px, py, 2, s);

    graphics.fillStyle(0x000000, 0.3 * alpha);
    graphics.fillRect(px, py + s - 2, s, 2);
    graphics.fillRect(px + s - 2, py, 2, s);

    graphics.lineStyle(1, borderColor, alpha);
    graphics.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
  }
}
