# NYC Levels & Backgrounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 10 distinct geographic levels for the Manhattan flight, replacing generic checkpoints with specific NYC landmarks and displaying level titles.

**Architecture:** We will manage `currentLevel` state in `MainScene.ts`, loading SVG assets for each level's checkpoint. `spawnCheckpoint` will be updated to render the specific landmark and overlay a correctly positioned `screenBuilding` for the YouTube video player. The Level 10 boss logic will be adjusted so the final checkpoint appears *after* the boss is defeated.

**Tech Stack:** Phaser 3 (TypeScript), React (for UI overlay if needed, though most changes are in Phaser).

---

### Task 1: Create Placeholder Assets for Landmarks

**Files:**
- Create: `public/plaza_hotel.svg`
- Create: `public/vessel.svg`
- Create: `public/washington_arch.svg`
- Create: `public/tenement.svg`
- Create: `public/cast_iron.svg`
- Create: `public/brooklyn_bridge.svg`
- Create: `public/one_wtc.svg`

- [ ] **Step 1: Create Plaza Hotel SVG**
  Create a simple placeholder SVG for `plaza_hotel.svg` (e.g., a tall gray rectangle with a basic roof shape).
- [ ] **Step 2: Create Vessel SVG**
  Create a simple placeholder SVG for `vessel.svg`.
- [ ] **Step 3: Create Washington Arch SVG**
  Create a simple placeholder SVG for `washington_arch.svg`.
- [ ] **Step 4: Create Tenement SVG**
  Create a simple placeholder SVG for `tenement.svg`.
- [ ] **Step 5: Create Cast Iron SVG**
  Create a simple placeholder SVG for `cast_iron.svg`.
- [ ] **Step 6: Create Brooklyn Bridge SVG**
  Create a simple placeholder SVG for `brooklyn_bridge.svg`.
- [ ] **Step 7: Create One WTC SVG**
  Create a simple placeholder SVG for `one_wtc.svg`.
- [ ] **Step 8: Commit**
  ```bash
  git add public/*.svg
  git commit -m "assets: add placeholder svgs for new nyc landmarks"
  ```

### Task 2: Define Level Configuration & State

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Add Level Configuration Interface and Array**
  Add the `LevelConfig` interface and the `LEVELS` array containing the 10 levels, their names, asset keys, and `screenBox` definitions at the top of the file (outside the class).
  ```typescript
  interface LevelConfig {
    name: string;
    key: string;
    width: number;
    height: number;
    screenBox: { x: number; y: number; width: number; height: number };
  }

  const LEVELS: LevelConfig[] = [
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
  ```
- [ ] **Step 2: Add `currentLevel` property and load assets**
  Add `private currentLevel: number = 1;` to the `MainScene` class.
  In `preload()`, add `this.load.svg` calls for all the new placeholder assets with their respective width/height from the config.
- [ ] **Step 3: Reset `currentLevel` on restart**
  In the `onRestartGame` listener within `create()`, reset `this.currentLevel = 1;`.
- [ ] **Step 4: Commit**
  ```bash
  git add src/game/scenes/MainScene.ts
  git commit -m "feat(game): add level config and load landmark assets"
  ```

### Task 3: Implement Level Title UI

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Add `showLevelTitle` method**
  Create a method to display the level title text animation.
  ```typescript
  showLevelTitle() {
    if (this.currentLevel > 10) return;
    
    const config = LEVELS[this.currentLevel - 1];
    const width = this.sys.canvas.width;
    const height = this.sys.canvas.height;

    const text = this.add.text(width / 2, height / 2, \`LEVEL \${this.currentLevel}\\n\${config.name}\`, {
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
  ```
- [ ] **Step 2: Trigger `showLevelTitle`**
  Call `this.showLevelTitle()` at the very end of `create()` (after `showHowToPlay` or concurrently).
  Call `this.showLevelTitle()` inside `onVideoComplete`, just before or after `this.scene.resume()`, but *only if* `this.currentLevel <= 10`.
- [ ] **Step 3: Commit**
  ```bash
  git add src/game/scenes/MainScene.ts
  git commit -m "feat(game): implement level title ui animation"
  ```

