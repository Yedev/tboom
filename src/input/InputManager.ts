import Phaser from 'phaser';
import { TouchControls } from '../TouchControls';

export interface CharacterInput {
  moveLeft: boolean;
  moveRight: boolean;
  jump: boolean;
  bomb: boolean;
}

export interface TetrisInput {
  rotate: boolean;
  drop: boolean;
  hardDrop: boolean;
}

export interface SystemInput {
  pause: boolean;
  restart: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private touchControls?: TouchControls;

  // Keyboard keys
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private pauseKey!: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, touchControls?: TouchControls) {
    this.scene = scene;
    this.touchControls = touchControls;

    const kb = scene.input.keyboard!;
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyQ = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = kb.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.restartKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.pauseKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

  getCharacterInput(): CharacterInput {
    return {
      moveLeft: this.keyA.isDown || (this.touchControls?.isLeftDown() ?? false),
      moveRight: this.keyD.isDown || (this.touchControls?.isRightDown() ?? false),
      jump: Phaser.Input.Keyboard.JustDown(this.keySpace) || (this.touchControls?.consumeJump() ?? false),
      bomb: Phaser.Input.Keyboard.JustDown(this.keyE) || (this.touchControls?.consumeBomb() ?? false),
    };
  }

  getTetrisInput(): TetrisInput {
    return {
      rotate: Phaser.Input.Keyboard.JustDown(this.keyQ) || (this.touchControls?.consumeRotate() ?? false),
      drop: Phaser.Input.Keyboard.JustDown(this.keyW) || (this.touchControls?.consumeDrop() ?? false),
      hardDrop: Phaser.Input.Keyboard.JustDown(this.keyS) || (this.touchControls?.consumeHardDrop() ?? false),
    };
  }

  getSystemInput(): SystemInput {
    const touchPause = this.touchControls?.consumePause() ?? false;
    return {
      pause: Phaser.Input.Keyboard.JustDown(this.pauseKey) || touchPause,
      restart: Phaser.Input.Keyboard.JustDown(this.restartKey) || touchPause,
    };
  }
}
