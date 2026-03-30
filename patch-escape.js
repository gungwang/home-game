const fs = require('fs');
let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

const targetOld = `    // Enemy shooting and movement logic
    this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x < this.sys.canvas.width && sprite.x > 0) {
            const nextShot = sprite.getData('nextShot');
            const isBoss = sprite.getData('isBoss');
            const isDragonBoss = sprite.texture.key === 'dragon-boss';

            if (isBoss) {
              // Clamp boss to visible area so it can never escape
              const minX = this.sys.canvas.width * 0.5;
              const maxX = this.sys.canvas.width * 0.85;
              if (sprite.x <= minX) {
                sprite.x = minX;
                sprite.setVelocityX(0);
              } else if (sprite.x >= maxX) {
                sprite.x = maxX;
                sprite.setVelocityX(-100);
              } else if (sprite.x < maxX) {
                sprite.setVelocityX(0);
              }
            }

            if (time > nextShot) {
                this.spawnEnemyBullet(sprite.x, sprite.y, isBoss || isDragonBoss);
                const shotDelay = (isBoss || isDragonBoss) ? 1000 : Phaser.Math.Between(2000, 5000);
                sprite.setData('nextShot', time + shotDelay);
            }
        }
        if (sprite.active && sprite.x < -150) {
            // Never remove the boss offscreen — it must be defeated
            if (!sprite.getData('isBoss')) {
              sprite.disableBody(true, true);
            }
        }
        return true;
    });`;

const newCode = `    // Enemy shooting and movement logic
    this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active) {
            const isBoss = sprite.getData('isBoss');
            const isDragonBoss = sprite.texture.key === 'dragon-boss';
            const w = this.sys.canvas.width;
            const h = this.sys.canvas.height;
            const margin = 30;

            if (isBoss) {
              // Clamp boss to visible area so it can never escape
              const minX = w * 0.5;
              const maxX = w * 0.85;
              if (sprite.x <= minX) {
                sprite.x = minX;
                sprite.setVelocityX(0);
              } else if (sprite.x >= maxX) {
                sprite.x = maxX;
                sprite.setVelocityX(-100);
              } else if (sprite.x < maxX) {
                sprite.setVelocityX(0);
              }
            } else {
              // Normal enemies bouncing off edges so they never escape
              if (sprite.getData('hasEnteredScreen')) {
                // Right edge bounce
                if (sprite.x >= w - margin) {
                  sprite.x = w - margin;
                  if (sprite.body && sprite.body.velocity.x > 0) {
                    sprite.setVelocityX(-Math.abs(sprite.body.velocity.x));
                  }
                }
              } else if (sprite.x < w) {
                sprite.setData('hasEnteredScreen', true);
              }

              // Left edge bounce
              if (sprite.x <= margin) {
                sprite.x = margin;
                if (sprite.body && sprite.body.velocity.x < 0) {
                  sprite.setVelocityX(Math.abs(sprite.body.velocity.x) || 100);
                }
              }

              // Top edge bounce
              if (sprite.y <= margin) {
                sprite.y = margin;
                if (sprite.body && sprite.body.velocity.y < 0) {
                  sprite.setVelocityY(Math.abs(sprite.body.velocity.y) || 100);
                }
              }

              // Bottom edge bounce
              if (sprite.y >= h - margin) {
                sprite.y = h - margin;
                if (sprite.body && sprite.body.velocity.y > 0) {
                  sprite.setVelocityY(-Math.abs(sprite.body.velocity.y) || -100);
                }
              }
            }

            // Shooting logic
            if (sprite.x < w && sprite.x > 0) {
                const nextShot = sprite.getData('nextShot');
                if (time > nextShot) {
                    this.spawnEnemyBullet(sprite.x, sprite.y, isBoss || isDragonBoss);
                    const shotDelay = (isBoss || isDragonBoss) ? 1000 : Phaser.Math.Between(2000, 5000);
                    sprite.setData('nextShot', time + shotDelay);
                }
            }
        }
        return true;
    });`;

if(code.includes(targetOld)) {
  code = code.replace(targetOld, newCode);
  fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
  console.log("Patched successfully");
} else {
  console.log("Could not find targetOld");
}
