import Phaser from 'phaser';
import { TETROMINOES, BOMB_DAMAGE, CLEAR_ANIM_DURATION, CHAR_WIDTH, CHAR_HEIGHT, SLIME_DAMAGE, SLIME_SCORE } from '../constants';
import { BoardModel } from '../core/BoardModel';
import { TetrisEngine, ActivePiece } from '../core/TetrisEngine';
import { CharacterPhysics, CharacterInput } from '../core/CharacterPhysics';
import { BombSystem } from '../core/BombSystem';
import { GameStateMachine, GameState } from '../core/GameStateMachine';
import { LevelManager } from '../core/LevelManager';
import { LevelProgress } from '../core/LevelProgress';
import { PlayerUpgrades, pickRandomCards } from '../core/PlayerUpgrades';
import { SlimeSystem } from '../core/SlimeSystem';
import { BoardRenderer } from '../rendering/BoardRenderer';
import { PieceRenderer, PieceRenderInfo } from '../rendering/PieceRenderer';
import { CharacterRenderer, CharacterRenderState } from '../rendering/CharacterRenderer';
import { BombRenderer, BombRenderData, ExplosionRenderData } from '../rendering/BombRenderer';
import { SlimeRenderer } from '../rendering/SlimeRenderer';
import { UIRenderer } from '../rendering/UIRenderer';
import { CardOverlay } from '../rendering/CardOverlay';
import { InputManager } from '../input/InputManager';
import { TouchControls } from '../TouchControls';

/**
 * Thin orchestrator scene — delegates to subsystems.
 */
export class GameScene extends Phaser.Scene {
  // Core
  private boardModel!: BoardModel;
  private tetris!: TetrisEngine;
  private character!: CharacterPhysics;
  private bombs!: BombSystem;
  private slimes!: SlimeSystem;
  private stateMachine!: GameStateMachine;
  private levelManager!: LevelManager;
  private levelProgress!: LevelProgress;
  private currentLevel: number = 1;
  private upgrades!: PlayerUpgrades;

  // Rendering
  private boardRenderer!: BoardRenderer;
  private pieceRenderer!: PieceRenderer;
  private charRenderer!: CharacterRenderer;
  private bombRenderer!: BombRenderer;
  private slimeRenderer!: SlimeRenderer;
  private uiRenderer!: UIRenderer;
  private cardOverlay!: CardOverlay;

  // Input
  private inputManager!: InputManager;
  private touchControls?: TouchControls;

  // Audio references
  private sfxStep!: Phaser.Sound.BaseSound;
  private sfxStepAlt!: Phaser.Sound.BaseSound;
  private sfxJump!: Phaser.Sound.BaseSound;
  private sfxLand!: Phaser.Sound.BaseSound;
  private sfxTick!: Phaser.Sound.BaseSound;
  private sfxExplode!: Phaser.Sound.BaseSound;

  // Character audio state
  private wasGrounded = false;
  private stepTimer   = 0;
  private stepFlip    = false;

  // Line clear animation
  private clearAnimTimer = 0;
  private clearedRows: number[] = [];

  // Game over return timer
  private gameOverTimer = 0;

  // Bomb Graphics objects (one per bomb/explosion, created/destroyed dynamically)
  private bombGraphics: Phaser.GameObjects.Graphics[]      = [];
  private explosionGraphics: Phaser.GameObjects.Graphics[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    this.load.audio('step',     'audio/step.ogg');
    this.load.audio('step2',    'audio/step2.ogg');
    this.load.audio('jump',     'audio/jump.ogg');
    this.load.audio('land',     'audio/land.ogg');
    this.load.audio('tick',     'audio/tick.ogg');
    this.load.audio('explode',  'audio/explode.ogg');
    this.load.audio('rotate',   'audio/rotate.ogg');
    this.load.audio('harddrop', 'audio/harddrop.ogg');
    this.load.audio('place',    'audio/place.ogg');
  }

