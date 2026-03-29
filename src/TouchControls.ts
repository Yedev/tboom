import Phaser from 'phaser';
import { DPAD_CX, DPAD_CY, DPAD_SIZE, DPAD_GAP, DPAD_ARROW_HALF_SIZE, BTN_CLUSTER_CX, BTN_CLUSTER_CY, BTN_BIG_R, BTN_SMALL_R, BTN_PAUSE_R, BTN_CLUSTER_OFFSET_X, BTN_CLUSTER_OFFSET_Y, BTN_PAUSE_OFFSET_Y, BUTTON_HIT_RADIUS_MULT } from './constants';

interface RoundButton {
  cx: number;
  cy: number;
  r: number;
  label: string;
  color: number;
  pressed: boolean;
  consumed: boolean;
  pointerIds: Set<number>;
  graphics: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
}

// D-pad direction
type DpadDir = 'left' | 'right' | 'up' | 'down' | null;

interface DpadButton {
  dir: DpadDir;
  x: number;
  y: number;
  w: number;
  h: number;
  pressed: boolean;
  consumed: boolean;
  pointerId: number;
}

export class TouchControls {
  private scene: Phaser.Scene;
  private buttons: RoundButton[] = [];
  private visible: boolean = false;

  // D-pad
  private dpadCx = DPAD_CX;
  private dpadCy = DPAD_CY;
  private dpadSize = DPAD_SIZE;   // arm width/height (square arms)
  private dpadGap = DPAD_GAP;     // gap between center square and arms
  private dpadGraphics: Phaser.GameObjects.Graphics;
  private dpadBtns: DpadButton[] = [];
  private dpadPointerId: number = -1;
  private dpadLabels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    scene.input.addPointer(3);

    this.dpadGraphics = scene.add.graphics();
    this.initDpad();
    this.initButtons();

