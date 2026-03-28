const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isGracePeriod property
content = content.replace(
    "private isPaused: boolean = false;",
    "private isGracePeriod: boolean = false;\n  private isPaused: boolean = false;"
);

// 2. Replace this.showLevelTitle() in create(), but ONLY the one at the end of create!
// A better way is to find "// How to Play Overlay"
content = content.replace(
    "// How to Play Overlay\n    this.showHowToPlay(width, height);\n    this.showLevelTitle();",
    "// How to Play Overlay\n    this.showHowToPlay(width, height);\n    this.isGracePeriod = true;\n    this.time.delayedCall(6000, () => {\n      this.isGracePeriod = false;\n      this.showLevelTitle();\n    });"
);

// 3. Update spawn logic in update()
content = content.replace(
    "if (time > this.lastEnemySpawn && !this.isBossLevel && this.currentLevel < 10) {",
    "if (time > this.lastEnemySpawn && !this.isBossLevel && this.currentLevel < 10 && !this.isGracePeriod) {"
);

content = content.replace(
    "if (time > this.lastBuildingSpawn && !this.isBossLevel && this.currentLevel < 10) {",
    "if (time > this.lastBuildingSpawn && !this.isBossLevel && this.currentLevel < 10 && !this.isGracePeriod) {"
);

fs.writeFileSync(filePath, content);
console.log("Fixed MainScene.ts!");
