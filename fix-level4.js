const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fireball Level 4 logic
const fireballOriginal = `    if (this.fireballLevel === 1) {
      fire(this.dragon.x + 20, this.dragon.y);
    } else if (this.fireballLevel === 2) {
      fire(this.dragon.x + 20, this.dragon.y - 10);
      fire(this.dragon.x + 20, this.dragon.y + 10);
    } else {
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
    }`;

const fireballFixed = `    if (this.fireballLevel === 1) {
      fire(this.dragon.x + 20, this.dragon.y);
    } else if (this.fireballLevel === 2) {
      fire(this.dragon.x + 20, this.dragon.y - 10);
      fire(this.dragon.x + 20, this.dragon.y + 10);
    } else if (this.fireballLevel === 3) {
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
    } else {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    }`;
content = content.replace(fireballOriginal, fireballFixed);

// 2. Weapon Pickup Limit
content = content.replace(
    "if (this.fireballLevel < 3) {",
    "if (this.fireballLevel < 4) {"
);

// 3. Missile Pickup Limit
content = content.replace(
    "if (this.missileLevel < 3) {",
    "if (this.missileLevel < 4) {"
);

// 4. Missile Preload
content = content.replace(
    "this.load.svg('missile_lv3', 'missile_lv3.svg', { width: 80, height: 40 });",
    "this.load.svg('missile_lv3', 'missile_lv3.svg', { width: 80, height: 40 });\n    this.load.svg('missile_lv4', 'missile_lv4.svg', { width: 100, height: 50 });"
);

// 5. fireMissile logic
const missileOriginal = `        const tex = this.missileLevel === 1 ? 'missile_lv1' : (this.missileLevel === 2 ? 'missile_lv2' : 'missile_lv3');
        const w = this.missileLevel === 1 ? 40 : (this.missileLevel === 2 ? 60 : 80);
        const h = this.missileLevel === 1 ? 20 : (this.missileLevel === 2 ? 30 : 40);`;

const missileFixed = `        const tex = 'missile_lv' + this.missileLevel;
        const w = 40 + (this.missileLevel - 1) * 20;
        const h = 20 + (this.missileLevel - 1) * 10;`;

content = content.replace(missileOriginal, missileFixed);

fs.writeFileSync(filePath, content);
console.log("Patched Level 4!");
