const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add preload
content = content.replace(
    "this.load.image('cow', 'cow.png');",
    "this.load.image('cow', 'cow.png');\n    this.load.image('dragon-boss', 'dragon-boss.png');"
);

// 2. Add dragon-boss to spawnEnemy
content = content.replace(
    "const levelFactor = 1 + (this.videosWatched * 0.2);\n    health = Math.floor(health * levelFactor);\n\n    if (this.enemyCounter % 20 === 0) {",
    "const levelFactor = 1 + (this.videosWatched * 0.2);\n    health = Math.floor(health * levelFactor);\n\n    if ((this.currentLevel === 9 || this.currentLevel === 10) && this.enemyCounter % 15 === 0) {\n      type = 'dragon-boss';\n      health = 300;\n      damage = 30;\n      points = 1000;\n      width = 300;\n      height = 300;\n    } else if (this.enemyCounter % 20 === 0) {"
);

// 3. Change cow to dragon-boss in spawnBoss
content = content.replace(
    "boss.setTexture('cow');",
    "boss.setTexture('dragon-boss');"
);

// 4. Make dragon-boss shoot 3 bullets in update
content = content.replace(
    "const isBoss = sprite.getData('isBoss');\n\n            if (isBoss) {",
    "const isBoss = sprite.getData('isBoss');\n            const isDragonBoss = sprite.texture.key === 'dragon-boss';\n\n            if (isBoss) {"
);

content = content.replace(
    "this.spawnEnemyBullet(sprite.x, sprite.y, isBoss);\n                const shotDelay = isBoss ? 1000 : Phaser.Math.Between(2000, 5000);",
    "this.spawnEnemyBullet(sprite.x, sprite.y, isBoss || isDragonBoss);\n                const shotDelay = (isBoss || isDragonBoss) ? 1000 : Phaser.Math.Between(2000, 5000);"
);

fs.writeFileSync(filePath, content);
console.log("Patched successfully!");
