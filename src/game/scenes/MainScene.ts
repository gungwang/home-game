import Phaser from 'phaser';
import { GameEvents } from '../GameEvents';

export default class MainScene extends Phaser.Scene {
  private dragon!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private missiles!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  
  private missileAmmo: number = 3;
  private score: number = 0;
  private health: number = 100;
  
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
  private youtubeVideos = ["2DXfUDiIcsY","4xTJ3BPCtMc","6ju5NziYYlc","-84Hc6ywY04","9yACrRUsQoo","bzHm7JM0MI4","C9HIAUHqU7A","CSxMRjyvnPU","DFY_w8XmWfY","ESA07F5rQLk","Fp7opQZ39ds","gGXxE9OYIaM","GlTyyTUjLv0","gq9Fz6H9zE0","hV4maRZYX6M","iEky-ldyPnU","JdwTJsRHodc","JTdhuyB_0fE","jX1TbV26XDc","lePl30G1DUA","lXQWSiJQTvM","qd_9ksHVApQ","rtdpDahE3Lw","S_8-Le7xdns","SAZuBkHg_mU","TS2GDGR__48","ugXdVO8Bb9o","vqLaAxZy14A","vRplaUoD1S0","WxyZaNN6xQ8","xv8599zXFvQ","zGKjoTmyNRU","zoKfzZ25htA","zOSVBpr3hB0","ZYqST2YHOHs"];

