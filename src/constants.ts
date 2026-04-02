// Canvas
export const CANVAS_WIDTH = 640;
export const CANVAS_HEIGHT = 960;
export const CANVAS_BG_COLOR = '#0a0a1a';

// Board dimensions
export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 32;

// Layout
export const BOARD_X = 10;
export const BOARD_Y = 40;
export const PANEL_X = BOARD_X + COLS * BLOCK_SIZE + 20;

// Board visual
export const BOARD_BORDER_WIDTH = 2;
export const BOARD_BORDER_COLOR = 0x334466;
export const GRID_LINE_WIDTH = 0.5;
export const GRID_LINE_COLOR = 0x1a1a2e;

// Block bevel rendering
export const BLOCK_HIGHLIGHT_ALPHA = 0.2;
export const BLOCK_SHADOW_ALPHA = 0.3;
export const BLOCK_BEVEL_SIZE = 2;

// Link line (piece → character)
export const LINK_LINE_WIDTH = 1.5;
export const LINK_LINE_COLOR = 0x6688aa;
export const LINK_LINE_ALPHA = 0.5;
export const LINK_DASH_LENGTH = 8;

// Timing
export const INITIAL_DROP_INTERVAL = 800;
export const MIN_DROP_INTERVAL = 50;
export const SPEED_INCREMENT = 40;
export const MAX_DELTA_MS = 33;

// Tetris lock delay
export const LOCK_DELAY = 500;
export const MAX_LOCK_MOVES = 15;

// Line clear animation
export const CLEAR_ANIM_DURATION = 400;
export const CLEAR_FLASH_INTERVAL = 80;
export const CLEAR_FLASH_COLOR = 0xffffff;

// Preview
export const PREVIEW_BLOCK_SIZE = 24;
export const PREVIEW_Y_OFFSET = 250;

// Colors for each tetromino type (index 1-7)
export const PIECE_COLORS: number[] = [
  0x000000, // 0: empty
  0x00f0f0, // I - cyan
  0x0000f0, // J - blue
  0xf0a000, // L - orange
  0xf0f000, // O - yellow
  0x00f000, // S - green
  0xa000f0, // T - purple
  0xf00000, // Z - red
];

export const PIECE_BORDER_COLORS: number[] = [
  0x000000,
  0x00cccc, // I
  0x0000cc, // J
  0xcc8800, // L
  0xcccc00, // O
  0x00cc00, // S
  0x8800cc, // T
  0xcc0000, // Z
];

