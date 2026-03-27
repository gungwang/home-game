# 飞龙大战纽约 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 2D side-scrolling shooter web game featuring a dragon fighting mutant animals in cyberpunk New York, integrating YouTube video playback at checkpoints and ending with a resume display.

**Architecture:** React provides the UI shell (menus, HUD, YouTube modal, resume), while Phaser 3 handles the game canvas, physics, and rendering. Communication between React and Phaser is handled via custom events.

**Tech Stack:** React, TypeScript, Vite, Phaser 3, react-youtube, Tailwind CSS (for UI styling).

---

### Task 1: Project Setup and Dependencies

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

- [ ] **Step 1: Initialize Vite React TypeScript project**

```bash
npm create vite@latest home-game-2 -- --template react-ts
# Since we are already in home-game-2 directory, we should init inside it.
# Actually let's just create the files manually or use npm install.
npm init -y
npm install react react-dom phaser react-youtube
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

- [ ] **Step 2: Configure Tailwind CSS**

```bash
npx tailwindcss init -p
```
Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 3: Setup basic React entry point**

Modify `index.html` and `src/main.tsx` to mount the App. Add Tailwind imports to `src/index.css`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: setup project with react, typescript, phaser, and tailwind"
```

### Task 2: Phaser Game Instance and React Wrapper

**Files:**
- Create: `src/game/GameConfig.ts`
- Create: `src/game/scenes/MainScene.ts`
- Create: `src/components/GameCanvas.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Phaser MainScene**

```typescript
// src/game/scenes/MainScene.ts
import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // placeholders
  }

  create() {
    this.add.text(100, 100, 'Dragon Game Loaded', { fill: '#0f0' });
  }
}
```

- [ ] **Step 2: Create Phaser Config**

```typescript
// src/game/GameConfig.ts
import Phaser from 'phaser';
import MainScene from './scenes/MainScene';

export const getGameConfig = (parent: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: parent,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false
    }
  },
  scene: [MainScene]
});
```

- [ ] **Step 3: Create GameCanvas Component**

```typescript
// src/components/GameCanvas.tsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '../game/GameConfig';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(getGameConfig('phaser-container'));
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="phaser-container" className="flex justify-center items-center w-full h-screen bg-black" />;
}
```

- [ ] **Step 4: Integrate into App**

Modify `src/App.tsx` to render `<GameCanvas />`.

- [ ] **Step 5: Run dev server and verify**

Run: `npm run dev`
Verify "Dragon Game Loaded" is displayed in the browser.

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: integrate phaser with react component"
```

### Task 3: Dragon Movement and Attacks (Fireball & Missile)

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Add Dragon Sprite and Physics**

In `MainScene.ts`:
Create a colored rectangle/sprite for the dragon. Enable cursor keys (WASD). Implement `update()` for 8-way movement.

- [ ] **Step 2: Implement Light Attack (Fireball)**

Create a `Fireballs` group. On left mouse click, fire a fast, straight projectile (infinite ammo).

- [ ] **Step 3: Implement Heavy Attack (Missile)**

Create a `Missiles` group. Add a `missileAmmo` property to the dragon (start with 3). On right click, if ammo > 0, fire a larger, slower projectile that deals area damage or pierces, and decrement ammo.

- [ ] **Step 4: Verify Mechanics**

Run dev server. Ensure WASD moves the dragon, left click shoots fireballs, right click shoots limited missiles.

- [ ] **Step 5: Commit**

```bash
git add src/game/scenes/MainScene.ts
git commit -m "feat: add dragon movement, light and heavy attacks"
```

### Task 4: Event Emitter for React-Phaser Communication

**Files:**
- Create: `src/game/GameEvents.ts`
- Modify: `src/game/scenes/MainScene.ts`
- Create: `src/components/UIOverlay.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create GameEvents**

```typescript
// src/game/GameEvents.ts
import Phaser from 'phaser';
export const GameEvents = new Phaser.Events.EventEmitter();
```

- [ ] **Step 2: Emit state from Phaser**

In `MainScene.ts`, emit events for score and missile ammo changes: `GameEvents.emit('score-changed', newScore)` and `GameEvents.emit('ammo-changed', newAmmo)`.

- [ ] **Step 3: Create UIOverlay Component**

```typescript
// src/components/UIOverlay.tsx
import { useEffect, useState } from 'react';
import { GameEvents } from '../game/GameEvents';

