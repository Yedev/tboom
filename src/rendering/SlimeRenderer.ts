import Phaser from 'phaser';
import {
  SLIME_SIZE, SLIME_COLOR_BODY, SLIME_COLOR_DARK,
  SLIME_COLOR_EYE, SLIME_COLOR_PUPIL,
} from '../constants';
import { SlimeData, SlimeDeathEffect } from '../core/SlimeSystem';

// Death effect particle directions
const PARTICLE_DIRS: [number, number][] = [
  [0, -1], [0.7, -0.7], [1, 0], [0.7, 0.7],
  [0, 1], [-0.7, 0.7], [-1, 0], [-0.7, -0.7],
];

export class SlimeRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  draw(slimes: SlimeData[], effects: SlimeDeathEffect[]): void {
    this.graphics.clear();
    for (const e of effects) this.drawDeathEffect(e);
    for (const s of slimes) this.drawSlime(s.x, s.y);
  }

  private drawSlime(x: number, y: number): void {
    const S = SLIME_SIZE;
    const g = this.graphics;

    // Shadow bottom
    g.fillStyle(SLIME_COLOR_DARK);
    g.fillRoundedRect(x + 1, y + S * 0.35, S - 2, S * 0.65, 6);

    // Main body
    g.fillStyle(SLIME_COLOR_BODY);
    g.fillRoundedRect(x + 2, y + S * 0.15, S - 4, S * 0.75, 8);

    // Sheen highlight
    g.fillStyle(0x88ee88, 0.4);
    g.fillRoundedRect(x + 4, y + S * 0.18, S * 0.4, S * 0.22, 4);

    // Eyes
    const eyeR  = Math.round(S * 0.12);
    const pupR  = Math.round(S * 0.06);
    const eyeY  = Math.round(y + S * 0.38);
    const lEyeX = Math.round(x + S * 0.28);
    const rEyeX = Math.round(x + S * 0.62);

    g.fillStyle(SLIME_COLOR_EYE);
    g.fillCircle(lEyeX, eyeY, eyeR);
    g.fillCircle(rEyeX, eyeY, eyeR);

    g.fillStyle(SLIME_COLOR_PUPIL);
    g.fillCircle(lEyeX + 1, eyeY + 1, pupR);
    g.fillCircle(rEyeX + 1, eyeY + 1, pupR);
  }

  private drawDeathEffect(e: SlimeDeathEffect): void {
    const t = 1 - e.timer / e.maxTimer; // 0 → 1 as effect progresses
    const alpha = 1 - t;
    const g = this.graphics;

    // Expanding ring
    const ringR = SLIME_SIZE * 0.5 * (0.8 + t * 1.8);
    g.lineStyle(3, 0x66ff66, alpha * 0.9);
    g.strokeCircle(e.x, e.y, ringR);

    // Second smaller ring
    const ringR2 = SLIME_SIZE * 0.3 * (1 + t * 1.2);
    g.lineStyle(2, 0xffffff, alpha * 0.6);
    g.strokeCircle(e.x, e.y, ringR2);

    // Particles flying outward
    const dist = SLIME_SIZE * (0.3 + t * 1.2);
    const pR   = Math.max(1, Math.round(SLIME_SIZE * 0.12 * (1 - t)));
    for (const [dx, dy] of PARTICLE_DIRS) {
      const px = e.x + dx * dist;
      const py = e.y + dy * dist;
      g.fillStyle(0x44ff44, alpha);
      g.fillCircle(px, py, pR);
    }
  }
}
