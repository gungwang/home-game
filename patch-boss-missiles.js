const fs = require('fs');

let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

// 1. Cap missile ammo to 30
code = code.replace(
  `handleAmmoPickup(_dragon: Phaser.Physics.Arcade.Sprite, crate: Phaser.Physics.Arcade.Sprite) {
    crate.disableBody(true, true);
    this.missileAmmo += 3;
    GameEvents.emit('ammo-changed', this.missileAmmo);
  }`,
  `handleAmmoPickup(_dragon: Phaser.Physics.Arcade.Sprite, crate: Phaser.Physics.Arcade.Sprite) {
    crate.disableBody(true, true);
    this.missileAmmo = Math.min(30, this.missileAmmo + 3);
    GameEvents.emit('ammo-changed', this.missileAmmo);
  }`
);

// 2. Increase final boss health to 3000 (10x of 300)
code = code.replace(
  `        let h = 300;
        let d = 30;
        if (this.difficulty === 'NIGHTMARE') {
          h *= 2;
          d *= 2;
        }`,
  `        let h = 3000;
        let d = 30;
        if (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') {
          h *= 2;
          d *= 2;
        }`
);

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
