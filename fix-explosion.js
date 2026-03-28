const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add property
content = content.replace(
    "private killSfx!: Phaser.Sound.BaseSound;",
    "private killSfx!: Phaser.Sound.BaseSound;\n  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;"
);

// 2. Generate texture and create emitter in create()
// Let's insert it right after the rain/snow particles
const particleSetupOriginal = `this.lightningOverlay = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0)
      .setDepth(5000).setScrollFactor(0);

    // Sync weather to environment state on each transition
    this.applyWeatherForState();`;

const particleSetupNew = `this.lightningOverlay = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0)
      .setDepth(5000).setScrollFactor(0);

    // Sync weather to environment state on each transition
    this.applyWeatherForState();

    // Explosion Particle Setup
    const spark = this.add.graphics();
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(4, 4, 4);
    spark.generateTexture('spark', 8, 8);
    spark.destroy();

    this.explosionEmitter = this.add.particles(0, 0, 'spark', {
      lifespan: { min: 300, max: 600 },
      speed: { min: 100, max: 300 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff0000, 0xff8800, 0xffff00],
      blendMode: 'ADD',
      emitting: false
    });
    this.explosionEmitter.setDepth(2000);`;

content = content.replace(particleSetupOriginal, particleSetupNew);

// 3. Trigger explosion in killEnemy
const killEnemyOriginal = `  killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    this.killSfx.play();
    const points = enemy.getData('points') || 10;
    enemy.disableBody(true, true);`;

const killEnemyNew = `  killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    this.killSfx.play();
    
    // Trigger explosion particles
    this.explosionEmitter.explode(20, enemy.x, enemy.y);

    const points = enemy.getData('points') || 10;
    enemy.disableBody(true, true);`;

content = content.replace(killEnemyOriginal, killEnemyNew);

fs.writeFileSync(filePath, content);
console.log("Patched Explosion!");
