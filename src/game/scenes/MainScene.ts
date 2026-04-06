import Phaser from 'phaser';
import { GameEvents } from '../GameEvents';

type EnvState = 'DAY' | 'SUNSET' | 'NIGHT' | 'SUNRISE';

const BASE_LEVEL_COLORS = [
  0x173256, // 1: Deep Blue
  0x3a1927, // 2: Deep Red
  0x173a2c, // 3: Deep Green
  0x43301a, // 4: Deep Orange
  0x26183e, // 5: Deep Purple
  0x143947, // 6: Deep Cyan
  0x3a2613, // 7: Deep Brown
  0x1a2933, // 8: Deep Slate
  0x242a35, // 9: Deep Gray
  0x351116  // 10: Nightmare Red
];
const LEVEL_COLORS = [...BASE_LEVEL_COLORS, ...BASE_LEVEL_COLORS];


const FAR_BACKDROP_KEYS = [
  'liberty-empire1',
  'liberty-empire2',
  'liberty-empire3',
  'liberty-empire4',
  'liberty-empire5'
] as const;

const ENV_STYLES: Record<EnvState, { sky: number; farTint: number; nearTint: number; backdropTint: number; backdropAlpha: number; cloudAlpha: number; darknessAlpha: number }> = {
  DAY: {
    sky: 0x2a4d78,
    farTint: 0x55739a,
    nearTint: 0x7190b2,
    backdropTint: 0xcbdff4,
    backdropAlpha: 0.42,
    cloudAlpha: 0.18,
    darknessAlpha: 0.14
  },
  SUNSET: {
    sky: 0x5b2430,
    farTint: 0x7a4561,
    nearTint: 0xa26479,
    backdropTint: 0xf1b79d,
    backdropAlpha: 0.38,
    cloudAlpha: 0.15,
    darknessAlpha: 0.22
  },
  NIGHT: {
    sky: 0x11254a,
    farTint: 0x2c4168,
    nearTint: 0x46608f,
    backdropTint: 0xb8d2f2,
    backdropAlpha: 0.34,
    cloudAlpha: 0.12,
    darknessAlpha: 0.32
  },
  SUNRISE: {
    sky: 0x3b4d7a,
    farTint: 0x5f73a0,
    nearTint: 0x8699c1,
    backdropTint: 0xf1d7be,
    backdropAlpha: 0.4,
    cloudAlpha: 0.16,
    darknessAlpha: 0.18
  }
};

interface LevelConfig {
  name: string;
  key: string;
  width: number;
  height: number;
  screenBox: { x: number; y: number; width: number; height: number };
}

const BASE_LEVELS: LevelConfig[] = [
  { name: "Central Park", key: "plaza_hotel", width: 200, height: 400, screenBox: { x: 0, y: -100, width: 160, height: 120 } },
  { name: "Midtown North", key: "chrysler", width: 100, height: 400, screenBox: { x: 0, y: 0, width: 80, height: 60 } },
  { name: "Midtown South", key: "empire_state", width: 100, height: 400, screenBox: { x: 0, y: 0, width: 80, height: 60 } },
  { name: "Chelsea & High Line", key: "vessel", width: 150, height: 200, screenBox: { x: 0, y: -50, width: 100, height: 75 } },
  { name: "Greenwich Village", key: "washington_arch", width: 200, height: 200, screenBox: { x: 0, y: -80, width: 120, height: 90 } },
  { name: "Lower East Side", key: "tenement", width: 200, height: 300, screenBox: { x: 0, y: -50, width: 160, height: 120 } },
  { name: "Tribeca & SoHo", key: "cast_iron", width: 200, height: 300, screenBox: { x: 0, y: -50, width: 160, height: 120 } },
  { name: "Brooklyn Bridge", key: "brooklyn_bridge", width: 200, height: 400, screenBox: { x: 0, y: -100, width: 120, height: 90 } },
  { name: "Financial District", key: "one_wtc", width: 150, height: 500, screenBox: { x: 0, y: -150, width: 100, height: 75 } },
  { name: "The Battery", key: "statue_of_liberty", width: 200, height: 400, screenBox: { x: 0, y: 100, width: 120, height: 90 } } // Screen on base
];
const LEVELS: LevelConfig[] = [...BASE_LEVELS, ...BASE_LEVELS];


export default class MainScene extends Phaser.Scene {
  private dragon!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private missiles!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  private currentLevel: number = 1;
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
  private distantBackdrop!: Phaser.GameObjects.Image;
  private levelBackdropKeys: string[] = [];
  private screenBuildings!: Phaser.Physics.Arcade.Group;

  private distanceTraveled: number = 0;
  private checkpointThreshold: number = 5000;
  private difficulty: 'NORMAL' | 'NIGHTMARE' | 'HARD' = 'NORMAL';
  
  private getMaxLevel(): number {
    return this.difficulty === 'HARD' ? 15 : 20;
  }
  private isGracePeriod: boolean = false;
  private isPaused: boolean = false;
  private youtubeVideos = ["4xTJ3BPCtMc","6ju5NziYYlc","9yACrRUsQoo","bzHm7JM0MI4","C9HIAUHqU7A","CSxMRjyvnPU","ESA07F5rQLk","Fp7opQZ39ds","gGXxE9OYIaM","jX1TbV26XDc","S_8-Le7xdns","8-7IZHG9j9o","weoN33Pgyt0","jFt1MWRLfDE","ftdu02JcehE","hcDVTZ7Yr-c","2xwlT2jZ-54","Vrjrvn7xDAU","8swwfMPsCDs","tzOBHFtvuZQ","oH8jJzG2hWI","i4hiaF8DeIA","dgYyBjXStJg","ApG9sE2V2V8","UfPrGFGf1Lc","Gky7LKSD70s","QSKb8XeKqHQ","f8I7YJQNuuY","w1wsycotDyA","dadf2IOIAc4","9mj9WdTuoJQ","e3S4kYhffO0","j7Bfo5HZQeg","OGR0xWjnwOM","p3epfAB-nA4","Sn-S1wt-mfo","d4OLMD78bGQ","wCw5rilQuH0","fxsYMN5ynUM","jWz5V5jWk0w","XpMECNQKjZA","Xerm3_L5l5M","3qFtJbyQ33Q","0pZ_NL3y24E","QpVm4Mf88H8","LZt_RsAwr4Q","mQa409RqQqI","TMR-IeW8xmU","4rUtjtvMkrc","QbzNvpOTG24","GQqf2psk-Bw","EVIeaEKhvKQ","fDkfD0gBHE4","3PWQBT5AScE","2DXfUDiIcsY",];

  private videosWatched: number = 0;
  private bgmStarted: boolean = false;
  private enemyCounter: number = 0;
  private isBossLevel: boolean = false;
  private tvs!: Phaser.GameObjects.Group;
  private landmarksGroup!: Phaser.GameObjects.Group;
  private fireballSfx!: Phaser.Sound.BaseSound;
  private killSfx!: Phaser.Sound.BaseSound;
  private explosionEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Upgrade & Health Properties
  private fireballLevel: number = 1;
  private missileLevel: number = 1;
  private missileUpgrades!: Phaser.Physics.Arcade.Group;
  private maxHealth: number = 100;
  private weaponUpgrades!: Phaser.Physics.Arcade.Group;
  private healthPacks!: Phaser.Physics.Arcade.Group;