// Tetromino shapes (each rotation state is a 2D array)
export const TETROMINOES: number[][][][] = [
  // I
  [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  // J
  [
    [[2,0,0],[2,2,2],[0,0,0]],
    [[0,2,2],[0,2,0],[0,2,0]],
    [[0,0,0],[2,2,2],[0,0,2]],
    [[0,2,0],[0,2,0],[2,2,0]],
  ],
  // L
  [
    [[0,0,3],[3,3,3],[0,0,0]],
    [[0,3,0],[0,3,0],[0,3,3]],
    [[0,0,0],[3,3,3],[3,0,0]],
    [[3,3,0],[0,3,0],[0,3,0]],
  ],
  // O
  [
    [[4,4],[4,4]],
    [[4,4],[4,4]],
    [[4,4],[4,4]],
    [[4,4],[4,4]],
  ],
  // S
  [
    [[0,5,5],[5,5,0],[0,0,0]],
    [[0,5,0],[0,5,5],[0,0,5]],
    [[0,0,0],[0,5,5],[5,5,0]],
    [[5,0,0],[5,5,0],[0,5,0]],
  ],
  // T
  [
    [[0,6,0],[6,6,6],[0,0,0]],
    [[0,6,0],[0,6,6],[0,6,0]],
    [[0,0,0],[6,6,6],[0,6,0]],
    [[0,6,0],[6,6,0],[0,6,0]],
  ],
  // Z
  [
    [[7,7,0],[0,7,7],[0,0,0]],
    [[0,0,7],[0,7,7],[0,7,0]],
    [[0,0,0],[7,7,0],[0,7,7]],
    [[0,7,0],[7,7,0],[7,0,0]],
  ],
];

// Wall kick data (SRS)
export const WALL_KICKS: Record<string, [number, number][]> = {
  '0>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '1>2': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '2>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
  '3>0': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '1>0': [[0,0],[1,0],[1,-1],[0,2],[1,2]],
  '2>1': [[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
  '3>2': [[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
  '0>3': [[0,0],[1,0],[1,1],[0,-2],[1,-2]],
};

export const I_WALL_KICKS: Record<string, [number, number][]> = {
  '0>1': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '1>2': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
  '2>3': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '3>0': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '1>0': [[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
  '2>1': [[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
  '3>2': [[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
  '0>3': [[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
};

// Scoring
export const LINE_SCORES = [0, 100, 300, 500, 800];
export const SOFT_DROP_SCORE = 1;
export const HARD_DROP_SCORE = 2;
export const BOMB_BLOCK_SCORE = 15;  // score per block destroyed by bomb

// Bomb inventory
export const BOMB_MAX_COUNT = 3;     // initial max bombs player can hold

// Character constants
export const CHAR_WIDTH = 32;
export const CHAR_HEIGHT = 32;
export const CHAR_SCALE = 1;              // ratio vs original BLOCK_SIZE=32 design
export const CHAR_GRAVITY = 1200;          // pixels/sec^2
export const CHAR_JUMP_VELOCITY = -420;  // pixels/sec (negative = up)
export const CHAR_MOVE_SPEED = 160;      // pixels/sec
export const CHAR_MAX_HP = 5;
export const CHAR_CRUSH_DAMAGE = 2;
export const CHAR_INVINCIBLE_DURATION = 1500; // ms
export const CHAR_FLASH_INTERVAL = 80;     // ms between flash toggles
export const CHAR_ABOVE_BOARD_BLOCKS = 4;  // max blocks above board top
export const CHAR_FALL_OFF_MARGIN = BLOCK_SIZE; // falling off bottom margin

// Character audio
export const STEP_SOUND_INTERVAL = 250;    // ms between footstep sounds
export const STEP_INITIAL_TIMER = 200;     // play immediately on first step

// Character animation
export const CHAR_BREATHE_SPEED = 3;
export const CHAR_BREATHE_AMPLITUDE = 0.5;
export const CHAR_BLINK_PERIOD = 4.5;      // seconds for full blink cycle
export const CHAR_BLINK_OPEN_RATIO = 3.9;  // seconds eyes open per cycle
export const CHAR_WALK_ANIM_SPEED = 14;
export const CHAR_JUMP_BODY_OFFSET = -2;   // scaled pixels

// Character colors
export const CHAR_BODY_COLOR = 0xff6644;
export const CHAR_HEAD_COLOR = 0xff8866;
export const CHAR_LEG_COLOR = 0xdd5533;
export const CHAR_HURT_BODY_COLOR = 0xff2222;
export const CHAR_HURT_HEAD_COLOR = 0xff4444;
export const CHAR_HURT_LEG_COLOR = 0xcc1111;

// Character find-free-position
export const FIND_FREE_STEP = 4;
export const FIND_FREE_MAX_RADIUS = BLOCK_SIZE * 4;

// Bomb constants
export const BOMB_SIZE = 16;                  // pixel size of bomb entity
export const BOMB_GRAVITY = 800;              // pixels/sec^2
export const BOMB_FUSE_TIME = 2000;           // ms before explosion
export const BOMB_BLAST_RADIUS = 1;           // grid cells (1 = 3x3)
export const BOMB_HURT_RADIUS = 2;            // grid cells for character damage
export const BOMB_DAMAGE = 2;
export const BOMB_EXPLOSION_DURATION = 400;   // ms for explosion visual

// Bomb tick sounds (ms remaining thresholds)
export const BOMB_TICK_TIMINGS = [1200, 800, 400];

// Bomb visual
export const BOMB_FLASH_RATE_MIN = 150;
export const BOMB_FLASH_RATE_MAX = 350;
export const BOMB_BODY_DARK = 0x222222;
export const BOMB_BODY_LIGHT = 0x444444;
export const BOMB_HIGHLIGHT_COLOR = 0xffffff;
export const BOMB_HIGHLIGHT_ALPHA = 0.25;
export const BOMB_FUSE_COLOR = 0x886644;
export const BOMB_SPARK_COLOR = 0xff6600;
export const BOMB_SPARK_GLOW_COLOR = 0xffcc00;
export const BOMB_SPARK_GLOW_ALPHA = 0.7;

// Explosion visual
export const EXPLOSION_FLASH_INTERVAL = 60;
export const EXPLOSION_FLASH_ALPHA = 0.85;
export const EXPLOSION_COLOR_A = 0xff6600;
export const EXPLOSION_COLOR_B = 0xffcc00;

// Character hitbox inset (smaller collision box than visual)
export const CHAR_HB_INSET_X = 3; // px inset per side horizontally

// Slime enemy (active from level 2+)
export const SLIME_SIZE = 24;              // hitbox & visual size (px)
export const SLIME_GRAVITY = 1200;
export const SLIME_JUMP_VELOCITY = -360;
export const SLIME_MOVE_SPEED = 70;        // px/sec horizontal while airborne
export const SLIME_JUMP_INTERVAL = 2200;   // ms between jumps
export const SLIME_SPAWN_INTERVAL = 18000; // ms between spawns
export const SLIME_FIRST_SPAWN = 10000;    // ms until first spawn
export const SLIME_MAX_COUNT = 3;
export const SLIME_DAMAGE = 1;
export const SLIME_SCORE = 200;
export const SLIME_COLOR_BODY = 0x33bb33;
export const SLIME_COLOR_DARK = 0x228822;
export const SLIME_COLOR_EYE = 0xffffff;
export const SLIME_COLOR_PUPIL = 0x004400;

// Touch controls layout
export const DPAD_CX = 120;
export const DPAD_CY = 840;
export const DPAD_SIZE = 54;
export const DPAD_GAP = 8;
export const DPAD_ARROW_HALF_SIZE = 12;
export const BTN_CLUSTER_CX = 510;
export const BTN_CLUSTER_CY = 870;
export const BTN_BIG_R = 44;
export const BTN_SMALL_R = 30;
export const BTN_PAUSE_R = 22;
export const BTN_CLUSTER_OFFSET_X = 70;
export const BTN_CLUSTER_OFFSET_Y = 55;
export const BTN_PAUSE_OFFSET_Y = 110;
export const BUTTON_HIT_RADIUS_MULT = 1.4;