  create(data: { level?: number }): void {
    // Get level from scene data
    this.currentLevel = data.level ?? 1;

    // Player upgrades (must be created before character/bombs)
    this.upgrades      = new PlayerUpgrades();
    this.levelManager  = new LevelManager();
    this.levelManager.setStage(this.currentLevel);
    this.levelProgress = LevelProgress.getInstance();

    // Core systems
    this.boardModel   = new BoardModel();
    this.tetris       = new TetrisEngine(this.boardModel);
    this.character    = new CharacterPhysics(this.boardModel, this.upgrades);
    this.bombs        = new BombSystem(this.boardModel, this.upgrades);
    this.slimes       = new SlimeSystem(this.boardModel, this.levelManager.getConfig().slime);
    this.stateMachine = new GameStateMachine();

    // Touch controls
    if (this.sys.game.device.input.touch) {
      this.touchControls = new TouchControls(this);
    }

    // Input
    this.inputManager = new InputManager(this, this.touchControls);

    // Rendering
    this.uiRenderer  = new UIRenderer(this);
    this.uiRenderer.create();
    this.boardRenderer = new BoardRenderer(this);
    this.pieceRenderer = new PieceRenderer(this, TETROMINOES);
    this.charRenderer  = new CharacterRenderer(this);
    this.bombRenderer  = new BombRenderer();
    this.slimeRenderer = new SlimeRenderer(this);
    this.cardOverlay   = new CardOverlay(this);

    // Audio
    this.sfxStep    = this.sound.add('step');
    this.sfxStepAlt = this.sound.add('step2');
    this.sfxJump    = this.sound.add('jump');
    this.sfxLand    = this.sound.add('land');
    this.sfxTick    = this.sound.add('tick');
    this.sfxExplode = this.sound.add('explode');

    // Initial state
    this.tetris.spawnPiece();
    this.uiRenderer.drawNextPreview(this.tetris.nextType, TETROMINOES);
    this.uiRenderer.updateStage(this.currentLevel, 0, this.levelManager.getTargetLines(), this.levelManager.getTargetScore());
    this.charRenderer.drawHP(this.character.hp, this.character.maxHp);
    this.charRenderer.drawBombCount(this.bombs.bombCount);
    this.renderAll();
  }

