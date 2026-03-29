export enum GameState {
  PLAYING        = 'playing',
  PAUSED         = 'paused',
  CLEARING_LINES = 'clearing_lines',
  STAGE_CLEAR    = 'stage_clear',
  GAME_OVER      = 'game_over',
}

export type StateEvent =
  | 'pause'
  | 'unpause'
  | 'linesDetected'
  | 'animDone'
  | 'stageClear'
  | 'cardSelected'
  | 'characterDied'
  | 'pieceOverlap'
  | 'restart';

/**
 * Finite state machine for game states.
 */
export class GameStateMachine {
  private state: GameState = GameState.PLAYING;

  transition(event: StateEvent): boolean {
    const prev = this.state;
    switch (this.state) {
      case GameState.PLAYING:
        if (event === 'pause')          this.state = GameState.PAUSED;
        else if (event === 'linesDetected') this.state = GameState.CLEARING_LINES;
        else if (event === 'characterDied' || event === 'pieceOverlap') this.state = GameState.GAME_OVER;
        break;
      case GameState.PAUSED:
        if (event === 'unpause')        this.state = GameState.PLAYING;
        break;
      case GameState.CLEARING_LINES:
        if (event === 'animDone')       this.state = GameState.PLAYING;
        else if (event === 'stageClear') this.state = GameState.STAGE_CLEAR;
        break;
      case GameState.STAGE_CLEAR:
        if (event === 'cardSelected')   this.state = GameState.PLAYING;
        break;
      case GameState.GAME_OVER:
        if (event === 'restart')        this.state = GameState.PLAYING;
        break;
    }
    return prev !== this.state;
  }

  getState(): GameState  { return this.state; }
  isPlaying(): boolean   { return this.state === GameState.PLAYING; }
  isPaused(): boolean    { return this.state === GameState.PAUSED; }
  isClearingLines(): boolean { return this.state === GameState.CLEARING_LINES; }
  isStageClear(): boolean    { return this.state === GameState.STAGE_CLEAR; }
  isGameOver(): boolean  { return this.state === GameState.GAME_OVER; }

  reset(): void { this.state = GameState.PLAYING; }
}
