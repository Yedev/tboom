import Phaser from 'phaser';
import {
  CHAR_WIDTH, CHAR_HEIGHT, CHAR_SCALE, CHAR_MAX_HP,
  CHAR_FLASH_INTERVAL,
  CHAR_BREATHE_SPEED, CHAR_BREATHE_AMPLITUDE,
  CHAR_BLINK_PERIOD, CHAR_BLINK_OPEN_RATIO,
  CHAR_WALK_ANIM_SPEED, CHAR_JUMP_BODY_OFFSET,
  CHAR_BODY_COLOR, CHAR_HEAD_COLOR, CHAR_LEG_COLOR,
  CHAR_HURT_BODY_COLOR, CHAR_HURT_HEAD_COLOR, CHAR_HURT_LEG_COLOR,
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
    this.hpText = scene.add.text(PANEL_X, BOARD_Y + 326, '', hpStyle);

    const bombStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px', fontFamily: 'monospace', color: '#ffaa22',
    };
    this.bombText = scene.add.text(PANEL_X, BOARD_Y + 366, '', bombStyle);
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
    const isJumping = !state.grounded && state.vy < 0;
    const isFalling = !state.grounded && state.vy >= 0;
    const isWalking = state.grounded && state.vx !== 0;

    let bodyOffY = 0;
    let bodySquish = 0;
    let legSquish = 0;
    let leftLegOff = 0;
    let rightLegOff = 0;
    let eyeOpen = true;

    if (state.grounded && state.vx === 0) {
      const breathe = Math.sin(state.animTime * CHAR_BREATHE_SPEED);
      bodySquish = Math.round(breathe * CHAR_BREATHE_AMPLITUDE * S);
      legSquish = Math.round(breathe * CHAR_BREATHE_AMPLITUDE * S);
      eyeOpen = (state.animTime % CHAR_BLINK_PERIOD) < CHAR_BLINK_OPEN_RATIO;
    } else if (isWalking) {
      const step = Math.sin(state.animTime * CHAR_WALK_ANIM_SPEED);
      leftLegOff = Math.round((step > 0 ? 2 : -1) * S);
      rightLegOff = Math.round((step > 0 ? -1 : 2) * S);
    } else if (isJumping) {
      bodyOffY = CHAR_JUMP_BODY_OFFSET * S;
    }

    const bodyColor = isHurt ? CHAR_HURT_BODY_COLOR : CHAR_BODY_COLOR;
    const headColor = isHurt ? CHAR_HURT_HEAD_COLOR : CHAR_HEAD_COLOR;
    const legColor = isHurt ? CHAR_HURT_LEG_COLOR : CHAR_LEG_COLOR;

    const oy = py + bodyOffY;
    const sr = (v: number) => Math.round(v * S);

    // --- Legs ---
    this.graphics.fillStyle(legColor);
    if (isJumping) {
      this.graphics.fillRect(px + sr(4), oy + sr(18), sr(5), sr(3));
      this.graphics.fillRect(px + sr(11), oy + sr(18), sr(5), sr(3));
    } else if (isFalling) {
      this.graphics.fillRect(px + sr(1), oy + sr(20), sr(5), sr(4));
      this.graphics.fillRect(px + sr(14), oy + sr(20), sr(5), sr(4));
    } else {
      this.graphics.fillRect(px + sr(3), oy + sr(20) + leftLegOff + legSquish, sr(5), sr(4) - legSquish);
      this.graphics.fillRect(px + sr(12), oy + sr(20) + rightLegOff + legSquish, sr(5), sr(4) - legSquish);
    }

    // --- Body ---
    this.graphics.fillStyle(bodyColor);
    this.graphics.fillRect(px + sr(2) - bodySquish, oy + sr(8), sr(16) + bodySquish * 2, sr(13) - bodySquish);

    // --- Arms ---
    this.graphics.fillStyle(bodyColor);
    if (isJumping) {
      this.graphics.fillRect(px + sr(0), oy + sr(4), sr(4), sr(8));
      this.graphics.fillRect(px + sr(16), oy + sr(4), sr(4), sr(8));
    } else if (isFalling) {
      this.graphics.fillRect(px + sr(-2), oy + sr(10), sr(4), sr(6));
      this.graphics.fillRect(px + sr(18), oy + sr(10), sr(4), sr(6));
    } else {
      this.graphics.fillRect(px + sr(0) - bodySquish, oy + sr(12), sr(3), sr(6) + bodySquish);
      this.graphics.fillRect(px + sr(17) + bodySquish, oy + sr(12), sr(3), sr(6) + bodySquish);
    }

    // --- Head ---
    this.graphics.fillStyle(headColor);
    this.graphics.fillRect(px + sr(3), oy + bodySquish, sr(14), sr(10));

    // --- Eyes ---
    if (eyeOpen && !isHurt) {
      this.graphics.fillStyle(0xffffff);
      this.graphics.fillRect(px + sr(5), oy + sr(3), sr(3), sr(3));
      this.graphics.fillRect(px + sr(12), oy + sr(3), sr(3), sr(3));
      const pupilOff = state.vx > 0 ? sr(1) : 0;
      this.graphics.fillStyle(0x000000);
      this.graphics.fillRect(px + sr(5) + pupilOff, oy + sr(4), sr(2), sr(2));
      this.graphics.fillRect(px + sr(12) + pupilOff, oy + sr(4), sr(2), sr(2));
    } else if (isHurt) {
      this.graphics.fillStyle(0xffffff);
      this.graphics.fillRect(px + sr(5), oy + sr(3), sr(3), sr(3));
      this.graphics.fillRect(px + sr(12), oy + sr(3), sr(3), sr(3));
      this.graphics.fillStyle(0x000000);
      this.graphics.fillRect(px + sr(5), oy + sr(3), 1, 1);
      this.graphics.fillRect(px + sr(7), oy + sr(3), 1, 1);
      this.graphics.fillRect(px + sr(6), oy + sr(4), 1, 1);
      this.graphics.fillRect(px + sr(5), oy + sr(5), 1, 1);
      this.graphics.fillRect(px + sr(7), oy + sr(5), 1, 1);
      this.graphics.fillRect(px + sr(12), oy + sr(3), 1, 1);
      this.graphics.fillRect(px + sr(14), oy + sr(3), 1, 1);
      this.graphics.fillRect(px + sr(13), oy + sr(4), 1, 1);
      this.graphics.fillRect(px + sr(12), oy + sr(5), 1, 1);
      this.graphics.fillRect(px + sr(14), oy + sr(5), 1, 1);
    } else {
      this.graphics.fillStyle(0x000000);
      this.graphics.fillRect(px + sr(5), oy + sr(4), sr(3), 1);
      this.graphics.fillRect(px + sr(12), oy + sr(4), sr(3), 1);
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