export default function UIOverlay() {
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(3);

  useEffect(() => {
    GameEvents.on('score-changed', setScore);
    GameEvents.on('ammo-changed', setAmmo);
    return () => {
      GameEvents.off('score-changed', setScore);
      GameEvents.off('ammo-changed', setAmmo);
    };
  }, []);

  return (
    <div className="absolute top-4 left-4 text-white text-2xl font-mono space-y-2">
      <div>Score: {score}</div>
      <div>Missiles: {ammo}</div>
    </div>
  );
}
```

- [ ] **Step 4: Add UIOverlay to App**

Wrap `GameCanvas` and `UIOverlay` in `App.tsx`.

- [ ] **Step 5: Commit**

```bash
git add src/
git commit -m "feat: establish ui overlay with score and ammo tracking"
```

### Task 5: Enemies, Collisions, and Ammo Drops

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Add Enemies**

Create an `Enemies` physics group. Spawn enemies periodically on the right side moving left. Give them health properties (e.g., small enemies 1 HP, large 3 HP).

- [ ] **Step 2: Handle Weapon Collisions**

Add collisions between `Fireballs` and `Enemies` (1 damage) and `Missiles` and `Enemies` (3 damage/AOE). Update score on kill.

- [ ] **Step 3: Handle Player Damage**

Add collision between player and enemies. Reduce player health (add to UI if desired, or just flash red for now).

- [ ] **Step 4: Add Ammo Drops**

Occasionally, when an enemy dies, spawn an `AmmoCrate`. If the player collides with it, increase `missileAmmo` and emit `ammo-changed`.

- [ ] **Step 5: Commit**

```bash
git add src/game/scenes/MainScene.ts
git commit -m "feat: implement enemies, health, weapon damage, and ammo drops"
```

### Task 6: Parallax Background, Weather, and Interactive Buildings

**Files:**
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Setup Parallax TileSprites**

Add multiple `Phaser.GameObjects.TileSprite` for background layers (sky, far/near buildings) using cyberpunk neon colors. Update `tilePositionX` in `update()`.

- [ ] **Step 2: Add Weather/Day-Night Particles**

Create a `Phaser.GameObjects.Particles.ParticleEmitter` for rain/snow or neon dust to add atmosphere. Use a tween on the sky layer's tint to simulate day/night transitions over time.

- [ ] **Step 3: Interactive Buildings (Obstacles)**

Periodically spawn a `Building` physics object with gaps (like Flappy Bird pipes but wider). The player must fly through the gap. Colliding with the building wall should bounce or damage the player.

- [ ] **Step 4: Commit**

```bash
git add src/game/scenes/MainScene.ts
git commit -m "feat: add parallax background, weather effects, and building obstacles"
```

### Task 7: YouTube Video Checkpoints

**Files:**
- Create: `src/components/VideoModal.tsx`
- Modify: `src/App.tsx`
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Create VideoModal**

Use `react-youtube`.
```typescript
// src/components/VideoModal.tsx
import YouTube, { YouTubeProps } from 'react-youtube';

export default function VideoModal({ videoId, onComplete }: { videoId: string, onComplete: () => void }) {
  const opts: YouTubeProps['opts'] = { height: '390', width: '640', playerVars: { autoplay: 1 } };
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="relative border-4 border-cyan-500 shadow-[0_0_20px_#0ff]">
        <YouTube videoId={videoId} opts={opts} onEnd={onComplete} />
        <button onClick={onComplete} className="absolute -top-12 right-0 bg-red-600 px-4 py-2 font-mono text-white">Skip</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Trigger Checkpoint from Phaser**

In `MainScene.ts`, track time or distance. Every 3 minutes (or fixed distance), spawn a special `ScreenBuilding`. When it reaches the center, pause the game and emit `GameEvents.emit('show-video', 'dQw4w9WgXcQ')` (randomize ID from a list later).

- [ ] **Step 3: Handle State and Resume**

In `App.tsx`, listen for `show-video` to display `VideoModal`. On complete/skip, hide modal and emit `video-complete` (add points for watching). In `MainScene.ts`, resume the scene on `video-complete`.

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: integrate youtube video checkpoints at building screens"
```

### Task 8: Ending & Resume Screen

**Files:**
- Create: `src/components/ResumeScreen.tsx`
- Modify: `src/App.tsx`
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Create ResumeScreen**

A React component showing "Game Completed!" and mock resume data (Name, Skills, Experience) with cyberpunk styling (neon text, scanlines).

- [ ] **Step 2: Trigger Game Over/Victory**

In `MainScene.ts`, after 5 checkpoints (or final boss), emit `GameEvents.emit('game-over')`.

- [ ] **Step 3: Handle Transition in App**

Listen for `game-over`. Fade out `GameCanvas` and show `ResumeScreen`.

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "feat: add cyberpunk resume display on game completion"
```