### Task 4: Upgrade `spawnCheckpoint` for Landmarks

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Refactor `spawnCheckpoint`**
  Update the method to use the `LEVELS` config based on `this.currentLevel`. The landmark sprite handles the collision, and a child `screenBuilding` and `tv` icon are positioned relative to it.
  Instead of a single Sprite, we should use a `Phaser.GameObjects.Container` for the visual grouping, but keep the `screenBuilding` in the physics group for collision.
  *Wait, current collision is tied to `screenBuildings`. Let's keep `screenBuildings` group for the invisible collision/screen box, and add a visual landmark Sprite behind it.*
  
  ```typescript
  spawnCheckpoint() {
    if (this.currentLevel > 10) return;

    const config = LEVELS[this.currentLevel - 1];
    const x = this.sys.canvas.width + 200;
    const y = this.sys.canvas.height - (config.height / 2); // Anchor to ground

    // 1. Visual Landmark
    const landmark = this.add.sprite(x, y, config.key);
    landmark.setDisplaySize(config.width, config.height);
    landmark.setDepth(-2);
    // Keep reference to move it in update
    landmark.setData('isLandmark', true); 
    this.add.existing(landmark); // Add to display list, we will move it manually in update() or add it to a group. Let's use a group.
    
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
      // Create a smaller, transparent texture for the screen box
      if (!this.textures.exists('hologramScreen')) {
         const g = this.add.graphics();
         g.fillStyle(0x000000, 0.5);
         g.lineStyle(2, 0x00ff00, 1);
         g.fillRect(0,0, 100, 100);
         g.strokeRect(0,0,100,100);
         g.generateTexture('hologramScreen', 100, 100);
         g.destroy();
      }
      
      screenBuilding.setTexture('hologramScreen');
      screenBuilding.setDisplaySize(config.screenBox.width, config.screenBox.height);
      
      if (!screenBuilding.body) this.physics.add.existing(screenBuilding);
      (screenBuilding.body as Phaser.Physics.Arcade.Body).setImmovable(true);
      screenBuilding.setVelocityX(-100);
      screenBuilding.setDepth(-1);

      // Link landmark to screenBuilding to keep them synced in update
      screenBuilding.setData('linkedLandmark', landmark);

      // 3. TV Icon
      const tv = this.add.image(screenX, screenY - (config.screenBox.height/2) - 30, 'tv');
      tv.setDisplaySize(60, 45); // Make it slightly smaller
      tv.setDepth(1);
      this.tvs.add(tv);
    }
  }
  ```
- [ ] **Step 2: Update related logic**
  Add `private landmarksGroup!: Phaser.GameObjects.Group;` to the class properties.
  In `create()`, initialize it: `this.landmarksGroup = this.add.group();`.
  In `onVideoComplete`, clear the landmarks: `this.landmarksGroup.clear(true, true);`.
  In `update()`, sync the landmark x position with the `screenBuilding` x position, just like the TV:
  ```typescript
    this.screenBuildings.children.each((sb, index) => {
      const building = sb as Phaser.Physics.Arcade.Sprite;
      const tv = this.tvs.getChildren()[index] as Phaser.GameObjects.Image;
      const landmark = building.getData('linkedLandmark') as Phaser.GameObjects.Sprite;
      
      if (building) {
        if (tv) tv.x = building.x;
        if (landmark) {
           const config = LEVELS[this.currentLevel - 1];
           // Reverse the offset to find the landmark's true X based on the screen's X
           if (config) landmark.x = building.x - config.screenBox.x;
        }
      }
      return true;
    });
  ```
- [ ] **Step 3: Commit**
  ```bash
  git add src/game/scenes/MainScene.ts
  git commit -m "feat(game): refactor checkpoint spawning to use level-specific landmarks"
  ```

### Task 5: Refactor Level Progression and Boss Trigger

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Update `onVideoComplete` logic**
  Increment `this.currentLevel` *after* the video completes.
  Handle the Level 10 ending.
  ```typescript
    const onVideoComplete = (watchedSeconds: number = 0) => {
      if (!this.sys || !this.scene || !this.scene.manager) return;

      this.isPaused = false;
      this.scene.resume();
      GameEvents.emit('bgm-play');

      const timeBonus = watchedSeconds * 2;
      this.score += (50 + timeBonus);
      GameEvents.emit('score-changed', this.score);
      
      this.screenBuildings.clear(true, true);
      this.tvs.clear(true, true);
      if (this.landmarksGroup) this.landmarksGroup.clear(true, true);

      this.videosWatched++;
      
      if (this.currentLevel === 10) {
         // Video for Level 10 finished -> Game Over (Victory!)
         this.triggerGameOver();
         return;
      }
      
      this.currentLevel++;
      this.showLevelTitle();

      if (this.currentLevel === 10) {
        // Just started Level 10 -> Spawn Boss immediately instead of normal enemies
        this.isBossLevel = true;
        this.spawnBoss();
      }
    };
  ```
- [ ] **Step 2: Update `killEnemy` Boss Logic**
  When the Boss dies, do NOT trigger Game Over. Instead, allow the Level 10 checkpoint (Statue of Liberty) to spawn.
  ```typescript
  // Inside killEnemy
    if (enemy.getData('isBoss')) {
      this.isBossLevel = false;
      // Reset distance traveled so checkpoint spawns soon after boss dies
      this.distanceTraveled = this.checkpointThreshold - 1000; 
      return;
    }
  ```
- [ ] **Step 3: Prevent Enemy/Building Spawning during Level 10 after Boss dies**
  Ensure normal enemies and generic buildings don't spawn while flying to the final checkpoint.
  In `update()`, change:
  ```typescript
    if (time > this.lastEnemySpawn && !this.isBossLevel && this.currentLevel < 10) {
        this.spawnEnemy();
        // ...
    }
    if (time > this.lastBuildingSpawn && !this.isBossLevel && this.currentLevel < 10) {
        this.spawnBuilding();
        // ...
    }
  ```
- [ ] **Step 4: Commit**
  ```bash
  git add src/game/scenes/MainScene.ts
  git commit -m "feat(game): adjust boss and level 10 progression logic"
  ```
