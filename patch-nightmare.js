const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add difficulty property
content = content.replace(
    "private isGracePeriod: boolean = false;",
    "private difficulty: 'NORMAL' | 'NIGHTMARE' = 'NORMAL';\n  private isGracePeriod: boolean = false;"
);

// 2. Add showDifficultySelection method and call it at end of create
const createEnd = `    // How to Play Overlay
    this.showHowToPlay(width, height);

    // Generate hologram texture for screens
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.lineStyle(2, 0x00ff00, 1);
    g.fillRect(0,0, 100, 100);
    g.strokeRect(0,0,100,100);
    g.generateTexture('hologramScreen', 100, 100);
    g.destroy();

    this.isGracePeriod = true;
    this.time.delayedCall(6000, () => {
      this.isGracePeriod = false;
      this.showLevelTitle();
    });
  }`;

const createEndNew = `    // Generate hologram texture for screens
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.lineStyle(2, 0x00ff00, 1);
    g.fillRect(0,0, 100, 100);
    g.strokeRect(0,0,100,100);
    g.generateTexture('hologramScreen', 100, 100);
    g.destroy();

    this.showDifficultySelection(width, height);
  }

  showDifficultySelection(width: number, height: number) {
    this.isPaused = true;
    
    const container = this.add.container(width / 2, height / 2).setDepth(5000).setScrollFactor(0);

    const bg = this.add.rectangle(0, 0, 600, 300, 0x000000, 0.9);
    bg.setStrokeStyle(4, 0xff00ff);

    const title = this.add.text(0, -80, 'SELECT DIFFICULTY', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const normalBtn = this.add.rectangle(-150, 40, 200, 60, 0x000000, 1);
    normalBtn.setStrokeStyle(2, 0x00ffff);
    normalBtn.setInteractive({ useHandCursor: true });
    const normalText = this.add.text(-150, 40, 'NORMAL', { fontFamily: 'monospace', fontSize: '24px', color: '#00ffff' }).setOrigin(0.5);

    const nightmareBtn = this.add.rectangle(150, 40, 200, 60, 0x000000, 1);
    nightmareBtn.setStrokeStyle(2, 0xff0000);
    nightmareBtn.setInteractive({ useHandCursor: true });
    const nightmareText = this.add.text(150, 40, 'NIGHTMARE', { fontFamily: 'monospace', fontSize: '24px', color: '#ff0000' }).setOrigin(0.5);

    const startGame = (diff: 'NORMAL' | 'NIGHTMARE') => {
      this.difficulty = diff;
      container.destroy();
      this.isPaused = false;
      
      this.showHowToPlay(width, height);
      this.isGracePeriod = true;
      this.time.delayedCall(6000, () => {
        this.isGracePeriod = false;
        this.showLevelTitle();
      });
    };

    normalBtn.on('pointerdown', () => startGame('NORMAL'));
    normalBtn.on('pointerover', () => normalBtn.setFillStyle(0x00ffff, 0.2));
    normalBtn.on('pointerout', () => normalBtn.setFillStyle(0x000000, 1));

    nightmareBtn.on('pointerdown', () => startGame('NIGHTMARE'));
    nightmareBtn.on('pointerover', () => nightmareBtn.setFillStyle(0xff0000, 0.2));
    nightmareBtn.on('pointerout', () => nightmareBtn.setFillStyle(0x000000, 1));

    container.add([bg, title, normalBtn, normalText, nightmareBtn, nightmareText]);
  }`;

content = content.replace(createEnd, createEndNew);

// 3. Modifiers in spawnEnemy
const spawnEnemyOriginal = `    if ((this.currentLevel === 9 || this.currentLevel === 10) && this.enemyCounter % 15 === 0) {
      type = 'dragon-boss';
      health = 300;
      damage = 30;
      points = 1000;
      width = 300;
      height = 300;
    } else if (this.enemyCounter % 20 === 0) {
      type = 'cow';
      health = Math.floor(50 * levelFactor);
      damage = 20;
      points = 200;
      width = 95;
      height = 95;
    } else if (this.enemyCounter % 5 === 0) {
      type = 'pig';
      health = Math.floor(30 * levelFactor);
      damage = 20;
      points = 50;
      width = 80;
      height = 80;
    }

    const y = Phaser.Math.Between(50, this.sys.canvas.height - 50);
    const x = this.sys.canvas.width + 50;
    const enemy = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

    if (enemy) {
      enemy.enableBody(true, x, y, true, true);
      enemy.setTexture(type);
      enemy.setDisplaySize(width, height);
      enemy.setAlpha(0.8);
      enemy.setData('isBoss', false);

      // Sync collision body to display size
      enemy.body?.setSize(enemy.width, enemy.height);

      enemy.setData('health', health);
      enemy.setData('maxHealth', health);
      enemy.setData('damage', damage);
      enemy.setData('points', points);

      enemy.setVelocityX(Phaser.Math.Between(-150, -300));
      enemy.setData('nextShot', this.time.now + Phaser.Math.Between(1000, 3000));
    }`;