  update(_time: number, delta: number): void {
    // Touch update
    this.touchControls?.update();

    if (this.stateMachine.isGameOver()) {
      this.gameOverTimer -= delta;
      if (this.gameOverTimer <= 0) {
        this.scene.start('LevelSelectScene');
      }
      return;
    }

    // Waiting for card selection — freeze game logic
    if (this.stateMachine.isStageClear()) return;

    // Pause toggle
    const sys = this.inputManager.getSystemInput();
    if (sys.pause) this.stateMachine.transition('pause');
    if (this.stateMachine.isPaused()) {
      if (sys.pause) this.stateMachine.transition('unpause');
      return;
    }

    // --- Character update ---
    const charInput = this.inputManager.getCharacterInput();
    this.character.update(delta, charInput);
    this.playCharacterAudio(delta);

    if (!this.character.alive) {
      this.stateMachine.transition('characterDied');
      this.triggerGameOver();
      this.renderAll();
      return;
    }

    // --- Bomb placement ---
    if (charInput.bomb) {
      this.bombs.placeBomb(this.character.x, this.character.y);
      this.charRenderer.drawBombCount(this.bombs.bombCount);
    }

    // --- Bomb update ---
    this.updateBombSystem(delta);

    // --- Slime update ---
    this.updateSlimes(delta);

    // --- Line clear animation ---
    if (this.stateMachine.isClearingLines()) {
      this.clearAnimTimer += delta;
      this.boardRenderer.render(
        this.boardModel.getBoard(), true, this.clearedRows, this.clearAnimTimer,
      );
      if (this.clearAnimTimer > CLEAR_ANIM_DURATION) {
        this.tetris.clearLines(this.clearedRows, this.upgrades.lineClearScoreMult);
        this.uiRenderer.updateAll(this.tetris.score, this.tetris.level, this.tetris.lines);

        const linesGoalMet  = this.levelManager.onLinesCleared(this.clearedRows.length);
        const stageComplete = linesGoalMet && this.tetris.score >= this.levelManager.getTargetScore();
        this.uiRenderer.updateStage(
          this.levelManager.currentStage,
          this.levelManager.linesThisStage,
          this.levelManager.getTargetLines(),
          this.levelManager.getTargetScore(),
        );

        if (stageComplete) {
          this.stateMachine.transition('stageClear');
          this.boardRenderer.markDirty();

          const isFirstClear = this.levelProgress.isFirstClear(this.currentLevel);

          if (isFirstClear) {
            // First clear: show card selection
            const cards = pickRandomCards(3);
            this.cardOverlay.show(cards, this.currentLevel, (card) => {
              this.upgrades.applyCard(card);

              // HP boost also heals immediately
              if (card.id === 'hp_boost') {
                this.character.hp = Math.min(
                  this.character.hp + 2,
                  this.character.maxHp,
                );
              }

              // bomb_capacity negative effect: target lines +2
              if (card.id === 'bomb_capacity') {
                this.levelManager.addTargetLinesBonus(2);
              }

              // Mark level as cleared and return to level select
              this.levelProgress.markCleared(this.currentLevel);
              this.scene.start('LevelSelectScene');
            });
          } else {
            // Already cleared: return to level select immediately
            this.levelProgress.markCleared(this.currentLevel);
            this.scene.start('LevelSelectScene');
          }
        } else {
          this.stateMachine.transition('animDone');
          this.boardRenderer.markDirty();
          this.spawnPiece();
        }
      }
      this.renderCharacterAndBombs();
      return;
    }

    // --- Tetris input ---
    const tetInput = this.inputManager.getTetrisInput();

    // Piece following
    if (this.tetris.pieceFollowing) {
      this.tetris.updateFollowing(this.character.getCharCenterX());
    }

    // Rotate
    if (tetInput.rotate) {
      if (this.tetris.rotatePiece(1)) {
        this.sound.play('rotate');
      }
    }

    // Drop (stop following)
    if (this.tetris.pieceFollowing && tetInput.drop) {
      this.tetris.pieceFollowing = false;
      this.sound.play('place');
    }

    // Hard drop
    if (tetInput.hardDrop) {
      this.tetris.hardDrop();
      this.checkAndExplodeBombCollisions();
      this.sound.play('harddrop');
      this.lockPiece();
      this.renderAll();
      return;
    }

    // Gravity
    const gravResult = this.tetris.applyGravity(delta);
    if (gravResult.moved) {
      this.checkAndExplodeBombCollisions();
    }

    // Lock delay
    if (this.tetris.updateLock(delta)) {
      this.lockPiece();
    }

    this.renderAll();
  }

  // ---- Lock piece flow ----

  private lockPiece(): void {
    this.tetris.lockPiece();
    this.boardRenderer.markDirty();

    // Crush check
    this.character.checkCrushOnLock();
    this.charRenderer.drawHP(this.character.hp, this.character.maxHp);

    if (!this.character.alive) {
      this.stateMachine.transition('characterDied');
      this.triggerGameOver();
      return;
    }

    // Add bomb
    this.bombs.addBomb();
    this.charRenderer.drawBombCount(this.bombs.bombCount);

    // Kill slimes crushed by the locked piece
    const slimesCrushed = this.slimes.killSlimesUnderPiece();
    if (slimesCrushed > 0) {
      this.tetris.score += Math.floor(SLIME_SCORE * this.upgrades.slimeKillScoreMult) * slimesCrushed;
      this.uiRenderer.updateScore(this.tetris.score);
    }

    // Check lines
    const fullRows = this.tetris.checkLines();
    if (fullRows.length > 0) {
      this.clearedRows   = fullRows;
      this.clearAnimTimer = 0;
      this.stateMachine.transition('linesDetected');
    } else {
      this.spawnPiece();
    }
  }

  private spawnPiece(): void {
    if (!this.tetris.spawnPiece()) {
      this.stateMachine.transition('pieceOverlap');
      this.triggerGameOver();
      return;
    }
    this.uiRenderer.drawNextPreview(this.tetris.nextType, TETROMINOES);
  }

