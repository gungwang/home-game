const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

// Replace fireball damage logic for HARD mode
code = code.replace(
  `let damage = fireball.getData('damage') || 10;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 2;
    }`,
  `let damage = fireball.getData('damage') || 10;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 0.75;
    }`
);

// Replace missile damage logic for HARD mode
code = code.replace(
  `let damage = missile.getData('damage') || 30;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 2;
    }`,
  `let damage = missile.getData('damage') || 30;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 0.75;
    }`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
console.log("Weapon damage reduced for Hard mode.");
