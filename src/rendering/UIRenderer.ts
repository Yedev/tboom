import Phaser from 'phaser';
import {
  COLS, ROWS, BLOCK_SIZE, BOARD_X, BOARD_Y, PANEL_X,
  BOARD_BORDER_WIDTH, BOARD_BORDER_COLOR, GRID_LINE_WIDTH, GRID_LINE_COLOR,
  PIECE_COLORS, PIECE_BORDER_COLORS,
} from '../constants';
import { UpgradeCard } from '../core/PlayerUpgrades';

// Panel layout — all offsets from BOARD_Y
const Y_SCORE_LABEL  = 0;
const Y_SCORE_VALUE  = 22;
const Y_LEVEL_LABEL  = 56;
const Y_LEVEL_VALUE  = 78;
const Y_LINES_LABEL  = 112;
const Y_LINES_VALUE  = 130;
const Y_STAGE_LABEL  = 156;
const Y_STAGE_VALUE  = 174;
const Y_STAGE_PROG   = 192;  // lines progress
const Y_STAGE_GOAL   = 208;  // ★ target score
const Y_NEXT_LABEL   = 232;
const Y_NEXT_PREVIEW = 254;
const Y_HP_LABEL     = 324;
const Y_BOMB_LABEL   = 364;
const Y_CONTROLS     = 434;
const Y_CARDS_LABEL  = 598;
const Y_CARDS_START  = 616;