  // Environmental Properties
  private envCycleTimer: number = 0;
  private currentEnvState: EnvState = 'DAY';
  private weatherEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private cloudsGroup!: Phaser.GameObjects.Group;
  private darknessOverlay!: Phaser.GameObjects.Rectangle;
  private sunGlow!: Phaser.GameObjects.Ellipse;
  private lightningOverlay!: Phaser.GameObjects.Rectangle;
  private lastLightningTime: number = 0;
  private lastDamageTime: number = 0;
  private readonly DAMAGE_COOLDOWN: number = 500; // ms invincibility after taking damage
  private prevEnvState: EnvState = 'DAY';

  // Mobile touch input state
  private touchDirections: Set<string> = new Set();
  private touchFireballHandler!: () => void;
  private touchMissileHandler!: () => void;
  private touchDirectionHandler!: (dirs: string[]) => void;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('dragon', 'dragon.png');
    this.load.image('chicken', 'chicken.png');
    this.load.image('pig', 'pig.png');
    this.load.image('cow', 'cow.png');
    this.load.image('dragon-boss', 'dragon-boss.png');
    this.load.image('tv', 'tv.png');
    FAR_BACKDROP_KEYS.forEach((key) => {
      this.load.image(key, `${key}.png`);
    });
    this.load.svg('fireball', 'fireball.svg', { width: 40, height: 40 });
    this.load.svg('missile_lv1', 'missile_lv1.svg', { width: 40, height: 20 });
    this.load.svg('missile_lv2', 'missile_lv2.svg', { width: 60, height: 30 });
    this.load.svg('missile_lv3', 'missile_lv3.svg', { width: 80, height: 40 });
    this.load.svg('missile_lv4', 'missile_lv4.svg', { width: 100, height: 50 });
    this.load.svg('missile_upgrade', 'missile_upgrade.svg', { width: 30, height: 30 });
    this.load.svg('ammoCrate', 'ammoCrate.svg', { width: 30, height: 30 });

    // NYC Buildings & Landmarks
    LEVELS.forEach(level => {
      this.load.svg(level.key, `${level.key}.svg`, { width: level.width, height: level.height });
    });

    this.load.svg('skyscraper_blue', 'skyscraper_blue.svg', { width: 80, height: 400 });
    this.load.svg('skyscraper_pink', 'skyscraper_pink.svg', { width: 80, height: 400 });
    this.load.svg('city_far', 'city_far.svg', { width: 800, height: 400 });
    this.load.svg('city_near', 'city_near.svg', { width: 800, height: 400 });
    this.load.svg('cloud', 'cloud.svg', { width: 200, height: 100 });
    this.load.svg('snow_particle', 'snow_particle.svg', { width: 10, height: 10 });
    this.load.svg('weapon_upgrade', 'weapon_upgrade.svg', { width: 30, height: 30 });
    this.load.svg('health_pack', 'health_pack.svg', { width: 30, height: 30 });

