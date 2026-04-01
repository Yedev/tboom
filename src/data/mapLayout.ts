/**
 * mapLayout.ts — Branch level map data.
 *
 * The map has two fork points (after L3 and after L6) where the player
 * can choose the BOSS path or the SKIP path:
 *
 *   1 → 2 → 3 ┬→ 4 (BOSS) ─┐
 *              └→ 5 (skip)  ─┤
 *                             └→ 5 → 6 ┬→ 7 (BOSS) ─┐
 *                                       └→ 8 (skip)  ─┤
 *                                                      └→ 8 → 9 → 10 (BOSS)
 *
 * Node IDs are strings to support virtual skip nodes.
 */

export interface MapNode {
  id: string;
  /** Phaser GameScene level number to launch */
  level: number;
  /** Canvas pixel position of the node centre */
  x: number;
  y: number;
  isBoss: boolean;
  /**
   * If true this is a "skip BOSS" node.  The player still plays the level
   * indicated by `level`, but a visual badge makes the trade-off clear.
   */
  isSkip: boolean;
  label: string;
  /** IDs of nodes this connects to */
  next: string[];
}

// Canvas 520 × 960
// Levels run bottom → top to give a "climber" feel
export const MAP_NODES: MapNode[] = [
  // ── Linear section 1-3 ───────────────────────────────────────────
  { id: '1',  level: 1,  x: 260, y: 840, isBoss: false, isSkip: false, label: '1',      next: ['2'] },
  { id: '2',  level: 2,  x: 260, y: 750, isBoss: false, isSkip: false, label: '2',      next: ['3'] },
  { id: '3',  level: 3,  x: 260, y: 660, isBoss: false, isSkip: false, label: '3',      next: ['4boss', '4skip'] },

  // ── First fork: BOSS 4 or skip to 5 ──────────────────────────────
  { id: '4boss', level: 4, x: 140, y: 560, isBoss: true,  isSkip: false, label: '4 BOSS', next: ['5'] },
  { id: '4skip', level: 5, x: 380, y: 560, isBoss: false, isSkip: true,  label: '跳过',   next: ['5'] },

  // ── Linear section 5-6 ───────────────────────────────────────────
  { id: '5',  level: 5,  x: 260, y: 460, isBoss: false, isSkip: false, label: '5',      next: ['6'] },
  { id: '6',  level: 6,  x: 260, y: 370, isBoss: false, isSkip: false, label: '6',      next: ['7boss', '7skip'] },

  // ── Second fork: BOSS 7 or skip to 8 ─────────────────────────────
  { id: '7boss', level: 7, x: 140, y: 270, isBoss: true,  isSkip: false, label: '7 BOSS', next: ['8'] },
  { id: '7skip', level: 8, x: 380, y: 270, isBoss: false, isSkip: true,  label: '跳过',   next: ['8'] },

  // ── Linear section 8-10 ──────────────────────────────────────────
  { id: '8',  level: 8,  x: 260, y: 170, isBoss: false, isSkip: false, label: '8',      next: ['9'] },
  { id: '9',  level: 9,  x: 260, y:  90, isBoss: false, isSkip: false, label: '9',      next: ['10'] },
  { id: '10', level: 10, x: 260, y:  20, isBoss: true,  isSkip: false, label: '10 BOSS',next: [] },
];

export function getNodeById(id: string): MapNode | undefined {
  return MAP_NODES.find(n => n.id === id);
}

/** Return the node(s) the player can go to after clearing a given level.
 *  Returns empty array if no outgoing edges (end of game). */
export function getNextNodes(clearedNodeId: string): MapNode[] {
  const node = getNodeById(clearedNodeId);
  if (!node) return [];
  return node.next.map(id => getNodeById(id)).filter(Boolean) as MapNode[];
}
