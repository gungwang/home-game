const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `    if (health <= 0) {
      this.killEnemy(enemy);
    } else {
      if (!enemy.getData('hasBeenHit') && !enemy.getData('isBoss')) {
        enemy.setData('hasBeenHit', true);
        const reaction = Phaser.Math.Between(0, 5);
        const currentVx = enemy.body?.velocity.x || -200;

        switch (reaction) {
          case 0: // escape quickly
            enemy.setVelocityX(currentVx * 1.5);
            break;
          case 1: // move slightly up
            enemy.setVelocityY(-100);
            break;
          case 2: // move slightly down
            enemy.setVelocityY(100);
            break;
          case 3: // move toward upper-left
            enemy.setVelocityX(currentVx * 1.2);
            enemy.setVelocityY(-150);
            break;
          case 4: // move toward lower-left
            enemy.setVelocityX(currentVx * 1.2);
            enemy.setVelocityY(150);
            break;
          case 5: // move forward without changing direction
            break;
        }
      }
    }`;

content = content.replace(
    `    if (health <= 0) {\n      this.killEnemy(enemy);\n    }`,
    replacement
);

fs.writeFileSync(filePath, content);
console.log("Patched MainScene.ts!");