  private triggerGameOver(): void {
    this.uiRenderer.showGameOver();
    this.gameOverTimer = 2500;
  }

  // ---- Slime system ----

  private updateSlimes(delta: number): void {
    const contacts = this.slimes.update(
      delta,
      this.character.x, this.character.y, CHAR_WIDTH, CHAR_HEIGHT,
      this.upgrades.slimeMoveSpeedMult,
      this.upgrades.slimeJumpVelocityMult,
    );
    if (contacts.length > 0) {
      this.character.takeDamage(SLIME_DAMAGE);
      this.charRenderer.drawHP(this.character.hp, this.character.maxHp);
      if (!this.character.alive) {
        this.stateMachine.transition('characterDied');
        this.triggerGameOver();
      }
    }
  }

  // ---- Bomb system ----

  private updateBombSystem(delta: number): void {
    const result = this.bombs.updateBombs(delta);

    for (const ticked of result.ticks) {
      if (ticked) this.sfxTick.play();
    }

    const sorted = [...result.toExplode].sort((a, b) => b - a);
    for (const idx of sorted) {
      this.sfxExplode.play();
      const explosionResult = this.bombs.explodeBomb(idx, this.character.x, this.character.y);
      this.boardRenderer.markDirty();

      // Score for destroyed blocks
      if (explosionResult.destroyedCells.length > 0) {
        this.tetris.addBombScore(explosionResult.destroyedCells.length, this.upgrades.bombScoreMult);
        this.uiRenderer.updateScore(this.tetris.score);
      }

      if (idx < this.bombGraphics.length) {
        this.bombGraphics[idx].destroy();
        this.bombGraphics.splice(idx, 1);
      }

      const expGfx = this.add.graphics();
      this.explosionGraphics.push(expGfx);

      if (explosionResult.hurtCharDist <= this.bombs.hurtRadius) {
        this.character.takeDamage(BOMB_DAMAGE);
        this.charRenderer.drawHP(this.character.hp, this.character.maxHp);
        if (!this.character.alive) {
          this.stateMachine.transition('characterDied');
          this.triggerGameOver();
        }
      }

      const slimesBlasted = this.slimes.killSlimesInExplosion(explosionResult.blastCells);
      if (slimesBlasted > 0) {
        this.tetris.score += Math.floor(SLIME_SCORE * this.upgrades.slimeKillScoreMult) * slimesBlasted;
        this.uiRenderer.updateScore(this.tetris.score);
      }
    }

    this.bombs.updateExplosions(delta);

    while (this.explosionGraphics.length > this.bombs.explosions.length) {
      const gfx = this.explosionGraphics.pop();
      gfx?.destroy();
    }

    while (this.bombGraphics.length < this.bombs.bombs.length) {
      this.bombGraphics.push(this.add.graphics());
    }
    while (this.bombGraphics.length > this.bombs.bombs.length) {
      const gfx = this.bombGraphics.pop();
      gfx?.destroy();
    }
  }

  private checkAndExplodeBombCollisions(): void {
    const hitIndices = this.bombs.checkPieceBombCollision(this.tetris.activePiece);
    if (hitIndices.length === 0) return;

    const sorted = [...hitIndices].sort((a, b) => b - a);
    for (const idx of sorted) {
      this.sfxExplode.play();
      const result = this.bombs.explodeBomb(idx, this.character.x, this.character.y);
      this.boardRenderer.markDirty();

      if (result.destroyedCells.length > 0) {
        this.tetris.addBombScore(result.destroyedCells.length, this.upgrades.bombScoreMult);
        this.uiRenderer.updateScore(this.tetris.score);
      }

      if (idx < this.bombGraphics.length) {
        this.bombGraphics[idx].destroy();
        this.bombGraphics.splice(idx, 1);
      }

      const expGfx = this.add.graphics();
      this.explosionGraphics.push(expGfx);

      if (result.hurtCharDist <= this.bombs.hurtRadius) {
        this.character.takeDamage(BOMB_DAMAGE);
        this.charRenderer.drawHP(this.character.hp, this.character.maxHp);
        if (!this.character.alive) {
          this.stateMachine.transition('characterDied');
          this.triggerGameOver();
        }
      }

      const slimesBlasted = this.slimes.killSlimesInExplosion(result.blastCells);
      if (slimesBlasted > 0) {
        this.tetris.score += Math.floor(SLIME_SCORE * this.upgrades.slimeKillScoreMult) * slimesBlasted;
        this.uiRenderer.updateScore(this.tetris.score);
      }
    }
  }

