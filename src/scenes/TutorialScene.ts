import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

export class TutorialScene extends Phaser.Scene {
  private flashText!: Phaser.GameObjects.Text;
  private flashTimer = 0;
  private showFlash  = true;

  constructor() {
    super({ key: 'TutorialScene' });
  }

  create(): void {
    this.add.rectangle(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 0x0a0a1a).setOrigin(0, 0);

    this.drawBorderDeco();

    const cx = CANVAS_WIDTH / 2;

    // ── Title ──────────────────────────────────────────────
    this.add.text(cx + 2, 42, '游戏教程', {
      fontSize: '38px', fontFamily: 'monospace', color: '#aa6600', fontStyle: 'bold',
    }).setOrigin(0.5).setAlpha(0.5);
    this.add.text(cx, 40, '游戏教程', {
      fontSize: '38px', fontFamily: 'monospace', color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, 82, 'HOW TO PLAY', {
      fontSize: '13px', fontFamily: 'monospace', color: '#556677', letterSpacing: 4,
    }).setOrigin(0.5);

    this.divider(99);

    // ── Section 1: 炸弹系统 ────────────────────────────────
    this.sectionHead('【炸弹系统】', 112);
    const bombLines = [
      '· 锁定每块方块获得 +1 炸弹（上限 3 枚）',
      '· 炸弹摧毁的每个方块  +15 分',
      '· 爆炸半径：3×3 格破坏  /  5×5 格伤害',
      '· 落下的方块触碰炸弹会立即引爆',
    ];
    bombLines.forEach((line, i) => this.bodyText(line, 134 + i * 21));

    this.divider(225);

    // ── Section 2: 自我伤害 ────────────────────────────────
    this.sectionHead('【炸弹危险】', 237);
    const selfLines = [
      '· 玩家处于 5×5 伤害范围内受到 2 点伤害',
      '· 放炸弹后请立刻离开爆炸区域！',
    ];
    selfLines.forEach((line, i) => this.bodyText(line, 259 + i * 21, '#ff8866'));

    this.divider(306);

    // ── Section 3: 史莱姆 ─────────────────────────────────
    this.sectionHead('【史莱姆敌人】', 318);
    const slimeLines = [
      '· 从第 2 关起开始出现',
      '· 接触史莱姆受到 1 点伤害',
      '· 用炸弹消灭史莱姆  +200 分',
      '· 关卡越高，史莱姆越快、越多',
    ];
    slimeLines.forEach((line, i) => this.bodyText(line, 340 + i * 21));

    this.divider(430);

    // ── Section 4: 过关条件 ───────────────────────────────
    this.sectionHead('【过关条件】', 442);
    this.bodyText('同时满足 消除行数 与 目标分数 才能过关：', 464);

    // Table header
    const tblX  = 60;
    const tblY  = 488;
    const colW  = [80, 90, 100];  // col widths: 关卡, 消除行数, 目标分数
    const rowH  = 20;
    const gfx   = this.add.graphics();
    const headBg = 0x223355;
    const rowBg1 = 0x131a27;
    const rowBg2 = 0x0d1219;

    const headers = ['关卡', '消除行数', '目标分数'];
    // Draw header row
    let xOff = tblX;
    for (let c = 0; c < 3; c++) {
      gfx.fillStyle(headBg, 1);
      gfx.fillRect(xOff, tblY, colW[c], rowH);
      gfx.lineStyle(1, 0x334466, 1);
      gfx.strokeRect(xOff, tblY, colW[c], rowH);
      this.add.text(xOff + colW[c] / 2, tblY + rowH / 2, headers[c], {
        fontSize: '11px', fontFamily: 'monospace', color: '#99bbdd',
      }).setOrigin(0.5);
      xOff += colW[c];
    }

    const tableData = [
      ['1',  '3 行',  '500'],
      ['2',  '4 行',  '1,200'],
      ['4',  '6 行',  '3,500'],
      ['6',  '10 行', '7,000'],
      ['8',  '20 行', '12,500'],
      ['10', '32 行', '20,000'],
    ];
    tableData.forEach((row, ri) => {
      xOff = tblX;
      const bg = ri % 2 === 0 ? rowBg1 : rowBg2;
      for (let c = 0; c < 3; c++) {
        gfx.fillStyle(bg, 1);
        gfx.fillRect(xOff, tblY + rowH * (ri + 1), colW[c], rowH);
        gfx.lineStyle(1, 0x223344, 0.8);
        gfx.strokeRect(xOff, tblY + rowH * (ri + 1), colW[c], rowH);
        const clr = c === 0 ? '#aabbcc' : (c === 1 ? '#66ddaa' : '#ffcc44');
        this.add.text(xOff + colW[c] / 2, tblY + rowH * (ri + 1) + rowH / 2, row[c], {
          fontSize: '11px', fontFamily: 'monospace', color: clr,
        }).setOrigin(0.5);
        xOff += colW[c];
      }
    });

    this.divider(644);

    // ── Section 5: 生命与失败 ─────────────────────────────
    this.sectionHead('【注意事项】', 656);
    const warnLines = [
      '· 玩家初始生命值 HP = 5',
      '· 被方块压到 −2 HP 并被推开',
      '· 被炸弹或史莱姆击中后 1.5 秒无敌',
      '· HP 归零即游戏失败',
    ];
    warnLines.forEach((line, i) => this.bodyText(line, 678 + i * 21));

    this.divider(770);

    // ── Section 6: 操作说明 ───────────────────────────────
    const ctrlY = 782;
    const ctrlC = '#445566';
    this.add.text(cx, ctrlY,      'A/D 移动  Space 跳跃  E 放炸弹', {
      fontSize: '12px', fontFamily: 'monospace', color: ctrlC,
    }).setOrigin(0.5);
    this.add.text(cx, ctrlY + 18, 'Q 旋转方块  W 脱离跟随  S 硬降', {
      fontSize: '12px', fontFamily: 'monospace', color: ctrlC,
    }).setOrigin(0.5);

    this.divider(818);

    // ── Flash prompt ──────────────────────────────────────
    this.flashText = this.add.text(cx, 848, '按 SPACE / 点击  开始游戏', {
      fontSize: '18px', fontFamily: 'monospace', color: '#ffdd44', fontStyle: 'bold',
    }).setOrigin(0.5);

    // Back button
    const backBg = this.add.graphics();
    backBg.fillStyle(0x223344, 0.9);
    backBg.fillRoundedRect(cx - 55, 882, 110, 36, 6);
    backBg.lineStyle(1, 0x445566, 1);
    backBg.strokeRoundedRect(cx - 55, 882, 110, 36, 6);
    const backBtn = this.add.text(cx, 900, '< 返回标题', {
      fontSize: '14px', fontFamily: 'monospace', color: '#8899bb',
    }).setOrigin(0.5);
    backBtn.setInteractive({ cursor: 'pointer' });
    backBtn.on('pointerover', () => backBtn.setColor('#aabbdd'));
    backBtn.on('pointerout',  () => backBtn.setColor('#8899bb'));
    backBtn.on('pointerdown', () => this.scene.start('TitleScene'));

    // Input
    this.input.keyboard!.on('keydown', (ev: KeyboardEvent) => {
      if (ev.code === 'Space' || ev.code === 'Enter') {
        this.scene.start('LevelSelectScene');
      }
      if (ev.code === 'Escape') {
        this.scene.start('TitleScene');
      }
    });

    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      // Ignore clicks on the back button area
      if (ptr.y > 875) return;
      this.scene.start('LevelSelectScene');
    });
  }

  update(_time: number, delta: number): void {
    this.flashTimer += delta;
    if (this.flashTimer >= 620) {
      this.flashTimer  = 0;
      this.showFlash   = !this.showFlash;
      this.flashText.setVisible(this.showFlash);
    }
  }

  private sectionHead(label: string, y: number): void {
    this.add.text(CANVAS_WIDTH / 2, y, label, {
      fontSize: '15px', fontFamily: 'monospace', color: '#99aacc', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private bodyText(text: string, y: number, color = '#667788'): void {
    this.add.text(54, y, text, {
      fontSize: '13px', fontFamily: 'monospace', color,
    });
  }

  private divider(y: number): void {
    const gfx = this.add.graphics();
    gfx.lineStyle(1, 0x334466, 0.6);
    gfx.lineBetween(40, y, CANVAS_WIDTH - 40, y);
  }

  private drawBorderDeco(): void {
    const gfx = this.add.graphics();
    const blocks = [
      { x: 14, y: 14, color: 0x00f0f0 },
      { x: 46, y: 14, color: 0x00f0f0 },
      { x: 14, y: 46, color: 0x00f0f0 },
      { x: CANVAS_WIDTH - 46, y: 14, color: 0xf00000 },
      { x: CANVAS_WIDTH - 46, y: 46, color: 0xf00000 },
      { x: CANVAS_WIDTH - 78, y: 14, color: 0xf00000 },
    ];
    for (const b of blocks) {
      const s = 28;
      gfx.fillStyle(b.color, 0.4);
      gfx.fillRect(b.x, b.y, s, s);
      gfx.fillStyle(0xffffff, 0.1);
      gfx.fillRect(b.x, b.y, s, 3);
      gfx.fillRect(b.x, b.y, 3, s);
    }
  }
}
