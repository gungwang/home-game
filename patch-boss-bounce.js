const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

const oldLogic = `            if (isBoss) {
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

              // Left edge cleanup: once they cross the left, they're gone.
              if (sprite.x <= -150) {
                sprite.disableBody(true, true);
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
            }`;

const newLogic = `            if (isBoss) {
              // Clamp boss to visible area horizontally
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
              // Normal enemies bouncing off horizontal edges
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

              // Left edge cleanup: once they cross the left, they're gone.
              if (sprite.x <= -150) {
                sprite.disableBody(true, true);
              }
            }

            // Top edge bounce for ALL enemies
            if (sprite.y <= margin) {
              sprite.y = margin;
              if (sprite.body && sprite.body.velocity.y < 0) {
                sprite.setVelocityY(Math.abs(sprite.body.velocity.y) || 100);
              }
            }

            // Bottom edge bounce for ALL enemies
            if (sprite.y >= h - margin) {
              sprite.y = h - margin;
              if (sprite.body && sprite.body.velocity.y > 0) {
                sprite.setVelocityY(-Math.abs(sprite.body.velocity.y) || -100);
              }
            }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
  console.log("Boundary logic patched.");
} else {
  console.log("Could not find old boundary logic.");
}
