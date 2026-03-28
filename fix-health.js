const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

const original = `    if (this.health >= this.maxHealth) {
      if (this.maxHealth < 200) {
        this.maxHealth += 10;
        this.health = this.maxHealth;
      }
    } else {
      this.health = Math.min(this.maxHealth, this.health + 20);
    }`;

const fixed = `    this.health = Math.min(this.maxHealth, this.health + 20);`;

content = content.replace(original, fixed);

fs.writeFileSync(filePath, content);
console.log("Patched MainScene.ts!");
