const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

code = code.replace(
  `let damage = fireball.getData('damage') || 10;
    if (this.difficulty === 'NIGHTMARE') damage *= 3;`,
  `let damage = fireball.getData('damage') || 10;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 2;
    }`
);

code = code.replace(
  `let damage = missile.getData('damage') || 30;
    if (this.difficulty === 'NIGHTMARE') damage *= 3;`,
  `let damage = missile.getData('damage') || 30;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 2;
    }`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
