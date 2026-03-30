const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

code = code.replace(
  `        enemy.setVelocityX(Phaser.Math.Between(-150, -300));
        enemy.setData('nextShot', this.time.now + Phaser.Math.Between(1000, 3000));`,
  `        enemy.setVelocityX(Phaser.Math.Between(-150, -300));
        // Give 50% of the normal enemies a vertical velocity so they enter and move diagonally
        if (Math.random() < 0.5) {
          // Exclude near-zero vertical velocities for a more distinct diagonal path
          const vy = Phaser.Math.Between(50, 150);
          enemy.setVelocityY(Math.random() < 0.5 ? vy : -vy);
        } else {
          enemy.setVelocityY(0);
        }
        
        enemy.setData('nextShot', this.time.now + Phaser.Math.Between(1000, 3000));`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
