const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'game', 'scenes', 'MainScene.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add properties
content = content.replace(
    "private fireballLevel: number = 1;",
    "private fireballLevel: number = 1;\n  private missileLevel: number = 1;\n  private missileUpgrades!: Phaser.Physics.Arcade.Group;"
);

// 2. Add preload
content = content.replace(
    "this.load.svg('missile', 'missile.svg', { width: 40, height: 20 });",
    "this.load.svg('missile_lv1', 'missile_lv1.svg', { width: 40, height: 20 });\n    this.load.svg('missile_lv2', 'missile_lv2.svg', { width: 60, height: 30 });\n    this.load.svg('missile_lv3', 'missile_lv3.svg', { width: 80, height: 40 });\n    this.load.svg('missile_upgrade', 'missile_upgrade.svg', { width: 30, height: 30 });"
);

// 3. Create group
content = content.replace(
    "this.weaponUpgrades = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1 });",
    "this.weaponUpgrades = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1 });\n    this.missileUpgrades = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1 });"
);

// 4. Reset missileLevel
content = content.replace(
    "this.fireballLevel = 1;",
    "this.fireballLevel = 1;\n      this.missileLevel = 1;"
);

// 5. Physics overlap
content = content.replace(
    "this.physics.add.overlap(this.dragon, this.weaponUpgrades, this.handleWeaponUpgradePickup as any, undefined, this);",
    "this.physics.add.overlap(this.dragon, this.weaponUpgrades, this.handleWeaponUpgradePickup as any, undefined, this);\n    this.physics.add.overlap(this.dragon, this.missileUpgrades, this.handleMissileUpgradePickup as any, undefined, this);"
);

// 6. takeDamage logic
content = content.replace(
    "if (this.fireballLevel > 1) {\n      this.fireballLevel--;\n    }",
    "if (this.fireballLevel > 1) {\n      this.fireballLevel--;\n    }\n    if (this.missileLevel > 1) {\n      this.missileLevel--;\n    }"
);

// 7. fireMissile logic
content = content.replace(
    "missile.setTexture('missile');\n        missile.setDisplaySize(40, 20);\n        missile.body?.setSize(30, 15);",
    "const tex = this.missileLevel === 1 ? 'missile_lv1' : (this.missileLevel === 2 ? 'missile_lv2' : 'missile_lv3');\n        const w = this.missileLevel === 1 ? 40 : (this.missileLevel === 2 ? 60 : 80);\n        const h = this.missileLevel === 1 ? 20 : (this.missileLevel === 2 ? 30 : 40);\n        missile.setTexture(tex);\n        missile.setDisplaySize(w, h);\n        missile.body?.setSize(w * 0.75, h * 0.75);\n        missile.setData('damage', 30 * this.missileLevel);"
);

// 8. handleMissileHit
content = content.replace(
    "this.damageEnemy(enemy, 30);",
    "const damage = missile.getData('damage') || 30;\n    this.damageEnemy(enemy, damage);"
);

// 9. Handle Missile Pickup
content = content.replace(
    "handleWeaponUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {\n    upgrade.disableBody(true, true);\n    if (this.fireballLevel < 3) {\n      this.fireballLevel++;\n    }\n    // Visual feedback\n    this.dragon.setTint(0x00ffff);\n    this.time.delayedCall(200, () => this.dragon.clearTint());\n  }",
    "handleWeaponUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {\n    upgrade.disableBody(true, true);\n    if (this.fireballLevel < 3) {\n      this.fireballLevel++;\n    }\n    // Visual feedback\n    this.dragon.setTint(0x00ffff);\n    this.time.delayedCall(200, () => this.dragon.clearTint());\n  }\n\n  handleMissileUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {\n    upgrade.disableBody(true, true);\n    if (this.missileLevel < 3) {\n      this.missileLevel++;\n    }\n    // Visual feedback\n    this.dragon.setTint(0xff8800);\n    this.time.delayedCall(200, () => this.dragon.clearTint());\n  }"
);

// 10. killEnemy drops
content = content.replace(
    "if (rand < 0.05) {\n      this.spawnPowerUp(enemy.x, enemy.y, 'weapon_upgrade');\n    } else if (rand < 0.15) {",
    "if (rand < 0.04) {\n      this.spawnPowerUp(enemy.x, enemy.y, 'weapon_upgrade');\n    } else if (rand < 0.08) {\n      this.spawnPowerUp(enemy.x, enemy.y, 'missile_upgrade');\n    } else if (rand < 0.18) {"
);

// 11. spawnPowerUp
content = content.replace(
    "const group = key === 'weapon_upgrade' ? this.weaponUpgrades : this.healthPacks;",
    "let group = this.healthPacks;\n    if (key === 'weapon_upgrade') group = this.weaponUpgrades;\n    if (key === 'missile_upgrade') group = this.missileUpgrades;"
);

// 12. Cleanup
content = content.replace(
    "cleanOffscreen(this.weaponUpgrades, -50, false);",
    "cleanOffscreen(this.weaponUpgrades, -50, false);\n    cleanOffscreen(this.missileUpgrades, -50, false);"
);

fs.writeFileSync(filePath, content);
console.log("Patched MainScene.ts!");
