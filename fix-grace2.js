const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The one in create() is preceded by `g.destroy();\n\n    this.showLevelTitle();\n  }`
content = content.replace(
    "g.destroy();\n\n    this.showLevelTitle();\n  }",
    "g.destroy();\n\n    this.isGracePeriod = true;\n    this.time.delayedCall(6000, () => {\n      this.isGracePeriod = false;\n      this.showLevelTitle();\n    });\n  }"
);

fs.writeFileSync(filePath, content);
console.log("Fixed MainScene.ts!");