const spawnEnemyNew = `    if ((this.currentLevel === 9 || this.currentLevel === 10) && this.enemyCounter % 15 === 0) {
      type = 'dragon-boss';
      health = 300;
      damage = 30;
      points = 1000;
      width = 300;
      height = 300;
    } else if (this.enemyCounter % 20 === 0) {
      type = 'cow';
      health = Math.floor(50 * levelFactor);
      damage = 20;
      points = 200;
      width = 95;
      height = 95;
    } else if (this.enemyCounter % 5 === 0) {
      type = 'pig';
      health = Math.floor(30 * levelFactor);
      damage = 20;
      points = 50;
      width = 80;
      height = 80;
    }

    if (this.difficulty === 'NIGHTMARE') {
      health *= 2;
      damage *= 2;
    }

    const numSpawns = this.difficulty === 'NIGHTMARE' ? (type === 'chicken' ? 2 : 3) : 1;

    for (let i = 0; i < numSpawns; i++) {
      const y = Phaser.Math.Between(50, this.sys.canvas.height - 50);
      const x = this.sys.canvas.width + 50 + (i * 80);
      const enemy = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (enemy) {
        enemy.enableBody(true, x, y, true, true);
        enemy.setTexture(type);
        enemy.setDisplaySize(width, height);
        enemy.setAlpha(0.8);
        enemy.setData('isBoss', false);

        // Sync collision body to display size
        enemy.body?.setSize(enemy.width, enemy.height);

        enemy.setData('health', health);
        enemy.setData('maxHealth', health);
        enemy.setData('damage', damage);
        enemy.setData('points', points);

        enemy.setVelocityX(Phaser.Math.Between(-150, -300));
        enemy.setData('nextShot', this.time.now + Phaser.Math.Between(1000, 3000));
      }
    }`;

content = content.replace(spawnEnemyOriginal, spawnEnemyNew);

// 4. Modifiers in spawnBoss
const spawnBossOriginal = `    const numBosses = Phaser.Math.Between(2, 3);
    for (let i = 0; i < numBosses; i++) {
      const y = (this.sys.canvas.height / (numBosses + 1)) * (i + 1);
      const x = this.sys.canvas.width + 200 + (i * 100);
      const boss = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (boss) {
        boss.enableBody(true, x, y, true, true);
        boss.setTexture('dragon-boss');
        // Scale down slightly to fit multiple bosses on screen
        boss.setDisplaySize(200, 200);
        boss.setAlpha(1);
        boss.setData('isBoss', true);

        const bossBody = boss.body as Phaser.Physics.Arcade.Body;
        bossBody.setSize(boss.width, boss.height);
        bossBody.setImmovable(true); // Can't be pushed by projectiles

        boss.setData('health', 300);
        boss.setData('maxHealth', 300);
        boss.setData('damage', 30);
        boss.setData('points', 1000);

        boss.setVelocityX(-100);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));
      }
    }`;

const spawnBossNew = `    let numBosses = Phaser.Math.Between(2, 3);
    if (this.difficulty === 'NIGHTMARE') {
      numBosses *= 3;
    }

    for (let i = 0; i < numBosses; i++) {
      // Create a grid layout for large number of bosses
      const cols = Math.ceil(numBosses / 3);
      const row = i % 3;
      const col = Math.floor(i / 3);

      const y = (this.sys.canvas.height / 4) * (row + 1);
      const x = this.sys.canvas.width + 200 + (col * 150);
      const boss = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (boss) {
        boss.enableBody(true, x, y, true, true);
        boss.setTexture('dragon-boss');
        // Scale down slightly to fit multiple bosses on screen
        boss.setDisplaySize(200, 200);
        boss.setAlpha(1);
        boss.setData('isBoss', true);

        const bossBody = boss.body as Phaser.Physics.Arcade.Body;
        bossBody.setSize(boss.width, boss.height);
        bossBody.setImmovable(true); // Can't be pushed by projectiles

        let h = 300;
        let d = 30;
        if (this.difficulty === 'NIGHTMARE') {
          h *= 2;
          d *= 2;
        }

        boss.setData('health', h);
        boss.setData('maxHealth', h);
        boss.setData('damage', d);
        boss.setData('points', 1000);

        boss.setVelocityX(-100);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));
      }
    }`;

content = content.replace(spawnBossOriginal, spawnBossNew);

// 5. Modifiers in spawnEnemyBullet
const spawnEnemyBulletOriginal = `    if (isBoss) {
      shoot(-400, -100);
      shoot(-400, 0);
      shoot(-400, 100);
    } else {
      shoot(-400, 0);
    }`;

const spawnEnemyBulletNew = `    if (this.difficulty === 'NIGHTMARE') {
      if (isBoss) {
        for (let i = -4; i <= 4; i++) {
          shoot(-400, i * 40);
        }
      } else {
        shoot(-400, -80);
        shoot(-400, 0);
        shoot(-400, 80);
      }
    } else {
      if (isBoss) {
        shoot(-400, -100);
        shoot(-400, 0);
        shoot(-400, 100);
      } else {
        shoot(-400, 0);
      }
    }`;

content = content.replace(spawnEnemyBulletOriginal, spawnEnemyBulletNew);

fs.writeFileSync(filePath, content);
console.log("Patched Nightmare mode!");
