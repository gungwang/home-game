const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

// 1. Level Colors & Configs
code = code.replace(
  'const LEVEL_COLORS = [',
  `const BASE_LEVEL_COLORS = [
  0x173256, // 1: Deep Blue
  0x3a1927, // 2: Deep Red
  0x173a2c, // 3: Deep Green
  0x43301a, // 4: Deep Orange
  0x26183e, // 5: Deep Purple
  0x143947, // 6: Deep Cyan
  0x3a2613, // 7: Deep Brown
  0x1a2933, // 8: Deep Slate
  0x242a35, // 9: Deep Gray
  0x351116  // 10: Nightmare Red
];\nconst LEVEL_COLORS = [...BASE_LEVEL_COLORS, ...BASE_LEVEL_COLORS];\nconst IGNORED_LEVEL_COLORS = [`
);

code = code.replace(
  'const LEVELS: LevelConfig[] = [',
  `const BASE_LEVELS: LevelConfig[] = [
  { name: "Central Park", key: "plaza_hotel", width: 200, height: 400, screenBox: { x: 0, y: -100, width: 160, height: 120 } },
  { name: "Midtown North", key: "chrysler", width: 100, height: 400, screenBox: { x: 0, y: 0, width: 80, height: 60 } },
  { name: "Midtown South", key: "empire_state", width: 100, height: 400, screenBox: { x: 0, y: 0, width: 80, height: 60 } },
  { name: "Chelsea & High Line", key: "vessel", width: 150, height: 200, screenBox: { x: 0, y: -50, width: 100, height: 75 } },
  { name: "Greenwich Village", key: "washington_arch", width: 200, height: 200, screenBox: { x: 0, y: -80, width: 120, height: 90 } },
  { name: "Lower East Side", key: "tenement", width: 200, height: 300, screenBox: { x: 0, y: -50, width: 160, height: 120 } },
  { name: "Tribeca & SoHo", key: "cast_iron", width: 200, height: 300, screenBox: { x: 0, y: -50, width: 160, height: 120 } },
  { name: "Brooklyn Bridge", key: "brooklyn_bridge", width: 200, height: 400, screenBox: { x: 0, y: -100, width: 120, height: 90 } },
  { name: "Financial District", key: "one_wtc", width: 150, height: 500, screenBox: { x: 0, y: -150, width: 100, height: 75 } },
  { name: "The Battery", key: "statue_of_liberty", width: 200, height: 400, screenBox: { x: 0, y: 100, width: 120, height: 90 } } // Screen on base
];\nconst LEVELS: LevelConfig[] = [...BASE_LEVELS, ...BASE_LEVELS];\nconst IGNORED_LEVELS: LevelConfig[] = [`
);

// 2. Difficulty & Max Level Methods
code = code.replace(
  `private difficulty: 'NORMAL' | 'NIGHTMARE' = 'NORMAL';`,
  `private difficulty: 'NORMAL' | 'NIGHTMARE' | 'HARD' = 'NORMAL';
  
  private getMaxLevel(): number {
    return this.difficulty === 'HARD' ? 15 : 20;
  }`
);

// 3. Boss check
code = code.replace(
  `if (this.currentLevel === 10) {
         // Video for Level 10 finished -> Game Over (Victory!)
         this.triggerGameOver();
         return;
      }`,
  `if (this.currentLevel === this.getMaxLevel()) {
         // Video for final level finished -> Game Over (Victory!)
         this.triggerGameOver();
         return;
      }`
);

code = code.replace(
  `if (this.currentLevel === 10) {
        // Just started Level 10 -> Spawn Boss immediately instead of normal enemies
        this.isBossLevel = true;
        this.spawnBoss();
      }`,
  `if (this.currentLevel % 5 === 0) {
        this.isBossLevel = true;
        const smallCount = this.currentLevel / 5;
        this.spawnSmallDragonBoss(smallCount);
        if (this.currentLevel === this.getMaxLevel()) {
          this.spawnBoss(2);
        }
      }`
);

// Level bounds & limits
code = code.replace(/this\.currentLevel < 10/g, 'this.currentLevel < this.getMaxLevel()');
code = code.replace(/this\.currentLevel > 10/g, 'this.currentLevel > this.getMaxLevel()');
code = code.replace(/Math\.min\(this\.currentLevel - 1, 9\)/g, 'this.currentLevel - 1');

// 4. Difficulty UI
code = code.replace(
  `const bg = this.add.rectangle(0, 0, 600, 300, 0x000000, 0.9);`,
  `const bg = this.add.rectangle(0, 0, 800, 300, 0x000000, 0.9);`
);

