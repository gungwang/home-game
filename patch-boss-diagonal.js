const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

code = code.replace(
  `        boss.setVelocityX(-100);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));`,
  `        boss.setVelocityX(-100);
        const vy = Phaser.Math.Between(30, 80);
        boss.setVelocityY(Math.random() < 0.5 ? vy : -vy);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));`
);

// We want to replace it globally since there are 2 occurrences (spawnSmallDragonBoss and spawnBoss)
code = code.replace(
  `        boss.setVelocityX(-100);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));`,
  `        boss.setVelocityX(-100);
        const vy = Phaser.Math.Between(30, 80);
        boss.setVelocityY(Math.random() < 0.5 ? vy : -vy);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
console.log("Boss diagonal applied.");