  private videosWatched: number = 0;
  private bgmStarted: boolean = false;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // placeholders
  }

  create() {
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;

    // Background Textures
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

    // Entity Textures
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
    
    const enemyBulletGraphics = this.add.graphics();
    enemyBulletGraphics.fillStyle(0xffeb3b, 1);
    enemyBulletGraphics.fillCircle(5, 5, 5);
    enemyBulletGraphics.generateTexture('enemyBullet', 10, 10);
    enemyBulletGraphics.destroy();

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

    // Init Player
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

    // Init Groups
    this.fireballs = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1, runChildUpdate: true });
    this.missiles = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1, runChildUpdate: true });
    this.enemyBullets = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1, runChildUpdate: true });
    this.enemies = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1, runChildUpdate: true });
    this.ammoCrates = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1, runChildUpdate: true });
    
    this.buildings = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, allowGravity: false, immovable: true });
    this.screenBuildings = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, allowGravity: false, immovable: true });

    // Clean up any lingering listeners
    GameEvents.off('video-complete');
    
    const onVideoComplete = () => {
      // Ensure the scene hasn't been destroyed before attempting to resume
      if (!this.sys || !this.scene || !this.scene.manager) return;
      
      this.isPaused = false;
      this.scene.resume();
      GameEvents.emit('bgm-play'); // Resume BGM
      
      this.score += 50; 
      GameEvents.emit('score-changed', this.score);
      this.screenBuildings.clear(true, true);
      
      this.videosWatched++;
      if (this.videosWatched >= 3) {
        GameEvents.emit('game-over');
      }
    };
    
    GameEvents.on('video-complete', onVideoComplete);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => GameEvents.off('video-complete', onVideoComplete));
    this.events.on(Phaser.Scenes.Events.DESTROY, () => GameEvents.off('video-complete', onVideoComplete));

    // Collisions
    this.physics.add.collider(this.fireballs, this.enemies, this.handleFireballHit as any, undefined, this);
    this.physics.add.collider(this.missiles, this.enemies, this.handleMissileHit as any, undefined, this);
    this.physics.add.collider(this.dragon, this.enemies, this.handlePlayerHit as any, undefined, this);
    this.physics.add.overlap(this.dragon, this.ammoCrates, this.handleAmmoPickup as any, undefined, this);
    this.physics.add.collider(this.dragon, this.buildings, this.handleBuildingHit as any, undefined, this);
    this.physics.add.collider(this.dragon, this.enemyBullets, this.handleEnemyBulletHit as any, undefined, this);

    // Attacks & BGM
    const startBgm = () => {
      if (!this.bgmStarted) {
        this.bgmStarted = true;
        GameEvents.emit('bgm-play');
      }
    };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startBgm();
      if (pointer.rightButtonDown()) {
        this.fireMissile();
      } else {
        this.fireFireball();
      }
    });

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', startBgm);
    }

    this.input.mouse?.disableContextMenu();
    
    GameEvents.emit('ammo-changed', this.missileAmmo);
    GameEvents.emit('health-changed', this.health);
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      GameEvents.emit('game-over');
    }
    GameEvents.emit('health-changed', this.health);
    
    this.dragon.setTint(0xff0000);
    this.time.delayedCall(100, () => this.dragon.clearTint());
  }

  fireFireball() {
    const fireball = this.fireballs.get(this.dragon.x + 20, this.dragon.y) as Phaser.Physics.Arcade.Sprite | null;
    if (fireball) {
      fireball.enableBody(true, this.dragon.x + 20, this.dragon.y, true, true);
      fireball.setTexture('fireball');
      fireball.body?.setSize(15, 5);
      if (!fireball.body) this.physics.add.existing(fireball);
      fireball.setVelocityX(600);
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
        missile.enableBody(true, this.dragon.x + 20, this.dragon.y, true, true);
        missile.setTexture('missile');
        missile.body?.setSize(25, 10);
        if (!missile.body) this.physics.add.existing(missile);
        missile.setVelocityX(400);
      }
    }
  }

  handleFireballHit(fireball: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    fireball.disableBody(true, true);
    this.killEnemy(enemy);
  }

  handleMissileHit(missile: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    missile.disableBody(true, true);
    this.killEnemy(enemy);
  }

  handlePlayerHit(_dragon: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    enemy.disableBody(true, true);
    this.takeDamage(20); // Massive damage for body hit
  }

  handleEnemyBulletHit(_dragon: Phaser.Physics.Arcade.Sprite, bullet: Phaser.Physics.Arcade.Sprite) {
    bullet.disableBody(true, true);
    this.takeDamage(10); // Standard damage for bullet hit
  }

  handleBuildingHit(_dragon: Phaser.Physics.Arcade.Sprite, _building: Phaser.Physics.Arcade.Sprite) {
    this.takeDamage(5); // Bump damage
  }

  handleAmmoPickup(_dragon: Phaser.Physics.Arcade.Sprite, crate: Phaser.Physics.Arcade.Sprite) {
    crate.disableBody(true, true);
    this.missileAmmo += 3;
    GameEvents.emit('ammo-changed', this.missileAmmo);
  }

  killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    enemy.disableBody(true, true);
    this.score += 10;
    GameEvents.emit('score-changed', this.score);
    
    if (Math.random() < 0.2) {
      this.spawnAmmoCrate(enemy.x, enemy.y);
    }
  }

  spawnAmmoCrate(x: number, y: number) {
    const crate = this.ammoCrates.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (crate) {
      crate.enableBody(true, x, y, true, true);
      crate.setTexture('ammoCrate');
      if (!crate.body) this.physics.add.existing(crate);
      crate.setVelocityX(-100);
    }
  }

  spawnEnemy() {
    const y = Phaser.Math.Between(50, this.sys.canvas.height - 50);
    const x = this.sys.canvas.width + 50;
    const enemy = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    
    if (enemy) {
      enemy.enableBody(true, x, y, true, true);
      enemy.setTexture('enemy');
      if (!enemy.body) this.physics.add.existing(enemy);
      enemy.setVelocityX(Phaser.Math.Between(-150, -300));
      // Store next shot time
      enemy.setData('nextShot', this.time.now + Phaser.Math.Between(1000, 3000));
    }
  }

  spawnEnemyBullet(x: number, y: number) {
    const bullet = this.enemyBullets.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (bullet) {
      bullet.enableBody(true, x, y, true, true);
      bullet.setTexture('enemyBullet');
      if (!bullet.body) this.physics.add.existing(bullet);
      bullet.body?.setSize(10, 10);
      bullet.setVelocityX(-400); // Shoot left
    }
  }

  spawnBuilding() {
    const bottomHeight = Phaser.Math.Between(100, this.sys.canvas.height - 100);
    const x = this.sys.canvas.width + 50;

    // Only spawn the bottom building as requested
    const y = this.sys.canvas.height - bottomHeight / 2;
    const bottomBuilding = this.buildings.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (bottomBuilding) {
      bottomBuilding.enableBody(true, x, y, true, true);
      bottomBuilding.setTexture('buildingTexture');
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
      screenBuilding.enableBody(true, x, y, true, true);
      screenBuilding.setTexture('screenBuilding');
      if (!screenBuilding.body) this.physics.add.existing(screenBuilding);
      (screenBuilding.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      screenBuilding.setVelocityX(-100);
      screenBuilding.setDepth(-1); 
    }
  }

  update(time: number, _delta: number) {
    if (this.isPaused) return;

    this.distanceTraveled += 1;
    
    if (this.distanceTraveled > this.checkpointThreshold) {
       this.distanceTraveled = 0; 
       this.spawnCheckpoint();
    }

    // Checkpoint interaction
    this.screenBuildings.children.each((sb) => {
      const sprite = sb as Phaser.Physics.Arcade.Sprite;
      if (sprite.active && sprite.x <= this.sys.canvas.width / 2) {
        sprite.setVelocityX(0);
        this.isPaused = true;
        this.dragon.setVelocity(0);
        
        const randomVideoId = this.youtubeVideos[Phaser.Math.Between(0, this.youtubeVideos.length - 1)];
        this.scene.pause();
        GameEvents.emit('bgm-stop');
        GameEvents.emit('show-video', randomVideoId);
      }
      return true;
    });

    // Parallax scrolling
    this.sky.tilePositionX += 0.5;
    this.farBuildings.tilePositionX += 1;
    this.nearBuildings.tilePositionX += 2;

    // Movement
    const speed = 400;
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

    // Enemy shooting logic
    this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.x < this.sys.canvas.width && sprite.x > 0) {
            const nextShot = sprite.getData('nextShot');
            if (time > nextShot) {
                this.spawnEnemyBullet(sprite.x, sprite.y);
                sprite.setData('nextShot', time + Phaser.Math.Between(2000, 5000));
            }
        }
        if (sprite.active && sprite.x < -50) {
            sprite.disableBody(true, true);
        }
        return true;
    });

    // Cleanups
    const cleanOffscreen = (group: Phaser.Physics.Arcade.Group, boundary: number, checkRight: boolean = false) => {
      group.children.each((item) => {
          const sprite = item as Phaser.Physics.Arcade.Sprite;
          if (sprite.active) {
              if (checkRight ? sprite.x > boundary : sprite.x < boundary) {
                  sprite.disableBody(true, true);
              }
          }
          return true;
      });
    }

    cleanOffscreen(this.fireballs, this.sys.canvas.width + 50, true);
    cleanOffscreen(this.missiles, this.sys.canvas.width + 50, true);
    cleanOffscreen(this.enemyBullets, -50, false);
    cleanOffscreen(this.ammoCrates, -50, false);
    cleanOffscreen(this.buildings, -100, false);
  }
}