code = code.replace(
  `const normalBtn = this.add.rectangle(-150, 40, 200, 60, 0x000000, 1);
    normalBtn.setStrokeStyle(2, 0x00ffff);
    normalBtn.setInteractive({ useHandCursor: true });
    const normalText = this.add.text(-150, 40, 'NORMAL', { fontFamily: 'monospace', fontSize: '24px', color: '#00ffff' }).setOrigin(0.5);

    const nightmareBtn = this.add.rectangle(150, 40, 200, 60, 0x000000, 1);
    nightmareBtn.setStrokeStyle(2, 0xff0000);
    nightmareBtn.setInteractive({ useHandCursor: true });
    const nightmareText = this.add.text(150, 40, 'NIGHTMARE', { fontFamily: 'monospace', fontSize: '24px', color: '#ff0000' }).setOrigin(0.5);`,
  `const normalBtn = this.add.rectangle(-250, 40, 200, 60, 0x000000, 1);
    normalBtn.setStrokeStyle(2, 0x00ffff);
    normalBtn.setInteractive({ useHandCursor: true });
    const normalText = this.add.text(-250, 40, 'NORMAL', { fontFamily: 'monospace', fontSize: '24px', color: '#00ffff' }).setOrigin(0.5);

    const hardBtn = this.add.rectangle(0, 40, 200, 60, 0x000000, 1);
    hardBtn.setStrokeStyle(2, 0xffaa00);
    hardBtn.setInteractive({ useHandCursor: true });
    const hardText = this.add.text(0, 40, 'HARD', { fontFamily: 'monospace', fontSize: '24px', color: '#ffaa00' }).setOrigin(0.5);

    const nightmareBtn = this.add.rectangle(250, 40, 200, 60, 0x000000, 1);
    nightmareBtn.setStrokeStyle(2, 0xff0000);
    nightmareBtn.setInteractive({ useHandCursor: true });
    const nightmareText = this.add.text(250, 40, 'NIGHTMARE', { fontFamily: 'monospace', fontSize: '24px', color: '#ff0000' }).setOrigin(0.5);`
);

code = code.replace(
  `const startGame = (diff: 'NORMAL' | 'NIGHTMARE') => {`,
  `const startGame = (diff: 'NORMAL' | 'NIGHTMARE' | 'HARD') => {`
);

code = code.replace(
  `nightmareBtn.on('pointerout', () => nightmareBtn.setFillStyle(0x000000, 1));

    container.add([bg, title, normalBtn, normalText, nightmareBtn, nightmareText]);`,
  `nightmareBtn.on('pointerout', () => nightmareBtn.setFillStyle(0x000000, 1));
    
    hardBtn.on('pointerdown', () => startGame('HARD'));
    hardBtn.on('pointerover', () => hardBtn.setFillStyle(0xffaa00, 0.2));
    hardBtn.on('pointerout', () => hardBtn.setFillStyle(0x000000, 1));

    container.add([bg, title, normalBtn, normalText, hardBtn, hardText, nightmareBtn, nightmareText]);`
);

// 5. Weapon Fire Functions
code = code.replace(
  `const fire = (x: number, y: number, angle: number = 0) => {
      const fireball = this.fireballs.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
      if (fireball) {
        fireball.enableBody(true, x, y, true, true);
        fireball.setTexture('fireball');
        fireball.setDisplaySize(30, 15);
        fireball.body?.setSize(20, 10);
        if (!fireball.body) this.physics.add.existing(fireball);

        const vx = Math.cos(angle) * 600;
        const vy = Math.sin(angle) * 600;
        fireball.setVelocity(vx, vy);
        fireball.setAngle(Phaser.Math.RadToDeg(angle));
        fireball.setCollideWorldBounds(false);
        fireball.setDepth(10);
      }
    };`,
  `const fire = (x: number, y: number, angle: number = 0, isBlue: boolean = false) => {
      const fireball = this.fireballs.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
      if (fireball) {
        fireball.enableBody(true, x, y, true, true);
        fireball.setTexture('fireball');
        fireball.setDisplaySize(30, 15);
        fireball.body?.setSize(20, 10);
        if (!fireball.body) this.physics.add.existing(fireball);

        const vx = Math.cos(angle) * 600;
        const vy = Math.sin(angle) * 600;
        fireball.setVelocity(vx, vy);
        fireball.setAngle(Phaser.Math.RadToDeg(angle));
        fireball.setCollideWorldBounds(false);
        fireball.setDepth(10);
        
        if (isBlue) {
          fireball.setTint(0x00ccff);
          fireball.setData('damage', 20);
        } else {
          fireball.clearTint();
          fireball.setData('damage', 10);
        }
      }
    };`
);

code = code.replace(
  `} else {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    }`,
  `} else if (this.fireballLevel === 4) {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    } else if (this.fireballLevel === 5) {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    } else if (this.fireballLevel === 6) {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    } else { // 7
      fire(this.dragon.x + 20, this.dragon.y, -0.2, true);
      fire(this.dragon.x + 20, this.dragon.y, -0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.2, true);
    }`
);