    this.visible = true;
    this.drawAll();
    this.setupListeners(scene);
  }

  private initDpad(): void {
    const cx = this.dpadCx;
    const cy = this.dpadCy;
    const s = this.dpadSize;
    const g = this.dpadGap;
    const half = s / 2;

    // Center square edges
    const left   = cx - half;
    const right  = cx + half;
    const top    = cy - half;
    const bottom = cy + half;

    // Arms positioned from center square edges + gap
    this.dpadBtns = [
      { dir: 'up',    x: left,           y: top - g - s,    w: s, h: s, pressed: false, consumed: false, pointerId: -1 },
      { dir: 'down',  x: left,           y: bottom + g,     w: s, h: s, pressed: false, consumed: false, pointerId: -1 },
      { dir: 'left',  x: left - g - s,   y: top,            w: s, h: s, pressed: false, consumed: false, pointerId: -1 },
      { dir: 'right', x: right + g,      y: top,            w: s, h: s, pressed: false, consumed: false, pointerId: -1 },
    ];

    // D-pad labels
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '9px', fontFamily: 'monospace', color: '#667788',
    };
    this.dpadLabels.push(this.scene.add.text(cx, top - g - s - 8, '放置', labelStyle).setOrigin(0.5));
    this.dpadLabels.push(this.scene.add.text(cx, bottom + g + s + 10, '速降', labelStyle).setOrigin(0.5));
  }

  private initButtons(): void {
    // MOBA layout: big jump button center, others radiate around
    // Center of right cluster
    const cx = BTN_CLUSTER_CX;
    const cy = BTN_CLUSTER_CY;
    const bigR = BTN_BIG_R;
    const smallR = BTN_SMALL_R;

    // Jump — big, center
    this.addButton(cx, cy, bigR, '跳跃', 0x3366aa);

    // Rotate — upper-left
    this.addButton(cx - BTN_CLUSTER_OFFSET_X, cy - BTN_CLUSTER_OFFSET_Y, smallR, '旋转', 0x445566);

    // Bomb — upper-right
    this.addButton(cx + BTN_CLUSTER_OFFSET_X, cy - BTN_CLUSTER_OFFSET_Y, smallR, '炸弹', 0x664422);

    // Pause — top center (small)
    this.addButton(cx, cy - BTN_PAUSE_OFFSET_Y, BTN_PAUSE_R, '暂停', 0x334455);
  }

  private addButton(cx: number, cy: number, r: number, label: string, color: number): void {
    const graphics = this.scene.add.graphics();
    const fontSize = r >= 40 ? '14px' : '11px';
    const text = this.scene.add.text(cx, cy, label, {
      fontSize,
      fontFamily: 'monospace',
      color: '#aabbcc',
    }).setOrigin(0.5);

    this.buttons.push({
      cx, cy, r, label, color,
      pressed: false, consumed: false,
      pointerIds: new Set(),
      graphics, text,
    });
  }

  private setupListeners(scene: Phaser.Scene): void {
    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;

      // Check D-pad first
      for (const db of this.dpadBtns) {
        if (pointer.x >= db.x && pointer.x <= db.x + db.w &&
            pointer.y >= db.y && pointer.y <= db.y + db.h) {
          db.pressed = true;
          db.consumed = false;
          db.pointerId = pointer.id;
          this.dpadPointerId = pointer.id;
          return;
        }
      }

      // Check round buttons
      const btn = this.hitTestButton(pointer.x, pointer.y);
      if (btn) {
        btn.pointerIds.add(pointer.id);
        btn.pressed = true;
        btn.consumed = false;
      }
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.releaseDpad(pointer.id);
      this.releasePointer(pointer.id);
    });

    scene.input.on('pointercancel', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible) return;
      this.releaseDpad(pointer.id);
      this.releasePointer(pointer.id);
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.visible || !pointer.isDown) return;
      // D-pad: release if pointer left the direction arm
      for (const db of this.dpadBtns) {
        if (db.pointerId === pointer.id) {
          if (!(pointer.x >= db.x && pointer.x <= db.x + db.w &&
                pointer.y >= db.y && pointer.y <= db.y + db.h)) {
            db.pressed = false;
            db.pointerId = -1;
          }
        }
      }
      // Buttons: release if pointer left
      for (const btn of this.buttons) {
        if (btn.pointerIds.has(pointer.id)) {
          if (!this.hitTestBtn(pointer.x, pointer.y, btn)) {
            btn.pointerIds.delete(pointer.id);
            if (btn.pointerIds.size === 0) btn.pressed = false;
          }
        }
      }
    });
  }

  private releaseDpad(pointerId: number): void {
    for (const db of this.dpadBtns) {
      if (db.pointerId === pointerId) {
        db.pressed = false;
        db.pointerId = -1;
      }
    }
  }

  private releasePointer(pointerId: number): void {
    for (const btn of this.buttons) {
      if (btn.pointerIds.delete(pointerId)) {
        if (btn.pointerIds.size === 0) btn.pressed = false;
      }
    }
  }

  private hitTestButton(px: number, py: number): RoundButton | null {
    for (const btn of this.buttons) {
      const dx = px - btn.cx;
      const dy = py - btn.cy;
      if (dx * dx + dy * dy <= btn.r * btn.r * BUTTON_HIT_RADIUS_MULT) return btn;
    }
    return null;
  }

  private hitTestBtn(px: number, py: number, btn: RoundButton): boolean {
    const dx = px - btn.cx;
    const dy = py - btn.cy;
    return dx * dx + dy * dy <= btn.r * btn.r * BUTTON_HIT_RADIUS_MULT;
  }

  private prevBtnStates = new Map<string, boolean>();
  private dpadDirty = false;

  private dirty = true;

  update(): void {
    if (!this.visible) return;

    // Check if any dpad button changed
    let dpadChanged = false;
    for (const db of this.dpadBtns) {
      const prev = this.prevBtnStates.get(db.dir ?? '') ?? false;
      if (prev !== db.pressed) {
        dpadChanged = true;
        this.prevBtnStates.set(db.dir ?? '', !!db.pressed);
      }
    }

    // Check if any round button changed
    let btnChanged = false;
    for (const btn of this.buttons) {
      const prev = this.prevBtnStates.get(btn.label) ?? false;
      if (prev !== btn.pressed) {
        btnChanged = true;
        this.prevBtnStates.set(btn.label, !!btn.pressed);
      }
    }

    if (dpadChanged || btnChanged || this.dirty) {
      this.dirty = false;
      this.drawAll();
    }
  }

  // --- Public API ---

  isLeftDown(): boolean {
    return this.dpadBtns.find(d => d.dir === 'left')?.pressed ?? false;
  }

  isRightDown(): boolean {
    return this.dpadBtns.find(d => d.dir === 'right')?.pressed ?? false;
  }

  consumeJump(): boolean { return this.consume('跳跃'); }
  consumeBomb(): boolean { return this.consume('炸弹'); }
  consumeRotate(): boolean { return this.consume('旋转'); }
  consumeDrop(): boolean {
    // D-pad up = 放置
    return this.consumeDpad('up');
  }
  consumeHardDrop(): boolean {
    // D-pad down = 速降
    return this.consumeDpad('down');
  }
  consumePause(): boolean { return this.consume('暂停'); }

  private consumeDpad(dir: DpadDir): boolean {
    const db = this.dpadBtns.find(d => d.dir === dir);
    if (!db || !db.pressed || db.consumed) return false;
    db.consumed = true;
    return true;
  }

  private consume(label: string): boolean {
    const btn = this.buttons.find(b => b.label === label);
    if (!btn || !btn.pressed || btn.consumed) return false;
    btn.consumed = true;
    return true;
  }

  // --- Rendering ---

  private drawAll(): void {
    this.dpadGraphics.clear();

    const cx = this.dpadCx;
    const cy = this.dpadCy;
    const s = this.dpadSize;
    const half = s / 2;

    // Center square
    this.dpadGraphics.fillStyle(0x223344, 0.5);
    this.dpadGraphics.fillRoundedRect(cx - half, cy - half, s, s, 8);

    // Direction arms
    for (const db of this.dpadBtns) {
      const color = db.pressed ? 0x5577aa : 0x2a3a4a;
      const alpha = db.pressed ? 0.7 : 0.4;
      this.dpadGraphics.fillStyle(color, alpha);
      this.dpadGraphics.fillRoundedRect(db.x, db.y, db.w, db.h, 8);
      this.dpadGraphics.lineStyle(1.5, db.pressed ? 0x88aadd : 0x3a4a5a, 0.6);
      this.dpadGraphics.strokeRoundedRect(db.x, db.y, db.w, db.h, 8);
    }

    // Arrow indicators — centered inside each arm
    this.dpadGraphics.fillStyle(0xffffff, 0.35);
    const as = DPAD_ARROW_HALF_SIZE; // arrow half-size
    for (const db of this.dpadBtns) {
      const midX = db.x + db.w / 2;
      const midY = db.y + db.h / 2;
      switch (db.dir) {
        case 'up':
          this.dpadGraphics.fillTriangle(midX, midY - as, midX - as, midY + as, midX + as, midY + as);
          break;
        case 'down':
          this.dpadGraphics.fillTriangle(midX, midY + as, midX - as, midY - as, midX + as, midY - as);
          break;
        case 'left':
          this.dpadGraphics.fillTriangle(midX - as, midY, midX + as, midY - as, midX + as, midY + as);
          break;
        case 'right':
          this.dpadGraphics.fillTriangle(midX + as, midY, midX - as, midY - as, midX - as, midY + as);
          break;
      }
    }

    // Right-side round buttons
    for (const btn of this.buttons) {
      btn.graphics.clear();

      const alpha = btn.pressed ? 0.6 : 0.25;
      const bgColor = btn.pressed ? 0x4466aa : btn.color;
      const borderColor = btn.pressed ? 0x88aadd : 0x445566;

      btn.graphics.fillStyle(bgColor, alpha);
      btn.graphics.fillCircle(btn.cx, btn.cy, btn.r);
      btn.graphics.lineStyle(2, borderColor, alpha + 0.2);
      btn.graphics.strokeCircle(btn.cx, btn.cy, btn.r);

      btn.text.setColor(btn.pressed ? '#ffffff' : '#8899aa');
    }
  }

  destroy(): void {
    this.dpadGraphics.destroy();
    for (const btn of this.buttons) {
      btn.graphics.destroy();
      btn.text.destroy();
    }
    this.buttons = [];
  }
}
