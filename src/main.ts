import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { TutorialScene } from './scenes/TutorialScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { GameScene } from './scenes/GameScene';
import { ShopScene } from './scenes/ShopScene';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_BG_COLOR } from './constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: CANVAS_BG_COLOR,
  parent: 'game-container',
  scene: [TitleScene, TutorialScene, LevelSelectScene, GameScene, ShopScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  audio: {
    disableWebAudio: false,
  },
};

const game = new Phaser.Game(config);