code = code.replace(
  `const missile = this.missiles.get(this.dragon.x + 20, this.dragon.y) as Phaser.Physics.Arcade.Sprite | null;
      if (missile) {
        missile.enableBody(true, this.dragon.x + 20, this.dragon.y, true, true);
        const tex = 'missile_lv' + this.missileLevel;
        const w = 40 + (this.missileLevel - 1) * 20;
        const h = 20 + (this.missileLevel - 1) * 10;
        missile.setTexture(tex);
        missile.setDisplaySize(w, h);
        missile.body?.setSize(w * 0.75, h * 0.75);
        missile.setData('damage', 30 * this.missileLevel);
        if (!missile.body) this.physics.add.existing(missile);
        missile.setVelocityX(400);
      }`,
  `const fireOne = (yOffset: number) => {
        const missile = this.missiles.get(this.dragon.x + 20, this.dragon.y + yOffset) as Phaser.Physics.Arcade.Sprite | null;
        if (missile) {
          missile.enableBody(true, this.dragon.x + 20, this.dragon.y + yOffset, true, true);
          const visualLevel = Math.min(this.missileLevel, 4);
          const tex = 'missile_lv' + visualLevel;
          const w = 40 + (visualLevel - 1) * 20;
          const h = 20 + (visualLevel - 1) * 10;
          missile.setTexture(tex);
          missile.setDisplaySize(w, h);
          missile.body?.setSize(w * 0.75, h * 0.75);
          missile.setData('damage', 30 * this.missileLevel);
          if (!missile.body) this.physics.add.existing(missile);
          missile.setVelocityX(400);
        }
      };

      if (this.missileLevel >= 5) {
        fireOne(-15);
        fireOne(15);
      } else {
        fireOne(0);
      }`
);

// 6. Upgrades Caps
code = code.replace(/this\.fireballLevel < 4/g, 'this.fireballLevel < 7');
code = code.replace(/this\.missileLevel < 4/g, 'this.missileLevel < 5');

// 7. Damage calculations
code = code.replace(
  `this.damageEnemy(enemy, 10);`,
  `let damage = fireball.getData('damage') || 10;
    if (this.difficulty === 'NIGHTMARE') damage *= 3;
    this.damageEnemy(enemy, damage);`
);

code = code.replace(
  `const damage = missile.getData('damage') || 30;
    this.damageEnemy(enemy, damage);`,
  `let damage = missile.getData('damage') || 30;
    if (this.difficulty === 'NIGHTMARE') damage *= 3;
    this.damageEnemy(enemy, damage);`
);

// 8. Enemy Spawns & Hard Mode
code = code.replace(
  `if (this.difficulty === 'NIGHTMARE') {
      health *= 2;
      damage *= 2;
    }

    const numSpawns = this.difficulty === 'NIGHTMARE' ? (type === 'chicken' ? 2 : 3) : 1;`,
  `if (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') {
      health *= 2;
      damage *= 2;
    }

    const numSpawns = (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') ? (type === 'chicken' ? 2 : 3) : 1;`
);

code = code.replace(
  `if ((this.currentLevel === 9 || this.currentLevel === 10) && this.enemyCounter % 15 === 0)`,
  `if ((this.currentLevel === this.getMaxLevel() - 1 || this.currentLevel === this.getMaxLevel()) && this.enemyCounter % 15 === 0)`
);

// 9. Boss spawns
code = code.replace(
  `spawnBoss() {
    // Add Statue of Liberty in background as the final goal`,
  `spawnSmallDragonBoss(count: number) {
    for (let i = 0; i < count; i++) {
      const row = i % 4;
      const col = Math.floor(i / 4);
      const y = (this.sys.canvas.height / 5) * (row + 1);
      const x = this.sys.canvas.width + 100 + (col * 150);
      const boss = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (boss) {
        boss.enableBody(true, x, y, true, true);
        boss.setTexture('dragon-boss');
        boss.setTint(0x66ffcc);
        boss.setDisplaySize(140, 140);
        boss.setAlpha(1);
        boss.setData('isBoss', true);

        const bossBody = boss.body as Phaser.Physics.Arcade.Body;
        bossBody.setSize(boss.width, boss.height);
        bossBody.setImmovable(true);

        let h = 200;
        let d = 20;
        if (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') {
          h = 400;
        }

        boss.setData('health', h);
        boss.setData('maxHealth', h);
        boss.setData('damage', d);
        boss.setData('points', 500);

        boss.setVelocityX(-100);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));
      }
    }
  }

  spawnBoss(count: number = 2) {
    // Add Statue of Liberty in background as the final goal`
);

code = code.replace(
  `let numBosses = Phaser.Math.Between(2, 3);
    if (this.difficulty === 'NIGHTMARE') {
      numBosses *= 3;
    }`,
  `let numBosses = count;
    if (this.difficulty === 'NIGHTMARE') {
      numBosses *= 3;
    }`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
