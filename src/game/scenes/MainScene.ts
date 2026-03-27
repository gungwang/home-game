import Phaser from 'phaser';
import { GameEvents } from '../GameEvents';

export default class MainScene extends Phaser.Scene {
  private dragon!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private missiles!: Phaser.Physics.Arcade.Group;
  private missileAmmo: number = 3;
  private score: number = 0;
  private enemies!: Phaser.Physics.Arcade.Group;
  private ammoCrates!: Phaser.Physics.Arcade.Group;
  private buildings!: Phaser.Physics.Arcade.Group;
  private lastEnemySpawn: number = 0;
  private lastBuildingSpawn: number = 0;
  private sky!: Phaser.GameObjects.TileSprite;
  private farBuildings!: Phaser.GameObjects.TileSprite;
  private nearBuildings!: Phaser.GameObjects.TileSprite;

  private screenBuildings!: Phaser.Physics.Arcade.Group;
  private distanceTraveled: number = 0;
  private checkpointThreshold: number = 5000;
  private isPaused: boolean = false;
  private youtubeVideos = ['dQw4w9WgXcQ', 'jNQXAC9IVRw', 'M7lc1UVf-VE'];

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // placeholders
  }

  create() {
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;

    // Create textures for backgrounds
    const skyG = this.add.graphics();
    skyG.fillStyle(0x0a0a2a, 1);
    skyG.fillRect(0, 0, 100, height);
    skyG.generateTexture('sky', 100, height);
    skyG.destroy();

    const farG = this.add.graphics();
    farG.fillStyle(0x1a1a4a, 1);
    farG.fillRect(0, height - 200, 200, 200);
    farG.fillRect(200, height - 300, 100, 300);
    farG.generateTexture('farBg', 400, height);
    farG.destroy();

    const nearG = this.add.graphics();
    nearG.fillStyle(0x2a2a6a, 1);
    nearG.fillRect(0, height - 100, 150, 100);
    nearG.fillRect(150, height - 150, 100, 150);
    nearG.generateTexture('nearBg', 300, height);
    nearG.destroy();

    this.sky = this.add.tileSprite(width / 2, height / 2, width, height, 'sky');
    this.farBuildings = this.add.tileSprite(width / 2, height / 2, width, height, 'farBg');
    this.nearBuildings = this.add.tileSprite(width / 2, height / 2, width, height, 'nearBg');

    // Weather Particles (Rain)
    const rainG = this.add.graphics();
    rainG.fillStyle(0x00ffff, 0.5);
    rainG.fillRect(0, 0, 2, 10);
    rainG.generateTexture('rainParticle', 2, 10);
    rainG.destroy();

    this.add.particles(0, 0, 'rainParticle', {
      x: { min: 0, max: width },
      y: 0,
      lifespan: 1500,
      speedY: { min: 300, max: 500 },
      speedX: -100,
      scale: { start: 1, end: 0 },
      quantity: 2,
      blendMode: 'ADD'
    });

    this.add.text(10, 10, 'Dragon Game Loaded', { color: '#0f0' }).setDepth(100);

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

    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff00ff, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    const ammoCrateGraphics = this.add.graphics();
    ammoCrateGraphics.fillStyle(0x00ffff, 1);
    ammoCrateGraphics.fillRect(0, 0, 20, 20);
    ammoCrateGraphics.generateTexture('ammoCrate', 20, 20);
    ammoCrateGraphics.destroy();

    const buildingG = this.add.graphics();
    buildingG.fillStyle(0x333333, 1);
    buildingG.lineStyle(2, 0x00ffff, 1);
    buildingG.fillRect(0, 0, 80, 800);
    buildingG.strokeRect(0, 0, 80, 800);
    buildingG.generateTexture('buildingTexture', 80, 800);
    buildingG.destroy();

    const screenBuildingG = this.add.graphics();
    screenBuildingG.fillStyle(0x000000, 1);
    screenBuildingG.lineStyle(4, 0x00ff00, 1);
    screenBuildingG.fillRect(0, 0, 400, 800);
    screenBuildingG.strokeRect(0, 0, 400, 800);
    screenBuildingG.generateTexture('screenBuilding', 400, 800);
    screenBuildingG.destroy();

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

    this.enemies = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: -1,
      runChildUpdate: true
    });

    this.ammoCrates = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: -1,
      runChildUpdate: true
    });

    this.buildings = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      allowGravity: false,
      immovable: true
    });

    this.screenBuildings = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      allowGravity: false,
      immovable: true
    });

    // Event listener for returning from video
    GameEvents.on('video-complete', () => {
      this.isPaused = false;
      this.scene.resume();
      this.score += 50; // reward for watching video
      GameEvents.emit('score-changed', this.score);
      // Clean up the checkpoint building
      this.screenBuildings.clear(true, true);
    });

    // Collisions
    this.physics.add.collider(this.fireballs, this.enemies, this.handleFireballHit as any, undefined, this);
    this.physics.add.collider(this.missiles, this.enemies, this.handleMissileHit as any, undefined, this);
    this.physics.add.collider(this.dragon, this.enemies, this.handlePlayerHit as any, undefined, this);
    this.physics.add.overlap(this.dragon, this.ammoCrates, this.handleAmmoPickup as any, undefined, this);
    this.physics.add.collider(this.dragon, this.buildings, this.handleBuildingHit as any, undefined, this);

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

  handleFireballHit(fireball: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    fireball.setActive(false);
    fireball.setVisible(false);
    
    // Simple 1 hit kill for now
    this.killEnemy(enemy);
  }

  handleMissileHit(missile: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    missile.setActive(false);
    missile.setVisible(false);
    
    // Missiles can have AOE later, for now just kill
    this.killEnemy(enemy);
  }

  handlePlayerHit(dragon: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    // Player takes damage, flash red
    dragon.setTint(0xff0000);
    this.time.delayedCall(100, () => dragon.clearTint());
    
    enemy.setActive(false);
    enemy.setVisible(false);
  }

  handleAmmoPickup(_dragon: Phaser.Physics.Arcade.Sprite, crate: Phaser.Physics.Arcade.Sprite) {
    crate.setActive(false);
    crate.setVisible(false);
    
    this.missileAmmo += 3;
    GameEvents.emit('ammo-changed', this.missileAmmo);
  }

  killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    enemy.setActive(false);
    enemy.setVisible(false);
    
    this.score += 10;
    GameEvents.emit('score-changed', this.score);
    
    // 20% chance to drop ammo
    if (Math.random() < 0.2) {
      this.spawnAmmoCrate(enemy.x, enemy.y);
    }
  }

  spawnAmmoCrate(x: number, y: number) {
    const crate = this.ammoCrates.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (crate) {
      crate.setActive(true);
      crate.setVisible(true);
      crate.setTexture('ammoCrate');
      
      if (!crate.body) {
        this.physics.add.existing(crate);
      }
      
      crate.setVelocityX(-100); // moves left slowly
    }
  }

  spawnEnemy() {
    const y = Phaser.Math.Between(50, this.sys.canvas.height - 50);
    const x = this.sys.canvas.width + 50;
    
    const enemy = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      enemy.setTexture('enemy');
      
      if (!enemy.body) {
        this.physics.add.existing(enemy);
      }
      
      enemy.setVelocityX(Phaser.Math.Between(-150, -300));
    }
  }

  handleBuildingHit(dragon: Phaser.Physics.Arcade.Sprite, _building: Phaser.Physics.Arcade.Sprite) {
    // Player hit a building, take damage or bounce
    dragon.setTint(0xff0000);
    this.time.delayedCall(100, () => dragon.clearTint());
  }

  spawnBuilding() {
    const gapSize = 150;
    const gapPosition = Phaser.Math.Between(100, this.sys.canvas.height - gapSize - 100);
    const x = this.sys.canvas.width + 50;

    // Top building
    const topBuilding = this.buildings.get(x, gapPosition / 2) as Phaser.Physics.Arcade.Sprite | null;
    if (topBuilding) {
      topBuilding.setActive(true).setVisible(true).setTexture('buildingTexture');
      if (!topBuilding.body) this.physics.add.existing(topBuilding);
      topBuilding.body?.setSize(80, gapPosition);
      topBuilding.setDisplaySize(80, gapPosition);
      (topBuilding.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      topBuilding.setVelocityX(-100);
    }

    // Bottom building
    const bottomHeight = this.sys.canvas.height - gapPosition - gapSize;
    const bottomBuilding = this.buildings.get(x, gapPosition + gapSize + bottomHeight / 2) as Phaser.Physics.Arcade.Sprite | null;
    if (bottomBuilding) {
      bottomBuilding.setActive(true).setVisible(true).setTexture('buildingTexture');
      if (!bottomBuilding.body) this.physics.add.existing(bottomBuilding);
      bottomBuilding.body?.setSize(80, bottomHeight);
      bottomBuilding.setDisplaySize(80, bottomHeight);
      (bottomBuilding.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      bottomBuilding.setVelocityX(-100);
    }
  }

  spawnCheckpoint() {
    const x = this.sys.canvas.width + 200;
    const y = this.sys.canvas.height / 2;
    const screenBuilding = this.screenBuildings.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (screenBuilding) {
      screenBuilding.setActive(true).setVisible(true).setTexture('screenBuilding');
      if (!screenBuilding.body) this.physics.add.existing(screenBuilding);
      (screenBuilding.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      screenBuilding.setVelocityX(-100);
      screenBuilding.setDepth(-1); // Behind dragon
    }
  }

  update(time: number, _delta: number) {
    if (this.isPaused) return;

    // Advance distance
    this.distanceTraveled += 1;
    
    // Check for checkpoint spawn
    if (this.distanceTraveled > this.checkpointThreshold) {
       this.distanceTraveled = 0; // reset
       this.spawnCheckpoint();
    }

    // Check if checkpoint building reached center
    this.screenBuildings.children.each((sb) => {
      const sprite = sb as Phaser.Physics.Arcade.Sprite;
      if (sprite.active && sprite.x <= this.sys.canvas.width / 2) {
        sprite.setVelocityX(0); // stop it
        this.isPaused = true;
        this.dragon.setVelocity(0); // stop dragon
        
        // Pick random video
        const randomVideoId = this.youtubeVideos[Phaser.Math.Between(0, this.youtubeVideos.length - 1)];
        
        // Pause scene and show modal
        this.scene.pause();
        GameEvents.emit('show-video', randomVideoId);
      }
      return true;
    });

    // Parallax scrolling
    this.sky.tilePositionX += 0.5;
    this.farBuildings.tilePositionX += 1;
    this.nearBuildings.tilePositionX += 2;

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

    if (time > this.lastEnemySpawn) {
        this.spawnEnemy();
        this.lastEnemySpawn = time + Phaser.Math.Between(1000, 3000);
    }

    if (time > this.lastBuildingSpawn) {
        this.spawnBuilding();
        this.lastBuildingSpawn = time + Phaser.Math.Between(3000, 6000);
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

    this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x < -50) {
            sprite.setActive(false);
            sprite.setVisible(false);
        }
        return true;
    });

    this.ammoCrates.children.each((a) => {
        const sprite = a as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x < -50) {
            sprite.setActive(false);
            sprite.setVisible(false);
        }
        return true;
    });

    this.buildings.children.each((b) => {
        const sprite = b as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x < -100) {
            sprite.setActive(false);
            sprite.setVisible(false);
        }
        return true;
    });
  }
}