    // Audio SFX (Using WAV for lower latency and better sync)
    this.load.audio('fireballSfx', 'fireball.wav');
    this.load.audio('killSfx', 'kill.wav');
  }

  create() {
    // Initialize sound effects to reduce play() overhead
    this.fireballSfx = this.sound.add('fireballSfx', { volume: 0.1 });
    this.killSfx = this.sound.add('killSfx', { volume: 0.1 });

    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;

    // Background Layer: Deep Space/Sky
    const skyG = this.add.graphics();
    skyG.fillStyle(0x182040, 1);
    skyG.fillRect(0, 0, 100, height);
    skyG.generateTexture('sky', 100, height);
    skyG.destroy();

    this.sky = this.add.tileSprite(width / 2, height / 2, width, height, 'sky');
    this.sky.setDepth(-30);

    this.levelBackdropKeys = Array.from({ length: LEVELS.length }, () =>
      Phaser.Utils.Array.GetRandom([...FAR_BACKDROP_KEYS])
    );

    this.distantBackdrop = this.add.image(width / 2, height / 2, this.levelBackdropKeys[0]);
    this.layoutBackdrop();
    this.distantBackdrop.setAlpha(0.34);
    this.distantBackdrop.setTint(0xb8d2f2);
    this.distantBackdrop.setScrollFactor(0);
    this.distantBackdrop.setDepth(-22);

    // Distant City Layer
    this.farBuildings = this.add.tileSprite(width / 2, height - 200, width, 400, 'city_far');
    this.farBuildings.setAlpha(0.72);
  this.farBuildings.setDepth(-12);

    // Near City Layer
    this.nearBuildings = this.add.tileSprite(width / 2, height - 100, width, 400, 'city_near');
    this.nearBuildings.setAlpha(0.9);
  this.nearBuildings.setDepth(-8);

    // Robust global darkening layer so the world never becomes washed out.
    this.darknessOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(4000)
      .setScrollFactor(0);

    // Apply dark palette immediately to avoid a bright first frame.
    this.applyEnvironmentStyle();

    // Weather & Atmosphere Initialization
    this.cloudsGroup = this.add.group();

    // Rain texture
    const rainG = this.add.graphics();
    rainG.fillStyle(0x00ffff, 0.5);
    rainG.fillRect(0, 0, 2, 10);
    rainG.generateTexture('rainParticle', 2, 10);
    rainG.destroy();

    // Snow texture (small white dot)
    const snowG = this.add.graphics();
    snowG.fillStyle(0xffffff, 0.8);
    snowG.fillCircle(3, 3, 3);
    snowG.generateTexture('snowDot', 6, 6);
    snowG.destroy();

    this.weatherEmitter = this.add.particles(0, 0, 'rainParticle', {
      x: { min: 0, max: width },
      y: -10,
      lifespan: 2000,
      speedY: { min: 200, max: 400 },
      speedX: -80,
      scale: { start: 0.8, end: 0 },
      quantity: 0,
      blendMode: 'ADD',
      frequency: 50
    });

    // Sun / moon glow for sunrise & sunset
    this.sunGlow = this.add.ellipse(0, height * 0.4, 120, 120, 0xff6622, 0)
      .setDepth(0.5).setBlendMode('ADD');

    this.lightningOverlay = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0)
      .setDepth(5000).setScrollFactor(0);

    // Sync weather to environment state on each transition
    this.applyWeatherForState();

    // Explosion Particle Setup
    const spark = this.add.graphics();
    spark.fillStyle(0xffffff, 1);
    spark.fillCircle(4, 4, 4);
    spark.generateTexture('spark', 8, 8);
    spark.destroy();

    this.explosionEmitter = this.add.particles(0, 0, 'spark', {
      lifespan: { min: 300, max: 600 },
      speed: { min: 100, max: 300 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xff0000, 0xff8800, 0xffff00],
      blendMode: 'ADD',
      emitting: false
    });
    this.explosionEmitter.setDepth(2000);

    // Bullet Textures (Remaining placeholders)
    const enemyBulletGraphics = this.add.graphics();
    enemyBulletGraphics.fillStyle(0xffeb3b, 1);
    enemyBulletGraphics.fillCircle(5, 5, 5);
    enemyBulletGraphics.generateTexture('enemyBullet', 10, 10);
    enemyBulletGraphics.destroy();

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
    this.dragon.setDisplaySize(100, 40);
    this.dragon.body?.setSize(60, 30); // Tighter collision box for the dragon body

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
    this.tvs = this.add.group();

    this.weaponUpgrades = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1 });
    this.missileUpgrades = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1 });
    this.healthPacks = this.physics.add.group({ classType: Phaser.Physics.Arcade.Sprite, maxSize: -1 });

    // Clean up any lingering listeners
    GameEvents.off('video-complete');

    const onVideoComplete = (watchedSeconds: number = 0) => {
      // Ensure the scene hasn't been destroyed before attempting to resume
      if (!this.sys || !this.scene || !this.scene.manager) return;

      this.isPaused = false;
      this.scene.resume();
      GameEvents.emit('bgm-play'); // Resume BGM

      const timeBonus = watchedSeconds * 2;
      this.score += (50 + timeBonus);
      GameEvents.emit('score-changed', this.score);
      this.screenBuildings.clear(true, true);
      this.tvs.clear(true, true);
      if (this.landmarksGroup) this.landmarksGroup.clear(true, true);

      this.videosWatched++;

      if (this.currentLevel === this.getMaxLevel()) {
         // Video for final level finished -> Game Over (Victory!)
         this.triggerGameOver();
         return;
      }

      this.currentLevel++;
      this.updateBackdropForLevel();
      this.showLevelTitle();

      if (this.currentLevel % 5 === 0) {
        this.isBossLevel = true;
        const smallCount = this.currentLevel / 5;
        this.spawnSmallDragonBoss(smallCount);
        if (this.currentLevel === this.getMaxLevel()) {
          this.spawnBoss(2);
        }
      }
    };
    GameEvents.on('video-complete', onVideoComplete);
    const onRestartGame = () => {
      this.score = 0;
      this.health = 100;
      this.maxHealth = 100;
      this.fireballLevel = 1;
      this.missileLevel = 1;
      this.missileAmmo = 3;
      this.currentLevel = 1;
      this.videosWatched = 0;
      this.distanceTraveled = 0;
      this.isPaused = false;
      this.bgmStarted = false;
      this.isBossLevel = false;
      this.scene.restart();
    };
    GameEvents.on('restart-game', onRestartGame);

    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      GameEvents.off('video-complete', onVideoComplete);
      GameEvents.off('restart-game', onRestartGame);
      GameEvents.off('touch-direction', this.touchDirectionHandler);
      GameEvents.off('touch-fireball', this.touchFireballHandler);
      GameEvents.off('touch-missile', this.touchMissileHandler);
    });
    this.events.on(Phaser.Scenes.Events.DESTROY, () => {
      GameEvents.off('video-complete', onVideoComplete);
      GameEvents.off('restart-game', onRestartGame);
      GameEvents.off('touch-direction', this.touchDirectionHandler);
      GameEvents.off('touch-fireball', this.touchFireballHandler);
      GameEvents.off('touch-missile', this.touchMissileHandler);
    });

    // Collisions
    this.physics.add.collider(this.fireballs, this.enemies, this.handleFireballHit as any, undefined, this);
    this.physics.add.collider(this.missiles, this.enemies, this.handleMissileHit as any, undefined, this);
    this.physics.add.collider(this.dragon, this.enemies, this.handlePlayerHit as any, undefined, this);
    this.physics.add.overlap(this.dragon, this.ammoCrates, this.handleAmmoPickup as any, undefined, this);
    this.physics.add.overlap(this.dragon, this.weaponUpgrades, this.handleWeaponUpgradePickup as any, undefined, this);
    this.physics.add.overlap(this.dragon, this.missileUpgrades, this.handleMissileUpgradePickup as any, undefined, this);
    this.physics.add.overlap(this.dragon, this.healthPacks, this.handleHealthPickup as any, undefined, this);
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

    // Mobile touch control listeners
    this.touchDirectionHandler = (dirs: string[]) => {
      this.touchDirections = new Set(dirs);
    };
    this.touchFireballHandler = () => {
      startBgm();
      this.fireFireball();
    };
    this.touchMissileHandler = () => {
      startBgm();
      this.fireMissile();
    };
    GameEvents.on('touch-direction', this.touchDirectionHandler);
    GameEvents.on('touch-fireball', this.touchFireballHandler);
    GameEvents.on('touch-missile', this.touchMissileHandler);

    // Generate hologram texture for screens
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.5);
    g.lineStyle(2, 0x00ff00, 1);
    g.fillRect(0,0, 100, 100);
    g.strokeRect(0,0,100,100);
    g.generateTexture('hologramScreen', 100, 100);
    g.destroy();

    this.showDifficultySelection(width, height);
  }

  showDifficultySelection(width: number, height: number) {
    this.isPaused = true;

    const container = this.add.container(width / 2, height / 2).setDepth(5000).setScrollFactor(0);

    const bg = this.add.rectangle(0, 0, 800, 300, 0x000000, 0.9);
    bg.setStrokeStyle(4, 0xff00ff);

    const title = this.add.text(0, -80, 'SELECT DIFFICULTY', {
      fontFamily: 'monospace',
      fontSize: '40px',
      color: '#00ffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const normalBtn = this.add.rectangle(-250, 40, 200, 60, 0x000000, 1);
    normalBtn.setStrokeStyle(2, 0x00ffff);
    normalBtn.setInteractive({ useHandCursor: true });
    const normalText = this.add.text(-250, 40, 'NORMAL', { fontFamily: 'monospace', fontSize: '24px', color: '#00ffff' }).setOrigin(0.5);

    const hardBtn = this.add.rectangle(0, 40, 200, 60, 0x000000, 1);
    hardBtn.setStrokeStyle(2, 0xffaa00);
    hardBtn.setInteractive({ useHandCursor: true });
    const hardText = this.add.text(0, 40, 'HARD', { fontFamily: 'monospace', fontSize: '24px', color: '#ffaa00' }).setOrigin(0.5);

    const nightmareBtn = this.add.rectangle(250, 40, 200, 60, 0x000000, 1);
    nightmareBtn.setStrokeStyle(2, 0xff0000);
    nightmareBtn.setInteractive({ useHandCursor: true });
    const nightmareText = this.add.text(250, 40, 'NIGHTMARE', { fontFamily: 'monospace', fontSize: '24px', color: '#ff0000' }).setOrigin(0.5);

    const startGame = (diff: 'NORMAL' | 'NIGHTMARE' | 'HARD') => {
      this.difficulty = diff;
      container.destroy();
      this.isPaused = false;

      this.showHowToPlay(width, height);
      this.isGracePeriod = true;
      this.time.delayedCall(6000, () => {
        this.isGracePeriod = false;
        this.showLevelTitle();
      });
    };

    normalBtn.on('pointerdown', () => startGame('NORMAL'));
    normalBtn.on('pointerover', () => normalBtn.setFillStyle(0x00ffff, 0.2));
    normalBtn.on('pointerout', () => normalBtn.setFillStyle(0x000000, 1));

    nightmareBtn.on('pointerdown', () => startGame('NIGHTMARE'));
    nightmareBtn.on('pointerover', () => nightmareBtn.setFillStyle(0xff0000, 0.2));
    nightmareBtn.on('pointerout', () => nightmareBtn.setFillStyle(0x000000, 1));
    
    hardBtn.on('pointerdown', () => startGame('HARD'));
    hardBtn.on('pointerover', () => hardBtn.setFillStyle(0xffaa00, 0.2));
    hardBtn.on('pointerout', () => hardBtn.setFillStyle(0x000000, 1));

    container.add([bg, title, normalBtn, normalText, hardBtn, hardText, nightmareBtn, nightmareText]);
  }

  changeWeather() {
    // No longer used — weather is driven by applyWeatherForState()
  }

  applyWeatherForState() {
    const w = this.sys.canvas.width;
    const h = this.sys.canvas.height;

    switch (this.currentEnvState) {
      case 'DAY':
        // Light rain
        this.weatherEmitter.setTexture('rainParticle');
        this.weatherEmitter.setConfig({
          x: { min: 0, max: w },
          y: -10,
          lifespan: 2000,
          speedY: { min: 200, max: 400 },
          speedX: -80,
          scale: { start: 0.6, end: 0 },
          quantity: 1,
          frequency: 80,
          blendMode: 'ADD'
        });
        this.sunGlow.setAlpha(0);
        break;

      case 'SUNSET':
        // No precipitation, warm sun glow on the right
        this.weatherEmitter.setConfig({ quantity: 0, frequency: -1 });
        this.sunGlow.setPosition(w - 60, h * 0.35);
        this.sunGlow.setFillStyle(0xff4400, 0.35);
        this.sunGlow.setScale(2, 1.5);
        this.sunGlow.setAlpha(0.35);
        break;

      case 'NIGHT':
        // Heavy snow + lightning handled in update()
        this.weatherEmitter.setTexture('snowDot');
        this.weatherEmitter.setConfig({
          x: { min: 0, max: w },
          y: -10,
          lifespan: 4000,
          speedY: { min: 40, max: 120 },
          speedX: { min: -30, max: 30 },
          scale: { start: 1, end: 0.3 },
          quantity: 3,
          frequency: 40,
          blendMode: 'ADD'
        });
        this.sunGlow.setAlpha(0);
        break;

      case 'SUNRISE':
        // Light snow / mist, warm glow on the left
        this.weatherEmitter.setTexture('snowDot');
        this.weatherEmitter.setConfig({
          x: { min: 0, max: w },
          y: -10,
          lifespan: 3000,
          speedY: { min: 30, max: 80 },
          speedX: { min: -20, max: 20 },
          scale: { start: 0.7, end: 0 },
          quantity: 1,
          frequency: 100,
          blendMode: 'ADD'
        });
        this.sunGlow.setPosition(60, h * 0.35);
        this.sunGlow.setFillStyle(0xcc44ff, 0.25);
        this.sunGlow.setScale(2, 1.5);
        this.sunGlow.setAlpha(0.25);
        break;
    }
  }

  applyEnvironmentStyle() {
    const style = ENV_STYLES[this.currentEnvState];
    const levelSkyColor = LEVEL_COLORS[this.currentLevel - 1];
    this.sky.setTint(levelSkyColor);
    this.farBuildings.setTint(style.farTint);
    this.nearBuildings.setTint(style.nearTint);
    this.distantBackdrop.setTint(style.backdropTint);
    this.distantBackdrop.setAlpha(style.backdropAlpha);
    this.darknessOverlay.setAlpha(style.darknessAlpha);
  }

  layoutBackdrop() {
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;
    this.distantBackdrop.setPosition(width / 2, height / 2);
    this.distantBackdrop.setDisplaySize(width, height);
  }

  updateBackdropForLevel() {
    const index = Math.min(this.currentLevel - 1, this.levelBackdropKeys.length - 1);
    const key = this.levelBackdropKeys[index];
    if (key && this.distantBackdrop.texture.key !== key) {
      this.distantBackdrop.setTexture(key);
      this.layoutBackdrop();
    }
  }

  createBuildingDecorations(
    building: Phaser.Physics.Arcade.Sprite,
    width: number,
    height: number,
    accentColor: number
  ) {
    const groundY = this.sys.canvas.height;
    const topEdge = building.y - height / 2;
    const baseHeight = Math.max(16, Math.round(height * 0.06));
    const trimWidth = Math.max(4, Math.round(width * 0.08));
    const crownWidth = Math.max(18, Math.round(width * 0.42));
    const trimHeight = height * 0.72;

    const base = this.add.rectangle(building.x, groundY - baseHeight / 2, width + 18, baseHeight, 0x131c2d, 0.95)
      .setDepth(1);
    const crown = this.add.rectangle(building.x, topEdge + 10, crownWidth, 6, accentColor, 0.75)
      .setDepth(1);
    const leftTrim = this.add.rectangle(building.x - width * 0.24, topEdge + (trimHeight / 2) + 14, trimWidth, trimHeight, accentColor, 0.28)
      .setDepth(1);
    const rightTrim = this.add.rectangle(building.x + width * 0.24, topEdge + (trimHeight / 2) + 14, trimWidth, trimHeight, accentColor, 0.28)
      .setDepth(1);

    const windowRows = Math.max(3, Math.min(7, Math.floor(height / 70)));
    const windows: Phaser.GameObjects.Rectangle[] = [];
    for (let i = 0; i < windowRows; i++) {
      const windowLight = this.add.rectangle(
        building.x,
        topEdge + 38 + (i * Math.max(26, height * 0.11)),
        Math.max(10, width * 0.22),
        5,
        0xfff3a1,
        0.18
      ).setDepth(1);
      windows.push(windowLight);
    }

    building.setData('decorBase', base);
    building.setData('decorCrown', crown);
    building.setData('decorLeftTrim', leftTrim);
    building.setData('decorRightTrim', rightTrim);
    building.setData('decorWindows', windows);
    building.setData('decorAccent', accentColor);

    this.syncBuildingDecorations(building);
  }

  syncBuildingDecorations(building: Phaser.Physics.Arcade.Sprite) {
    const displayWidth = building.displayWidth;
    const displayHeight = building.displayHeight;
    const groundY = this.sys.canvas.height;
    const topEdge = building.y - displayHeight / 2;
    const trimHeight = displayHeight * 0.72;

    const base = building.getData('decorBase') as Phaser.GameObjects.Rectangle | undefined;
    const crown = building.getData('decorCrown') as Phaser.GameObjects.Rectangle | undefined;
    const leftTrim = building.getData('decorLeftTrim') as Phaser.GameObjects.Rectangle | undefined;
    const rightTrim = building.getData('decorRightTrim') as Phaser.GameObjects.Rectangle | undefined;
    const windows = (building.getData('decorWindows') as Phaser.GameObjects.Rectangle[] | undefined) ?? [];

    if (base) {
      base.x = building.x;
      base.y = groundY - base.height / 2;
      base.width = displayWidth + 18;
    }

    if (crown) {
      crown.x = building.x;
      crown.y = topEdge + 10;
      crown.width = Math.max(18, Math.round(displayWidth * 0.42));
    }

    if (leftTrim) {
      leftTrim.x = building.x - displayWidth * 0.24;
      leftTrim.y = topEdge + (trimHeight / 2) + 14;
      leftTrim.width = Math.max(4, Math.round(displayWidth * 0.08));
      leftTrim.height = trimHeight;
    }

    if (rightTrim) {
      rightTrim.x = building.x + displayWidth * 0.24;
      rightTrim.y = topEdge + (trimHeight / 2) + 14;
      rightTrim.width = Math.max(4, Math.round(displayWidth * 0.08));
      rightTrim.height = trimHeight;
    }

    windows.forEach((windowLight, index) => {
      windowLight.x = building.x;
      windowLight.y = topEdge + 38 + (index * Math.max(26, displayHeight * 0.11));
      windowLight.width = Math.max(10, displayWidth * 0.22);
    });
  }

  destroyBuildingDecorations(building: Phaser.Physics.Arcade.Sprite) {
    const base = building.getData('decorBase') as Phaser.GameObjects.Rectangle | undefined;
    const crown = building.getData('decorCrown') as Phaser.GameObjects.Rectangle | undefined;
    const leftTrim = building.getData('decorLeftTrim') as Phaser.GameObjects.Rectangle | undefined;
    const rightTrim = building.getData('decorRightTrim') as Phaser.GameObjects.Rectangle | undefined;
    const windows = (building.getData('decorWindows') as Phaser.GameObjects.Rectangle[] | undefined) ?? [];

    base?.destroy();
    crown?.destroy();
    leftTrim?.destroy();
    rightTrim?.destroy();
    windows.forEach((windowLight) => windowLight.destroy());

    building.setData('decorBase', null);
    building.setData('decorCrown', null);
    building.setData('decorLeftTrim', null);
    building.setData('decorRightTrim', null);
    building.setData('decorWindows', null);
  }

  spawnCloud() {
    const x = this.sys.canvas.width + 100;
    const y = Phaser.Math.Between(50, 200);
    const cloud = this.add.image(x, y, 'cloud');
    cloud.setAlpha(ENV_STYLES[this.currentEnvState].cloudAlpha);
    cloud.setScale(Phaser.Math.FloatBetween(0.5, 1.5));
    cloud.setDepth(-1.5); // Between distant city and sky
    this.cloudsGroup.add(cloud);
  }

  triggerLightning() {
    if (this.currentEnvState !== 'NIGHT') return;

    this.lightningOverlay.setAlpha(0.7);
    this.tweens.add({
      targets: this.lightningOverlay,
      alpha: 0,
      duration: 300,
      ease: 'Power2'
    });
  }

  showHowToPlay(width: number, height: number) {
    const container = this.add.container(width / 2, height / 2).setDepth(3000).setScrollFactor(0);

    const bg = this.add.rectangle(0, 0, 500, 300, 0x000000, 0.7);
    bg.setStrokeStyle(2, 0x00ffff);

    const title = this.add.text(0, -110, 'HOW TO PLAY', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#ff00ff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const controls = [
      'WASD / ARROWS : Move Dragon',
      'LEFT CLICK    : Fireball (Inf)',
      'RIGHT CLICK   : Missile (Ltd)',
      '',
      'MOBILE: D-Pad + 🔥 / 🚀 Buttons',
      '',
      'Collect Hearts to Heal/Buff HP',
      'Collect Stars to Upgrade Weapon',
      'Watch videos to gain points!'
    ];

    const content = this.add.text(0, 20, controls.join('\n'), {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    container.add([bg, title, content]);

    // Fade out after 5 seconds
    this.time.delayedCall(5000, () => {
      this.tweens.add({
        targets: container,
        alpha: 0,
        duration: 1000,
        onComplete: () => container.destroy()
      });
    });
  }

  showLevelTitle() {
    if (this.currentLevel > this.getMaxLevel()) return;

    const config = LEVELS[this.currentLevel - 1];
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;

    const text = this.add.text(width / 2, height / 2, `LEVEL ${this.currentLevel}\n${config.name}`, {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setDepth(4500).setScrollFactor(0);

    text.setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 2000,
      onComplete: () => text.destroy()
    });
  }

  takeDamage(amount: number) {
    const now = this.time.now;
    if (now - this.lastDamageTime < this.DAMAGE_COOLDOWN) return;
    this.lastDamageTime = now;

    this.health -= amount;

    // Weapon downgrade on hit
    if (this.fireballLevel > 1) {
      this.fireballLevel--;
    }
    if (this.missileLevel > 1) {
      this.missileLevel--;
    }

    if (this.health <= 0) {
      this.health = 0;
      this.triggerGameOver();
    }
    GameEvents.emit('health-changed', this.health);

    this.dragon.setTint(0xff0000);
    this.dragon.setAlpha(0.6);
    this.time.delayedCall(this.DAMAGE_COOLDOWN, () => {
      this.dragon.clearTint();
      this.dragon.setAlpha(1);
    });
  }

  triggerGameOver() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.physics.pause();
    this.dragon.setVelocity(0);

    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;

    // Show "GOOD GAME" text
    this.add.text(width / 2, height / 2, 'GOOD GAME', {
      fontFamily: 'monospace',
      fontSize: '80px',
      color: '#00ffff',
      stroke: '#ff00ff',
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(2000).setScrollFactor(0);

    // Fade out BGM (starts a 3s fade)
    GameEvents.emit('bgm-stop');

    // Wait 4 seconds then transition to end screen
    this.time.delayedCall(4000, () => {
      GameEvents.emit('game-over');
    });
  }

  fireFireball() {
    this.fireballSfx.play();

    const fire = (x: number, y: number, angle: number = 0, isBlue: boolean = false) => {
      const fireball = this.fireballs.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
      if (fireball) {
        fireball.enableBody(true, x, y, true, true);
        fireball.setTexture('fireball');
        fireball.setDisplaySize(30, 15);
        fireball.body?.setSize(20, 10);
        if (!fireball.body) this.physics.add.existing(fireball);

        const vx = Math.cos(angle) * 600;
        const vy = Math.sin(angle) * 600;
        fireball.setVelocity(vx, vy);
        fireball.setAngle(Phaser.Math.RadToDeg(angle));
        fireball.setCollideWorldBounds(false);
        fireball.setDepth(10);
        
        if (isBlue) {
          fireball.setTint(0x00ccff);
          fireball.setData('damage', 20);
        } else {
          fireball.clearTint();
          fireball.setData('damage', 10);
        }
      }
    };

    if (this.fireballLevel === 1) {
      fire(this.dragon.x + 20, this.dragon.y);
    } else if (this.fireballLevel === 2) {
      fire(this.dragon.x + 20, this.dragon.y - 10);
      fire(this.dragon.x + 20, this.dragon.y + 10);
    } else if (this.fireballLevel === 3) {
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
    } else if (this.fireballLevel === 4) {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    } else if (this.fireballLevel === 5) {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.1);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    } else if (this.fireballLevel === 6) {
      fire(this.dragon.x + 20, this.dragon.y, -0.2);
      fire(this.dragon.x + 20, this.dragon.y, -0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0);
      fire(this.dragon.x + 20, this.dragon.y, 0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.2);
    } else { // 7
      fire(this.dragon.x + 20, this.dragon.y, -0.2, true);
      fire(this.dragon.x + 20, this.dragon.y, -0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.1, true);
      fire(this.dragon.x + 20, this.dragon.y, 0.2, true);
    }
  }

  fireMissile() {
    if (this.missileAmmo > 0) {
      this.missileAmmo--;
      GameEvents.emit('ammo-changed', this.missileAmmo);

      const fireOne = (yOffset: number) => {
        const missile = this.missiles.get(this.dragon.x + 20, this.dragon.y + yOffset) as Phaser.Physics.Arcade.Sprite | null;
        if (missile) {
          missile.enableBody(true, this.dragon.x + 20, this.dragon.y + yOffset, true, true);
          const visualLevel = Math.min(this.missileLevel, 4);
          const tex = 'missile_lv' + visualLevel;
          const w = 40 + (visualLevel - 1) * 20;
          const h = 20 + (visualLevel - 1) * 10;
          missile.setTexture(tex);
          missile.setDisplaySize(w, h);
          missile.body?.setSize(w * 0.75, h * 0.75);
          missile.setData('damage', 30 * this.missileLevel);
          if (!missile.body) this.physics.add.existing(missile);
          missile.setVelocityX(400);
        }
      };

      if (this.missileLevel >= 5) {
        fireOne(-15);
        fireOne(15);
      } else {
        fireOne(0);
      }
    }
  }

  handleFireballHit(fireball: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    fireball.disableBody(true, true);
    let damage = fireball.getData('damage') || 10;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 0.75;
    }
    this.damageEnemy(enemy, damage);
  }

  handleMissileHit(missile: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    missile.disableBody(true, true);
    let damage = missile.getData('damage') || 30;
    if (this.difficulty === 'NIGHTMARE') {
      damage *= 3;
    } else if (this.difficulty === 'HARD') {
      damage *= 0.75;
    }
    this.damageEnemy(enemy, damage);
  }

  damageEnemy(enemy: Phaser.Physics.Arcade.Sprite, damage: number) {
    let health = enemy.getData('health') - damage;
    enemy.setData('health', health);

    enemy.setTint(0xff0000);
    this.time.delayedCall(100, () => enemy.clearTint());

    if (health <= 0) {
      this.killEnemy(enemy);
    } else {
      if (!enemy.getData('hasBeenHit') && !enemy.getData('isBoss')) {
        enemy.setData('hasBeenHit', true);
        const reaction = Phaser.Math.Between(0, 5);
        const currentVx = enemy.body?.velocity.x || -200;

        switch (reaction) {
          case 0: // escape quickly
            enemy.setVelocityX(currentVx * 1.5);
            break;
          case 1: // move slightly up
            enemy.setVelocityY(-100);
            break;
          case 2: // move slightly down
            enemy.setVelocityY(100);
            break;
          case 3: // move toward upper-left
            enemy.setVelocityX(currentVx * 1.2);
            enemy.setVelocityY(-150);
            break;
          case 4: // move toward lower-left
            enemy.setVelocityX(currentVx * 1.2);
            enemy.setVelocityY(150);
            break;
          case 5: // move forward without changing direction
            break;
        }
      }
    }
  }

  handlePlayerHit(_dragon: Phaser.Physics.Arcade.Sprite, enemy: Phaser.Physics.Arcade.Sprite) {
    const damage = enemy.getData('damage') || 20;
    // Boss stays alive on contact — only fireballs/missiles can kill it
    if (!enemy.getData('isBoss')) {
      enemy.disableBody(true, true);
    }
    this.takeDamage(damage);
  }

  handleEnemyBulletHit(_dragon: Phaser.Physics.Arcade.Sprite, bullet: Phaser.Physics.Arcade.Sprite) {
    bullet.disableBody(true, true);
    this.takeDamage(10); // Standard damage for bullet hit
  }

  handleBuildingHit(_dragon: Phaser.Physics.Arcade.Sprite, _building: Phaser.Physics.Arcade.Sprite) {
    this.takeDamage(3); // Bump damage (cooldown-gated)
  }

  handleAmmoPickup(_dragon: Phaser.Physics.Arcade.Sprite, crate: Phaser.Physics.Arcade.Sprite) {
    crate.disableBody(true, true);
    this.missileAmmo = Math.min(30, this.missileAmmo + 3);
    GameEvents.emit('ammo-changed', this.missileAmmo);
  }

  handleHealthPickup(_dragon: Phaser.Physics.Arcade.Sprite, pack: Phaser.Physics.Arcade.Sprite) {
    pack.disableBody(true, true);

    if (this.health >= this.maxHealth) {
      this.score += 50;
      GameEvents.emit('score-changed', this.score);
    } else {
      this.health = Math.min(this.maxHealth, this.health + 20);
      GameEvents.emit('health-changed', this.health);
    }

    // Visual feedback for pickup
    this.dragon.setTint(0x00ff00);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }

  handleWeaponUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {
    upgrade.disableBody(true, true);
    if (this.fireballLevel < 7) {
      this.fireballLevel++;
    } else {
      this.score += 50;
      GameEvents.emit('score-changed', this.score);
    }
    // Visual feedback
    this.dragon.setTint(0x00ffff);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }

  handleMissileUpgradePickup(_dragon: Phaser.Physics.Arcade.Sprite, upgrade: Phaser.Physics.Arcade.Sprite) {
    upgrade.disableBody(true, true);
    if (this.missileLevel < 5) {
      this.missileLevel++;
    } else {
      this.score += 50;
      GameEvents.emit('score-changed', this.score);
    }
    // Visual feedback
    this.dragon.setTint(0xff8800);
    this.time.delayedCall(200, () => this.dragon.clearTint());
  }

  killEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    this.killSfx.play();

    // Trigger explosion particles
    this.explosionEmitter.explode(20, enemy.x, enemy.y);

    const points = enemy.getData('points') || 10;
    enemy.disableBody(true, true);
    this.score += points;
    GameEvents.emit('score-changed', this.score);

    // Boss defeated — reset distance to trigger final checkpoint
    if (enemy.getData('isBoss')) {
      let activeBosses = 0;
      this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active && sprite.getData('isBoss')) {
          activeBosses++;
        }
        return true;
      });

      if (activeBosses === 0) {
        this.isBossLevel = false;
        // Reset distance traveled so checkpoint spawns soon after boss dies
        this.distanceTraveled = this.checkpointThreshold - 1000;
      }
      return;
    }

    const rand = Math.random();
    if (rand < 0.04) {
      this.spawnPowerUp(enemy.x, enemy.y, 'weapon_upgrade');
    } else if (rand < 0.08) {
      this.spawnPowerUp(enemy.x, enemy.y, 'missile_upgrade');
    } else if (rand < 0.18) {
      this.spawnPowerUp(enemy.x, enemy.y, 'health_pack');
    } else if (rand < 0.30) {
      this.spawnAmmoCrate(enemy.x, enemy.y);
    }
  }

  spawnPowerUp(x: number, y: number, key: string) {
    let group = this.healthPacks;
    if (key === 'weapon_upgrade') group = this.weaponUpgrades;
    if (key === 'missile_upgrade') group = this.missileUpgrades;
    const item = group.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (item) {
      item.enableBody(true, x, y, true, true);
      item.setTexture(key);
      item.setDisplaySize(30, 30);
      item.setVelocityX(-120);
    }
  }

  spawnAmmoCrate(x: number, y: number) {
    const crate = this.ammoCrates.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (crate) {
      crate.enableBody(true, x, y, true, true);
      crate.setTexture('ammoCrate');
      crate.setDisplaySize(30, 30);
      crate.body?.setSize(24, 24);
      if (!crate.body) this.physics.add.existing(crate);
      crate.setVelocityX(-100);
    }
  }

  spawnEnemy() {
    if (this.isBossLevel) return;
    this.enemyCounter++;

    let type = 'chicken';
    let health = 10;
    let damage = 10;
    let points = 10;
    let width = 60;
    let height = 60;

    // Difficulty increases with levels
    const levelFactor = 1 + (this.videosWatched * 0.2);
    health = Math.floor(health * levelFactor);

    if ((this.currentLevel === this.getMaxLevel() - 1 || this.currentLevel === this.getMaxLevel()) && this.enemyCounter % 15 === 0) {
      type = 'dragon-boss';
      health = 3000;
      damage = 30;
      points = 1000;
      width = 300;
      height = 300;
    } else if (this.enemyCounter % 20 === 0) {
      type = 'cow';
      health = Math.floor(50 * levelFactor);
      damage = 20;
      points = 200;
      width = 95;
      height = 95;
    } else if (this.enemyCounter % 5 === 0) {
      type = 'pig';
      health = Math.floor(30 * levelFactor);
      damage = 20;
      points = 50;
      width = 80;
      height = 80;
    }

    if (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') {
      health *= 2;
      damage *= 2;
    }

    const numSpawns = (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') ? (type === 'chicken' ? 2 : 3) : 1;

    for (let i = 0; i < numSpawns; i++) {
      const y = Phaser.Math.Between(50, this.sys.canvas.height - 50);
      const x = this.sys.canvas.width + 50 + (i * 80);
      const enemy = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (enemy) {
        enemy.enableBody(true, x, y, true, true);
        enemy.setTexture(type);
        enemy.setDisplaySize(width, height);
        enemy.setAlpha(0.8);
        enemy.setData('isBoss', false);

        // Sync collision body to display size
        enemy.body?.setSize(enemy.width, enemy.height);

        enemy.setData('health', health);
        enemy.setData('maxHealth', health);
        enemy.setData('damage', damage);
        enemy.setData('points', points);

        enemy.setVelocityX(Phaser.Math.Between(-150, -300));
        // Give 50% of the normal enemies a vertical velocity so they enter and move diagonally
        if (Math.random() < 0.5) {
          // Exclude near-zero vertical velocities for a more distinct diagonal path
          const vy = Phaser.Math.Between(50, 150);
          enemy.setVelocityY(Math.random() < 0.5 ? vy : -vy);
        } else {
          enemy.setVelocityY(0);
        }
        
        enemy.setData('nextShot', this.time.now + Phaser.Math.Between(1000, 3000));
      }
    }
  }

  spawnSmallDragonBoss(count: number) {
    for (let i = 0; i < count; i++) {
      const row = i % 4;
      const col = Math.floor(i / 4);
      const y = (this.sys.canvas.height / 5) * (row + 1);
      const x = this.sys.canvas.width + 100 + (col * 150);
      const boss = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (boss) {
        boss.enableBody(true, x, y, true, true);
        boss.setTexture('dragon-boss');
        boss.setTint(0x66ffcc);
        boss.setDisplaySize(140, 140);
        boss.setAlpha(1);
        boss.setData('isBoss', true);

        const bossBody = boss.body as Phaser.Physics.Arcade.Body;
        bossBody.setSize(boss.width, boss.height);
        bossBody.setImmovable(true);

        let h = 200;
        let d = 20;
        if (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') {
          h = 400;
        }

        boss.setData('health', h);
        boss.setData('maxHealth', h);
        boss.setData('damage', d);
        boss.setData('points', 500);

        boss.setVelocityX(-100);
        const vy = Phaser.Math.Between(30, 80);
        boss.setVelocityY(Math.random() < 0.5 ? vy : -vy);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));
      }
    }
  }

  spawnBoss(count: number = 2) {
    // Add Statue of Liberty in background as the final goal
    const liberty = this.add.image(this.sys.canvas.width + 400, this.sys.canvas.height - 200, 'statue_of_liberty');
    liberty.setDisplaySize(200, 400);
    liberty.setDepth(-2);
    this.tweens.add({
      targets: liberty,
      x: this.sys.canvas.width / 2,
      duration: 10000,
      ease: 'Linear'
    });

    let numBosses = count;
    if (this.difficulty === 'NIGHTMARE') {
      numBosses *= 3;
    }

    for (let i = 0; i < numBosses; i++) {
      // Create a grid layout for large number of bosses

      const row = i % 3;
      const col = Math.floor(i / 3);

      const y = (this.sys.canvas.height / 4) * (row + 1);
      const x = this.sys.canvas.width + 200 + (col * 150);
      const boss = this.enemies.get(x, y) as Phaser.Physics.Arcade.Sprite | null;

      if (boss) {
        boss.enableBody(true, x, y, true, true);
        boss.setTexture('dragon-boss');
        // Scale down slightly to fit multiple bosses on screen
        boss.setDisplaySize(200, 200);
        boss.setAlpha(1);
        boss.setData('isBoss', true);

        const bossBody = boss.body as Phaser.Physics.Arcade.Body;
        bossBody.setSize(boss.width, boss.height);
        bossBody.setImmovable(true); // Can't be pushed by projectiles

        let h = 3000;
        let d = 30;
        if (this.difficulty === 'NIGHTMARE' || this.difficulty === 'HARD') {
          h *= 2;
          d *= 2;
        }

        boss.setData('health', h);
        boss.setData('maxHealth', h);
        boss.setData('damage', d);
        boss.setData('points', 1000);

        boss.setVelocityX(-100);
        const vy = Phaser.Math.Between(30, 80);
        boss.setVelocityY(Math.random() < 0.5 ? vy : -vy);
        boss.setData('nextShot', this.time.now + 1000 + (i * 500));
      }
    }
  }

  spawnEnemyBullet(x: number, y: number, isBoss: boolean = false) {
    const shoot = (vx: number, vy: number) => {
      const bullet = this.enemyBullets.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
      if (bullet) {
        bullet.enableBody(true, x, y, true, true);
        bullet.setTexture('enemyBullet');
        if (!bullet.body) this.physics.add.existing(bullet);
        bullet.body?.setSize(10, 10);
        bullet.setVelocity(vx, vy);
      }
    };

    if (this.difficulty === 'NIGHTMARE') {
      if (isBoss) {
        for (let i = -4; i <= 4; i++) {
          shoot(-400, i * 40);
        }
      } else {
        shoot(-400, -80);
        shoot(-400, 0);
        shoot(-400, 80);
      }
    } else {
      if (isBoss) {
        shoot(-400, -100);
        shoot(-400, 0);
        shoot(-400, 100);
      } else {
        shoot(-400, 0);
      }
    }
  }

  spawnCheckpoint() {
    if (this.currentLevel > this.getMaxLevel()) return;

    const config = LEVELS[this.currentLevel - 1];
    const x = this.sys.canvas.width + 200;
    const y = this.sys.canvas.height - (config.height / 2); // Anchor to ground

    // 1. Visual Landmark
    const landmark = this.add.sprite(x, y, config.key);
    landmark.setDisplaySize(config.width, config.height);
    landmark.setDepth(-2);

    if (!this.landmarksGroup) {
      this.landmarksGroup = this.add.group();
    }
    this.landmarksGroup.add(landmark);

    // 2. Physics Checkpoint / Screen Box
    const screenX = x + config.screenBox.x;
    const screenY = y + config.screenBox.y;

    const screenBuilding = this.screenBuildings.get(screenX, screenY) as Phaser.Physics.Arcade.Sprite | null;
    if (screenBuilding) {
      screenBuilding.enableBody(true, screenX, screenY, true, true);

      screenBuilding.setTexture('hologramScreen');
      screenBuilding.setDisplaySize(config.screenBox.width, config.screenBox.height);

      if (!screenBuilding.body) this.physics.add.existing(screenBuilding);
      (screenBuilding.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      screenBuilding.setVelocityX(-100);
      screenBuilding.setDepth(-1);

      // Link landmark and save offset to avoid recalculating with wrong level later
      screenBuilding.setData('linkedLandmark', landmark);
      screenBuilding.setData('landmarkOffsetX', config.screenBox.x);

      // 3. TV Icon
      const tv = this.add.image(screenX, screenY - (config.screenBox.height/2) - 30, 'tv');
      tv.setDisplaySize(60, 45); // Make it slightly smaller
      tv.setDepth(1);
      this.tvs.add(tv);
      screenBuilding.setData('linkedTv', tv);
    }
  }

  spawnBuilding() {
    const buildingTypes = [
      { key: 'empire_state', width: 80, minH: 300, accentColor: 0xff5ccf },
      { key: 'chrysler', width: 80, minH: 300, accentColor: 0x49d7ff },
      { key: 'skyscraper_blue', width: 60, minH: 200, accentColor: 0x4dc3ff },
      { key: 'skyscraper_pink', width: 70, minH: 200, accentColor: 0xff5ce1 }
    ];

    const type = buildingTypes[Phaser.Math.Between(0, buildingTypes.length - 1)];
    const maxH = Math.floor(this.sys.canvas.height * 0.6); // Cap at 60% so the dragon can always fly over
    const height = Phaser.Math.Between(type.minH, maxH);
    const x = this.sys.canvas.width + 100;
    const y = this.sys.canvas.height - height / 2 + 6;

    const building = this.buildings.get(x, y) as Phaser.Physics.Arcade.Sprite | null;
    if (building) {
      building.enableBody(true, x, y, true, true);
      building.setTexture(type.key);
      building.setDisplaySize(type.width, height);
      building.setDepth(0.5);
      // Shrink collision box to 70% width so edges don't clip the dragon unfairly
      const body = building.body as Phaser.Physics.Arcade.Body;
      body.setImmovable(true);
      body.setSize(type.width * 0.7, height * 0.94);
      body.setOffset(type.width * 0.15, height * 0.06);
      building.setVelocityX(-100);

      this.destroyBuildingDecorations(building);
      this.createBuildingDecorations(building, type.width, height, type.accentColor);
    }
  }

  update(time: number, delta: number) {
    if (this.isPaused) return;

    // Environment Cycle (60s total cycle)
    this.envCycleTimer += delta;
    const cyclePos = (this.envCycleTimer % 60000) / 60000;

    if (cyclePos < 0.25) {
      this.currentEnvState = 'DAY';
    } else if (cyclePos < 0.5) {
      this.currentEnvState = 'SUNSET';
    } else if (cyclePos < 0.75) {
      this.currentEnvState = 'NIGHT';
    } else {
      this.currentEnvState = 'SUNRISE';
    }

    // Detect state transition and update weather
    if (this.currentEnvState !== this.prevEnvState) {
      this.prevEnvState = this.currentEnvState;
      this.applyWeatherForState();
    }

    // Random Lightning during NIGHT and SUNSET
    if ((this.currentEnvState === 'NIGHT' || this.currentEnvState === 'SUNSET') &&
        time > this.lastLightningTime + Phaser.Math.Between(3000, 8000)) {
      this.triggerLightning();
      this.lastLightningTime = time;
    }

    this.applyEnvironmentStyle();

    // Drifting Clouds
    if (Phaser.Math.Between(0, 500) === 0) {
      this.spawnCloud();
    }
    this.cloudsGroup.children.each((c) => {
      const cloud = c as Phaser.GameObjects.Image;
      cloud.x -= 0.5;
      if (cloud.x < -200) {
        cloud.destroy();
      }
      return true;
    });

    this.distanceTraveled += 1;

    if (this.distanceTraveled > this.checkpointThreshold && !this.isBossLevel) {
       this.distanceTraveled = 0;
       this.spawnCheckpoint();
    }

    // Update TV positions to follow buildings
    this.screenBuildings.children.each((sb) => {
      const building = sb as Phaser.Physics.Arcade.Sprite;
      const tv = building.getData('linkedTv') as Phaser.GameObjects.Image;
      const landmark = building.getData('linkedLandmark') as Phaser.GameObjects.Sprite;
      const offsetX = building.getData('landmarkOffsetX') as number;

      if (building) {
        if (tv) tv.x = building.x;
        if (landmark) landmark.x = building.x - offsetX;
      }
      return true;
    });

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
    this.distantBackdrop.x = this.sys.canvas.width / 2 + Math.sin(time * 0.00008) * 10;

    this.buildings.children.each((b) => {
      const building = b as Phaser.Physics.Arcade.Sprite;
      if (building.active) {
        this.syncBuildingDecorations(building);
      }
      return true;
    });

    // Movement (keyboard + touch)
    const speed = 400;
    this.dragon.setVelocity(0);

    const left = this.cursors.left?.isDown || (this.cursors as any).A?.isDown || this.touchDirections.has('left');
    const right = this.cursors.right?.isDown || (this.cursors as any).D?.isDown || this.touchDirections.has('right');
    const up = this.cursors.up?.isDown || (this.cursors as any).W?.isDown || this.touchDirections.has('up');
    const down = this.cursors.down?.isDown || (this.cursors as any).S?.isDown || this.touchDirections.has('down');

    if (left) {
      this.dragon.setVelocityX(-speed);
    } else if (right) {
      this.dragon.setVelocityX(speed);
    }

    if (up) {
      this.dragon.setVelocityY(-speed);
    } else if (down) {
      this.dragon.setVelocityY(speed);
    }

    if (time > this.lastEnemySpawn && !this.isBossLevel && this.currentLevel < this.getMaxLevel() && !this.isGracePeriod) {
        this.spawnEnemy();
        this.lastEnemySpawn = time + Phaser.Math.Between(1000, 3000) / (1 + this.videosWatched * 0.1);
    }

    if (time > this.lastBuildingSpawn && !this.isBossLevel && this.currentLevel < this.getMaxLevel() && !this.isGracePeriod) {
        this.spawnBuilding();
        this.lastBuildingSpawn = time + Phaser.Math.Between(3000, 6000);
    }

    // Enemy shooting and movement logic
    this.enemies.children.each((e) => {
        const sprite = e as Phaser.Physics.Arcade.Sprite;
        if (sprite.active) {
            const isBoss = sprite.getData('isBoss');
            const isDragonBoss = sprite.texture.key === 'dragon-boss';
            const w = this.sys.canvas.width;
            const h = this.sys.canvas.height;
            const margin = 30;

            if (isBoss) {
              // Clamp boss to visible area horizontally
              const minX = w * 0.5;
              const maxX = w * 0.85;
              if (sprite.x <= minX) {
                sprite.x = minX;
                sprite.setVelocityX(0);
              } else if (sprite.x >= maxX) {
                sprite.x = maxX;
                sprite.setVelocityX(-100);
              } else if (sprite.x < maxX) {
                sprite.setVelocityX(0);
              }
            } else {
              // Normal enemies bouncing off horizontal edges
              if (sprite.getData('hasEnteredScreen')) {
                // Right edge bounce
                if (sprite.x >= w - margin) {
                  sprite.x = w - margin;
                  if (sprite.body && sprite.body.velocity.x > 0) {
                    sprite.setVelocityX(-Math.abs(sprite.body.velocity.x));
                  }
                }
              } else if (sprite.x < w) {
                sprite.setData('hasEnteredScreen', true);
              }

              // Left edge cleanup: once they cross the left, they're gone.
              if (sprite.x <= -150) {
                sprite.disableBody(true, true);
              }
            }

            // Top edge bounce for ALL enemies
            if (sprite.y <= margin) {
              sprite.y = margin;
              if (sprite.body && sprite.body.velocity.y < 0) {
                sprite.setVelocityY(Math.abs(sprite.body.velocity.y) || 100);
              }
            }

            // Bottom edge bounce for ALL enemies
            if (sprite.y >= h - margin) {
              sprite.y = h - margin;
              if (sprite.body && sprite.body.velocity.y > 0) {
                sprite.setVelocityY(-Math.abs(sprite.body.velocity.y) || -100);
              }
            }

            // Shooting logic
            if (sprite.x < w && sprite.x > 0) {
                const nextShot = sprite.getData('nextShot');
                if (time > nextShot) {
                    this.spawnEnemyBullet(sprite.x, sprite.y, isBoss || isDragonBoss);
                    const shotDelay = (isBoss || isDragonBoss) ? 1000 : Phaser.Math.Between(2000, 5000);
                    sprite.setData('nextShot', time + shotDelay);
                }
            }
        }
        return true;
    });
    // Cleanups
    const cleanOffscreen = (group: Phaser.Physics.Arcade.Group, boundary: number, checkRight: boolean = false) => {
      group.children.each((item) => {
          const sprite = item as Phaser.Physics.Arcade.Sprite;
          if (sprite.active) {
              if (checkRight ? sprite.x > boundary : sprite.x < boundary) {
            if (group === this.buildings) {
              this.destroyBuildingDecorations(sprite);
            }
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
    cleanOffscreen(this.weaponUpgrades, -50, false);
    cleanOffscreen(this.missileUpgrades, -50, false);
    cleanOffscreen(this.healthPacks, -50, false);
    cleanOffscreen(this.buildings, -100, false);
  }
}
