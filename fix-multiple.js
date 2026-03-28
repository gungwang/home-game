const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. handleHealthPickup
const healthOriginal = `  handleHealthPickup(_dragon: Phaser.Physics.Arcade.Sprite, pack: Phaser.Physics.Arcade.Sprite) {
    pack.disableBody(true, true);

    this.health = Math.min(this.maxHealth, this.health + 20);

    GameEvents.emit('health-changed', this.health);
    // Visual feedback for pickup
    this.dragon.setTint(0x00ff00);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }`;

const healthFixed = `  handleHealthPickup(_dragon: Phaser.Physics.Arcade.Sprite, pack: Phaser.Physics.Arcade.Sprite) {
    pack.disableBody(true, true);

    if (this.health >= this.maxHealth) {
      this.score += 50;
      GameEvents.emit('score-changed', this.score);
    } else {
      this.health = Math.min(this.maxHealth, this.health + 20);
      GameEvents.emit('health-changed', this.health);
    }

    // Visual feedback for pickup
    this.dragon.setTint(0x00ff00);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }`;

content = content.replace(healthOriginal, healthFixed);


// 2. handleWeaponUpgradePickup
const weaponOriginal = `  handleWeaponUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {
    upgrade.disableBody(true, true);
    if (this.fireballLevel < 3) {
      this.fireballLevel++;
    }
    // Visual feedback
    this.dragon.setTint(0x00ffff);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }`;

const weaponFixed = `  handleWeaponUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {
    upgrade.disableBody(true, true);
    if (this.fireballLevel < 3) {
      this.fireballLevel++;
    } else {
      this.score += 50;
      GameEvents.emit('score-changed', this.score);
    }
    // Visual feedback
    this.dragon.setTint(0x00ffff);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }`;

content = content.replace(weaponOriginal, weaponFixed);

// 3. handleMissileUpgradePickup
const missileOriginal = `  handleMissileUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {
    upgrade.disableBody(true, true);
    if (this.missileLevel < 3) {
      this.missileLevel++;
    }
    // Visual feedback
    this.dragon.setTint(0xff8800);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }`;

const missileFixed = `  handleMissileUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {
    upgrade.disableBody(true, true);
    if (this.missileLevel < 3) {
      this.missileLevel++;
    } else {
      this.score += 50;
      GameEvents.emit('score-changed', this.score);
    }
    // Visual feedback
    this.dragon.setTint(0xff8800);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }`;

content = content.replace(missileOriginal, missileFixed);

// 4. killEnemy boss logic
const killEnemyBoss = `    // Boss defeated — reset distance to trigger final checkpoint
    if (enemy.getData('isBoss')) {
      this.isBossLevel = false;
      // Reset distance traveled so checkpoint spawns soon after boss dies
      this.distanceTraveled = this.checkpointThreshold - 1000; 
      return;
    }`;

const killEnemyBossFixed = `    // Boss defeated — reset distance to trigger final checkpoint
    if (enemy.getData('isBoss')) {
      let activeBosses = 0;
      this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.getData('isBoss')) {
          activeBosses++;
        }
        return true;
      });

      if (activeBosses === 0) {
        this.isBossLevel = false;
        // Reset distance traveled so checkpoint spawns soon after boss dies
        this.distanceTraveled = this.checkpointThreshold - 1000; 
      }
      return;
    }`;

content = content.replace(killEnemyBoss, killEnemyBossFixed);


// 5. spawnBoss
const spawnBossOriginal = `  spawnBoss() {
    // Add Statue of Liberty in background as the final goal
    const liberty = this.add.image(this.sys.canvas.width + 400, this.sys.canvas.height - 200, 'statue_of_liberty');
    liberty.setDisplaySize(200, 400);
    liberty.setDepth(-2);
    this.tweens.add({
      targets: liberty,
      x: this.sys.canvas.width / 2,
      duration: 10000,
      ease: 'Linear'
    });

    const y = this.sys.canvas.height / 2;
    const x = this.sys.canvas.width + 200;
    const boss = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

    if (boss) {
      boss.enableBody(true, x, y, true, true);
      boss.setTexture('dragon-boss');
      boss.setDisplaySize(300, 300);
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
      boss.setData('nextShot', this.time.now + 1000);
    }
  }`;

const spawnBossFixed = `  spawnBoss() {
    // Add Statue of Liberty in background as the final goal
    const liberty = this.add.image(this.sys.canvas.width + 400, this.sys.canvas.height - 200, 'statue_of_liberty');
    liberty.setDisplaySize(200, 400);
    liberty.setDepth(-2);
    this.tweens.add({
      targets: liberty,
      x: this.sys.canvas.width / 2,
      duration: 10000,
      ease: 'Linear'
    });

    const numBosses = Phaser.Math.Between(2, 3);
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
    }
  }`;

content = content.replace(spawnBossOriginal, spawnBossFixed);


fs.writeFileSync(filePath, content);
console.log("Patched MainScene.ts!");