  // ---- Character audio ----

  private playCharacterAudio(delta: number): void {
    if (!this.wasGrounded && this.character.grounded) {
      this.sfxLand.play();
    }
    this.wasGrounded = this.character.grounded;

    if (this.character.grounded && this.character.vx !== 0) {
      this.stepTimer += delta;
      if (this.stepTimer >= 250) {
        this.stepTimer = 0;
        (this.stepFlip ? this.sfxStepAlt : this.sfxStep).play();
        this.stepFlip = !this.stepFlip;
      }
    } else {
      this.stepTimer = 200;
    }
  }

  // ---- Rendering ----

  private renderAll(): void {
    const board      = this.boardModel.getBoard();
    const isGameOver = this.stateMachine.isGameOver();
    const isClearing = this.stateMachine.isClearingLines();

    this.boardRenderer.render(board, isClearing, this.clearedRows, this.clearAnimTimer);

    const piece = this.tetris.activePiece;
    if (piece) {
      const renderInfo: PieceRenderInfo = { type: piece.type, rotation: piece.rotation, x: piece.x, y: piece.y };
      this.pieceRenderer.drawActivePiece(renderInfo, isGameOver, isClearing);
      const ghostY = this.tetris.getGhostY();
      this.pieceRenderer.drawGhost(renderInfo, ghostY, isGameOver, isClearing);
      this.pieceRenderer.drawLinkLine(
        renderInfo,
        this.character.getCharCenterX(), this.character.getCharCenterY(),
        this.tetris.pieceFollowing && !isGameOver,
      );
    }

    this.renderCharacterAndBombs();
  }

  private renderCharacterAndBombs(): void {
    const state = this.character.getState();
    this.charRenderer.draw(state);
    this.slimeRenderer.draw(this.slimes.slimes, this.slimes.deathEffects);

    for (let i = 0; i < this.bombs.bombs.length; i++) {
      const bomb = this.bombs.bombs[i];
      if (i < this.bombGraphics.length) {
        this.bombRenderer.drawBomb({
          x: bomb.x, y: bomb.y, timer: bomb.timer, graphics: this.bombGraphics[i],
        });
      }
    }

    for (let i = 0; i < this.bombs.explosions.length && i < this.explosionGraphics.length; i++) {
      this.bombRenderer.drawExplosions([{
        cells:    this.bombs.explosions[i].cells,
        timer:    this.bombs.explosions[i].timer,
        graphics: this.explosionGraphics[i],
      }]);
    }
  }

  // ---- Restart ----

  private restart(): void {
    // Reset all systems
    this.upgrades.reset();
    this.levelManager.reset();
    this.boardModel.init();
    this.tetris.reset();
    this.character.reset();
    this.bombs.reset();
    this.slimes.reset();
    this.stateMachine.transition('restart');
    this.cardOverlay.hide();

    // Destroy dynamic graphics
    for (const g of this.bombGraphics)      g.destroy();
    for (const g of this.explosionGraphics) g.destroy();
    this.bombGraphics      = [];
    this.explosionGraphics = [];

    // Reset audio state
    this.wasGrounded = false;
    this.stepTimer   = 0;

    this.boardRenderer.clear();
    this.boardRenderer.markDirty();
    this.pieceRenderer.clear();
    this.uiRenderer.hideGameOver();
    this.uiRenderer.updateAll(0, 1, 0);
    this.uiRenderer.updateStage(1, 0, this.levelManager.getTargetLines(), this.levelManager.getTargetScore());

    this.spawnPiece();
    this.charRenderer.drawHP(this.character.hp, this.character.maxHp);
    this.charRenderer.drawBombCount(0);
    this.renderAll();
  }
}
