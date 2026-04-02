import Phaser from 'phaser';
import {
  CHAR_WIDTH, CHAR_HEIGHT, CHAR_SCALE, CHAR_MAX_HP,
  CHAR_FLASH_INTERVAL,
  CHAR_BLINK_PERIOD, CHAR_BLINK_OPEN_RATIO,
  CHAR_BODY_COLOR,
  CHAR_HURT_BODY_COLOR,
  PANEL_X, BOARD_Y,
} from '../constants';

export interface CharacterRenderState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  invincibleTimer: number;
  animTime: number;
  alive: boolean;
}

export class CharacterRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private hpText: Phaser.GameObjects.Text;
  private bombText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();

    const hpStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px', fontFamily: 'monospace', color: '#ff4466',
    };
    this.hpText = scene.add.text(PANEL_X, BOARD_Y + 366, '', hpStyle);

    const bombStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffaa22',
    };
    this.bombText = scene.add.text(PANEL_X, BOARD_Y + 406, '', bombStyle);
  }

  draw(state: CharacterRenderState): void {
    this.graphics.clear();
    if (!state.alive) return;

    // Hurt flash
    if (state.invincibleTimer > 0 && Math.floor(state.invincibleTimer / CHAR_FLASH_INTERVAL) % 2 === 0) return;

    const S = CHAR_SCALE;
    const px = state.x;
    const py = state.y;
    const isHurt = state.invincibleTimer > 0;
    const eyeOpen = (state.animTime % CHAR_BLINK_PERIOD) < CHAR_BLINK_OPEN_RATIO;

    const bodyColor = isHurt ? CHAR_HURT_BODY_COLOR : CHAR_BODY_COLOR;
    const sr = (v: number) => Math.round(v * S);

    // --- Body (single block) ---
    this.graphics.fillStyle(bodyColor);
    this.graphics.fillRect(px, py, CHAR_WIDTH, CHAR_HEIGHT);

    // --- Block border (slightly darker) ---
    this.graphics.lineStyle(2, 0x000000, 0.3);
    this.graphics.strokeRect(px, py, CHAR_WIDTH, CHAR_HEIGHT);

    // --- Eyes ---
    const eyeY = py + sr(10);
    const eyeSize = sr(6);
    const pupilSize = sr(3);
    const leftEyeX = px + sr(6);
    const rightEyeX = px + sr(20);

    if (eyeOpen && !isHurt) {
      // White eyes
      this.graphics.fillStyle(0xffffff);
      this.graphics.fillRect(leftEyeX, eyeY, eyeSize, eyeSize);
      this.graphics.fillRect(rightEyeX, eyeY, eyeSize, eyeSize);
      // Pupils (follow movement direction)
      const pupilOff = state.vx > 0 ? sr(2) : (state.vx < 0 ? 0 : sr(1));
      this.graphics.fillStyle(0x000000);
      this.graphics.fillRect(leftEyeX + pupilOff, eyeY + sr(2), pupilSize, pupilSize);
      this.graphics.fillRect(rightEyeX + pupilOff, eyeY + sr(2), pupilSize, pupilSize);
    } else if (isHurt) {
      // X eyes when hurt
      this.graphics.fillStyle(0xffffff);
      this.graphics.fillRect(leftEyeX, eyeY, eyeSize, eyeSize);
      this.graphics.fillRect(rightEyeX, eyeY, eyeSize, eyeSize);
      this.graphics.fillStyle(0x000000);
      // Left X
      this.graphics.fillRect(leftEyeX + sr(1), eyeY + sr(1), sr(1), sr(1));
      this.graphics.fillRect(leftEyeX + sr(4), eyeY + sr(1), sr(1), sr(1));
      this.graphics.fillRect(leftEyeX + sr(2.5), eyeY + sr(2.5), sr(1), sr(1));
      this.graphics.fillRect(leftEyeX + sr(1), eyeY + sr(4), sr(1), sr(1));
      this.graphics.fillRect(leftEyeX + sr(4), eyeY + sr(4), sr(1), sr(1));
      // Right X
      this.graphics.fillRect(rightEyeX + sr(1), eyeY + sr(1), sr(1), sr(1));
      this.graphics.fillRect(rightEyeX + sr(4), eyeY + sr(1), sr(1), sr(1));
      this.graphics.fillRect(rightEyeX + sr(2.5), eyeY + sr(2.5), sr(1), sr(1));
      this.graphics.fillRect(rightEyeX + sr(1), eyeY + sr(4), sr(1), sr(1));
      this.graphics.fillRect(rightEyeX + sr(4), eyeY + sr(4), sr(1), sr(1));
    } else {
      // Closed eyes (horizontal line)
      this.graphics.fillStyle(0x000000);
      this.graphics.fillRect(leftEyeX, eyeY + sr(2), eyeSize, sr(2));
      this.graphics.fillRect(rightEyeX, eyeY + sr(2), eyeSize, sr(2));
    }
  }

  drawHP(hp: number, maxHp: number = CHAR_MAX_HP): void {
    let hearts = '';
    for (let i = 0; i < maxHp; i++) {
      hearts += i < hp ? '\u2665 ' : '\u2661 ';
    }
    this.hpText.setText(hearts);
  }

  drawBombCount(count: number): void {
    this.bombText.setText('\u25CF ' + count);
  }
}
