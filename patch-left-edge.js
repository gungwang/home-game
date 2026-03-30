const fs = require('fs');
let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

const targetOld = `              // Left edge bounce
              if (sprite.x <= margin) {
                sprite.x = margin;
                if (sprite.body && sprite.body.velocity.x < 0) {
                  sprite.setVelocityX(Math.abs(sprite.body.velocity.x) || 100);
                }
              }`;

code = code.replace(targetOld, `              // Left edge cleanup: once they cross the left, they're gone.
              if (sprite.x <= -150) {
                sprite.disableBody(true, true);
              }`);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
