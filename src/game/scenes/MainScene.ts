import Phaser from 'phaser';
import { GameEvents } from '../GameEvents';

export default class MainScene extends Phaser.Scene {
  private dragon!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private missiles!: Phaser.Physics.Arcade.Group;
  private missileAmmo: number = 3;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // placeholders
  }

  create() {
    this.add.text(10, 10, 'Dragon Game Loaded', { color: '#0f0' });

    // Dragon sprite placeholder (a simple colored rect mapped to a texture)
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('dragon', 40, 40);
    graphics.destroy();

    const fireballGraphics = this.add.graphics();
    fireballGraphics.fillStyle(0xffa500, 1);
    fireballGraphics.fillRect(0, 0, 15, 5);
    fireballGraphics.generateTexture('fireball', 15, 5);
    fireballGraphics.destroy();

    const missileGraphics = this.add.graphics();
    missileGraphics.fillStyle(0xff0000, 1);
    missileGraphics.fillRect(0, 0, 25, 10);
    missileGraphics.generateTexture('missile', 25, 10);
    missileGraphics.destroy();

    this.dragon = this.physics.add.sprite(100, 300, 'dragon');
    this.dragon.setCollideWorldBounds(true);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      // Add WASD keys
      (this.cursors as any).W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      (this.cursors as any).A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      (this.cursors as any).S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      (this.cursors as any).D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    this.fireballs = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: -1,
      runChildUpdate: true
    });

    this.missiles = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: -1,
      runChildUpdate: true
    });

    // Attacks
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireMissile();
      } else {
        this.fireFireball();
      }
    });

    // Prevent default context menu on right click
    this.input.mouse?.disableContextMenu();
    
    // Initial emit
    GameEvents.emit('ammo-changed', this.missileAmmo);
  }

  fireFireball() {
    const fireball = this.fireballs.get(this.dragon.x + 20, this.dragon.y) as Phaser.Physics.Arcade.Sprite | null;
    if (fireball) {
      fireball.setActive(true);
      fireball.setVisible(true);
      fireball.setTexture('fireball');
      fireball.body?.setSize(15, 5);
      
      // We need to enable physics body explicitly if it was recycled
      if (!fireball.body) {
          this.physics.add.existing(fireball);
      }
      
      fireball.setVelocityX(600);
      
      // Auto destroy when out of bounds
      fireball.setCollideWorldBounds(false);
      fireball.setDepth(10);
    }
  }

  fireMissile() {
    if (this.missileAmmo > 0) {
      this.missileAmmo--;
      GameEvents.emit('ammo-changed', this.missileAmmo);
      
      const missile = this.missiles.get(this.dragon.x + 20, this.dragon.y) as Phaser.Physics.Arcade.Sprite | null;
      if (missile) {
        missile.setActive(true);
        missile.setVisible(true);
        missile.setTexture('missile');
        missile.body?.setSize(25, 10);
        
        if (!missile.body) {
            this.physics.add.existing(missile);
        }
        
        missile.setVelocityX(400);
      }
    }
  }

  update() {
    // Movement
    const speed = 300;
    this.dragon.setVelocity(0);

    if (this.cursors.left?.isDown || (this.cursors as any).A?.isDown) {
      this.dragon.setVelocityX(-speed);
    } else if (this.cursors.right?.isDown || (this.cursors as any).D?.isDown) {
      this.dragon.setVelocityX(speed);
    }

    if (this.cursors.up?.isDown || (this.cursors as any).W?.isDown) {
      this.dragon.setVelocityY(-speed);
    } else if (this.cursors.down?.isDown || (this.cursors as any).S?.isDown) {
      this.dragon.setVelocityY(speed);
    }

    // Cleanup offscreen projectiles
    this.fireballs.children.each((fb) => {
        const sprite = fb as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x > this.sys.canvas.width) {
            sprite.setActive(false);
            sprite.setVisible(false);
        }
        return true;
    });
    
    this.missiles.children.each((m) => {
        const sprite = m as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x > this.sys.canvas.width) {
            sprite.setActive(false);
            sprite.setVisible(false);
        }
        return true;
    });
  }
}