export class UIRenderer {
  private scene: Phaser.Scene;
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private linesText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;
  private stageProgText!: Phaser.GameObjects.Text;
  private stageGoalText!: Phaser.GameObjects.Text;
  private nextPreview!: Phaser.GameObjects.Graphics;
  private gameOverOverlay!: Phaser.GameObjects.Container;
  private cardSlots: Phaser.GameObjects.Graphics[] = [];
  private cardTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(): void {
    const scene = this.scene;

    // Board border
    const border = scene.add.graphics();
    border.lineStyle(BOARD_BORDER_WIDTH, BOARD_BORDER_COLOR);
    border.strokeRect(BOARD_X - 1, BOARD_Y - 1, COLS * BLOCK_SIZE + 2, ROWS * BLOCK_SIZE + 2);

    // Grid lines
    const grid = scene.add.graphics();
    grid.lineStyle(GRID_LINE_WIDTH, GRID_LINE_COLOR);
    for (let c = 1; c < COLS; c++) {
      grid.lineBetween(BOARD_X + c * BLOCK_SIZE, BOARD_Y, BOARD_X + c * BLOCK_SIZE, BOARD_Y + ROWS * BLOCK_SIZE);
    }
    for (let r = 1; r < ROWS; r++) {
      grid.lineBetween(BOARD_X, BOARD_Y + r * BLOCK_SIZE, BOARD_X + COLS * BLOCK_SIZE, BOARD_Y + r * BLOCK_SIZE);
    }

    // Panel text styles
    const titleStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px', fontFamily: 'monospace', color: '#8899bb',
    };
    const valueStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
    };
    const smallStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '13px', fontFamily: 'monospace', color: '#667788',
    };

    scene.add.text(PANEL_X, BOARD_Y + Y_SCORE_LABEL, 'SCORE', titleStyle);
    this.scoreText = scene.add.text(PANEL_X, BOARD_Y + Y_SCORE_VALUE, '0', valueStyle);

    scene.add.text(PANEL_X, BOARD_Y + Y_LEVEL_LABEL, 'LEVEL', titleStyle);
    this.levelText = scene.add.text(PANEL_X, BOARD_Y + Y_LEVEL_VALUE, '1', valueStyle);

    scene.add.text(PANEL_X, BOARD_Y + Y_LINES_LABEL, 'LINES', titleStyle);
    this.linesText = scene.add.text(PANEL_X, BOARD_Y + Y_LINES_VALUE, '0', valueStyle);

    const goalStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffdd44', fontStyle: 'bold',
    };

    scene.add.text(PANEL_X, BOARD_Y + Y_STAGE_LABEL, 'STAGE', titleStyle);
    this.stageText     = scene.add.text(PANEL_X, BOARD_Y + Y_STAGE_VALUE, '1', valueStyle);
    this.stageProgText = scene.add.text(PANEL_X, BOARD_Y + Y_STAGE_PROG, '0 / 5', smallStyle);
    this.stageGoalText = scene.add.text(PANEL_X, BOARD_Y + Y_STAGE_GOAL, '\u2605 GOAL: 500', goalStyle);

    scene.add.text(PANEL_X, BOARD_Y + Y_NEXT_LABEL, 'NEXT', titleStyle);
    this.nextPreview = scene.add.graphics();

    scene.add.text(PANEL_X, BOARD_Y + Y_HP_LABEL,   'HP',   titleStyle);
    scene.add.text(PANEL_X, BOARD_Y + Y_BOMB_LABEL,  'BOMB', titleStyle);

    // Controls help
    const helpStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '11px', fontFamily: 'monospace', color: '#556677',
    };
    const hy = BOARD_Y + Y_CONTROLS;
    scene.add.text(PANEL_X, hy,       '--- Controls ---', helpStyle);
    scene.add.text(PANEL_X, hy + 16,  'A/D   Move',       helpStyle);
    scene.add.text(PANEL_X, hy + 32,  'Space Jump',       helpStyle);
    scene.add.text(PANEL_X, hy + 48,  'E     Bomb',       helpStyle);
    scene.add.text(PANEL_X, hy + 64,  'Q     Rotate',     helpStyle);
    scene.add.text(PANEL_X, hy + 80,  'W     Drop',       helpStyle);
    scene.add.text(PANEL_X, hy + 96,  'S     Hard Drop',  helpStyle);
    scene.add.text(PANEL_X, hy + 112, 'P     Pause',      helpStyle);
    scene.add.text(PANEL_X, hy + 128, 'R     Restart',    helpStyle);

    // Cards section
    scene.add.text(PANEL_X, BOARD_Y + Y_CARDS_LABEL, 'CARDS', titleStyle);
    const SLOT_H = 18;
    const SLOT_GAP = 2;
    for (let i = 0; i < 5; i++) {
      const sy = BOARD_Y + Y_CARDS_START + i * (SLOT_H + SLOT_GAP);
      const gfx = scene.add.graphics();
      gfx.fillStyle(0x1a1a2e, 1);
      gfx.fillRoundedRect(PANEL_X, sy, 118, SLOT_H, 3);
      gfx.lineStyle(1, 0x334455, 0.5);
      gfx.strokeRoundedRect(PANEL_X, sy, 118, SLOT_H, 3);
      this.cardSlots.push(gfx);

      const txt = scene.add.text(PANEL_X + 4, sy + 3, '', {
        fontSize: '11px', fontFamily: 'monospace', color: '#334455',
      });
      this.cardTexts.push(txt);
    }

    // Game over overlay
    this.gameOverOverlay = scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    this.gameOverOverlay.setVisible(false);

    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.75);
    bg.fillRect(-120, -60, 240, 120);
    this.gameOverOverlay.add(bg);

    const goText = scene.add.text(0, -30, 'GAME OVER', {
      fontSize: '28px', fontFamily: 'monospace', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.gameOverOverlay.add(goText);

    const restartText = scene.add.text(0, 20, 'Returning to stage select...', {
      fontSize: '13px', fontFamily: 'monospace', color: '#aabbcc',
    }).setOrigin(0.5);
    this.gameOverOverlay.add(restartText);
  }

  updateScore(score: number): void { this.scoreText.setText(score.toString()); }
  updateLevel(level: number): void { this.levelText.setText(level.toString()); }
  updateLines(lines: number): void { this.linesText.setText(lines.toString()); }

  updateAll(score: number, level: number, lines: number): void {
    this.updateScore(score);
    this.updateLevel(level);
    this.updateLines(lines);
  }

  updateStage(stage: number, current: number, target: number, targetScore?: number): void {
    this.stageText.setText(stage.toString());
    this.stageProgText.setText(`${current} / ${target} lines`);
    if (targetScore !== undefined) {
      this.stageGoalText.setText(`\u2605 GOAL: ${targetScore}`);
    }
  }

  drawNextPreview(nextType: number, tetrominoes: number[][][][]): void {
    this.nextPreview.clear();
    const shape         = tetrominoes[nextType][0];
    const previewSize   = 24;
    const offsetX       = PANEL_X;
    const offsetY       = BOARD_Y + Y_NEXT_PREVIEW;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const px = offsetX + c * previewSize;
          const py = offsetY + r * previewSize;
          this.nextPreview.fillStyle(PIECE_COLORS[shape[r][c]], 1);
          this.nextPreview.fillRect(px, py, previewSize, previewSize);
          this.nextPreview.lineStyle(1, PIECE_BORDER_COLORS[shape[r][c]]);
          this.nextPreview.strokeRect(px + 0.5, py + 0.5, previewSize - 1, previewSize - 1);
          this.nextPreview.fillStyle(0xffffff, 0.15);
          this.nextPreview.fillRect(px, py, previewSize, 2);
          this.nextPreview.fillRect(px, py, 2, previewSize);
        }
      }
    }
  }

  drawCards(cards: UpgradeCard[]): void {
    const SLOT_H = 18;
    const SLOT_GAP = 2;
    for (let i = 0; i < 5; i++) {
      const sy   = BOARD_Y + Y_CARDS_START + i * (SLOT_H + SLOT_GAP);
      const card = cards[i];
      const gfx  = this.cardSlots[i];
      const txt  = this.cardTexts[i];
      if (!gfx || !txt) continue;

      gfx.clear();
      if (card) {
        gfx.fillStyle(card.color, 0.25);
        gfx.fillRoundedRect(PANEL_X, sy, 118, SLOT_H, 3);
        gfx.lineStyle(1, card.color, 0.8);
        gfx.strokeRoundedRect(PANEL_X, sy, 118, SLOT_H, 3);
        txt.setText(card.name).setColor('#ffffff');
      } else {
        gfx.fillStyle(0x1a1a2e, 1);
        gfx.fillRoundedRect(PANEL_X, sy, 118, SLOT_H, 3);
        gfx.lineStyle(1, 0x334455, 0.5);
        gfx.strokeRoundedRect(PANEL_X, sy, 118, SLOT_H, 3);
        txt.setText('').setColor('#334455');
      }
    }
  }

  showGameOver(): void { this.gameOverOverlay.setVisible(true); }
  hideGameOver(): void { this.gameOverOverlay.setVisible(false); }

  clearPreview(): void { this.nextPreview.clear(); }
}
