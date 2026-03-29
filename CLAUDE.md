# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

T-Boom is a hybrid Tetris + platformer game built with Phaser 3 + TypeScript + Vite. A character runs/jumps on locked Tetris blocks, places bombs to destroy them, and must avoid being crushed by falling pieces. All visuals are procedurally drawn (no sprite assets).

## Development Commands

```bash
npm run dev        # Start dev server (default port, use -- --port XXXX to change)
npm run build      # Type-check (tsc) then bundle (vite build)
npx tsc --noEmit   # Type-check only
```

To expose on LAN: `npx vite --host 0.0.0.0 --port 3000`

## Architecture

**Modular structure (~19 files, ~2400+ lines total):**

```
src/
  main.ts                        — Phaser game config (520x960 portrait, FIT scaling)
  constants.ts                  — All game parameters (no imports)
  events.ts                      — Event name constants for decoupling
  utils/
    CollisionUtils.ts            — Shared AABB/collision pixel↗grid utilities
  core/
    BoardModel.ts                — Board data model (pure state, no Phaser)
    TetrisEngine.ts              — Piece lifecycle: spawn/move/rotate/lock/gravity/follow
    CharacterPhysics.ts          — Character physics: gravity, collision/HP/damage
    BombSystem.ts                — Bomb placement/fuse/explosion/blast (no Phaser)
    GameStateMachine.ts          — FSM: PLAYING|PAUSED|CLEARING|GAME_OVER
  input/
    InputManager.ts              — Unified keyboard + touch input dispatcher
    TouchControls.ts              — Mobile overlay with dirty-flag rendering
  rendering/
    BoardRenderer.ts             — Board drawing with dirty flag optimization
    PieceRenderer.ts              — Active piece + ghost + link line
    CharacterRenderer.ts          — Character pixel-art + HP/bomb count display
    BombRenderer.ts               — Bomb + explosion visuals
    UIRenderer.ts                 — Score/level/lines/next preview/controls/game-over
  scenes/
    GameScene.ts                  — Thin orchestrator (creates subsystems, wires events, delegates rendering)
```

**Old `PlatformCharacter.ts` removed** — its logic split into CharacterPhysics + BombSystem + CharacterRenderer.

## Key Mechanics

- **Piece-following**: New pieces track character X position. W/Drop button detaches. Piece falls with gravity in both modes.
- **Board collision**: Character and bombs use axis-separated collision (move X → resolve → move Y → resolve) against board grid.
- **Bomb system**: Each locked piece grants +1 bomb. Bombs have gravity, fuse timer (2s), 3x3 blast radius,5x5 hurt radius. Falling pieces can detonate bombs on contact.
- **Crush detection**: After `lockPiece()` writes cells, character is checked for overlap → damage + push to nearest free position.
- **Touch + keyboard**: Both input methods work simultaneously via OR logic in `InputManager`.
- **State machine**: Game states (PLAYING/PAUSED/CLEARING_LINES/GAME_OVER) managed by `GameStateMachine` enum, replacing three independent booleans.

## Audio

Audio files go in `public/audio/` (Vite serves `public/` as static). Loaded in `GameScene.preload()`, played via `scene.sound.play('key')`. Keys: step, step2, jump, land, tick, explode, rotate, harddrop, place.

## Layout
Canvas 520x960. Board at (40,40), 10x32=320px wide, 20x32=640px tall. Side panel at x=390. Touch controls occupy y>720 region.

## Rendering Optimization
- **Board dirty flag**: `BoardRenderer` only redraws when board changes (lock/clear/bomb)
- **Piece dirty flag**: `PieceRenderer` only redraws when piece position/rotation changes
- **Touch dirty flag**: `TouchControls` only redraws when button pressed state changes
- **Removed redundant `drawAll()` calls**: 3 intermediate `drawAll()` calls in `GameScene.update()` were redundant with the final unconditional call
