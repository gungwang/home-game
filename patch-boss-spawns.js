const fs = require('fs');
let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

code = code.replace(
  `      type = 'dragon-boss';
      health = 300;
      damage = 30;`,
  `      type = 'dragon-boss';
      health = 3000;
      damage = 30;`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
