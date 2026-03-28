const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

const levelColors = `const LEVEL_COLORS = [
  0x0a1020, // 1: Dark Blue
  0x200505, // 2: Dark Red
  0x052005, // 3: Dark Green
  0x201000, // 4: Dark Orange
  0x150520, // 5: Dark Purple
  0x052020, // 6: Dark Cyan
  0x1a0a00, // 7: Dark Brown
  0x101510, // 8: Dark Slate
  0x151515, // 9: Dark Gray
  0x250000  // 10: Deep Red / Black
];\n\n`;

content = content.replace("const ENV_STYLES:", levelColors + "const ENV_STYLES:");

const bgLiberty = `    this.sky = this.add.tileSprite(width / 2, height / 2, width, height, 'sky');

    // Constant Far-Away Statue of Liberty
    const farLiberty = this.add.image(width * 0.8, height * 0.6, 'statue_of_liberty');
    farLiberty.setDisplaySize(80, 160); // Small, far away
    farLiberty.setAlpha(0.15); // Faded into the distance
    farLiberty.setScrollFactor(0); // Always visible in background
    farLiberty.setDepth(-2.5); // Between sky and farBuildings
    `;

content = content.replace(
    "    this.sky = this.add.tileSprite(width / 2, height / 2, width, height, 'sky');",
    bgLiberty
);

const envStyleOrig = `  applyEnvironmentStyle() {
    const style = ENV_STYLES[this.currentEnvState];
    this.sky.setTint(style.sky);`;

const envStyleNew = `  applyEnvironmentStyle() {
    const style = ENV_STYLES[this.currentEnvState];
    const levelSkyColor = LEVEL_COLORS[Math.min(this.currentLevel - 1, 9)];
    this.sky.setTint(levelSkyColor);`;

content = content.replace(envStyleOrig, envStyleNew);

fs.writeFileSync(filePath, content);
console.log("Patched background colors and Statue of Liberty!");
