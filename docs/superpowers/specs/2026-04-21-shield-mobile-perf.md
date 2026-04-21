# 2026-04-21 — Shield Skill, Mobile Controls & Performance Fixes

## 1. Mobile Controls Overhaul

### Goals
- Buttons 25% smaller
- D-pad buttons edge-by-edge (no gap)
- Sticky to screen corners
- Full 8-directional movement (diagonals: 45°, 135°, -45°, -135°)
- Action buttons (🔥 shoot, 🚀 missile) closer together, sticky to bottom-right

### Problem with old approach
Each arrow button had its own `onTouchStart`/`onTouchEnd`. The parent container had a global `onTouchEnd={clearAllDirections}`, which fired when _any_ finger lifted — killing both directions in a diagonal hold.

### Solution: Joystick-style angle detection
The entire d-pad cross area is one unified touch zone. On every `touchstart` / `touchmove`:
1. Compute `dx`, `dy` from touch point to d-pad centre
2. Calculate `angle = atan2(dy, dx)` in degrees
3. Map angle ranges to direction combinations:

| Angle range | Directions emitted |
|---|---|
| -67.5° to +67.5° | `right` |
| +112.5° to +180° or -180° to -112.5° | `left` |
| +22.5° to +157.5° | `down` |
| -157.5° to -22.5° | `up` |

Combinations overlap at 45° boundaries, so e.g. at 45° both `right` and `down` emit → diagonal movement.

A dead zone of 8px radius around centre suppresses micro-jitter.

### Size & position changes
| Element | Before | After |
|---|---|---|
| D-pad button | `w-16 h-16` (64px) | `w-12 h-12` (48px) |
| D-pad container | `13rem × 13rem`, `bottom-6 left-4` | `9rem × 9rem`, `bottom-1 left-1` |
| Grid gap | `gap-1` | `gap-0` (edge-by-edge) |
| Missile button | 4.5rem, `bottom-8 right-4` | 3.25rem, `bottom-1 right-1` |
| Fireball button | 5.5rem | 3.75rem |
| Action gap | `gap-4` | `gap-1` |

### Files changed
- `src/components/MobileControls.tsx`

---

## 2. Invincible Shield Skill

### Design spec
- **HARD and NIGHTMARE modes only**
- Player collects shield packs dropped by enemies
- Activating the shield grants full invincibility for a duration based on current level
- During invincibility: no HP damage, no weapon level downgrade
- Visual: shining cyan half-circle (semi-dome) fixed to the **right side** of the dragon

### Shield duration by level

| Levels | Duration |
|---|---|
| 1–3 | 1 second |
| 4–6 | 2 seconds |
| 7–9 | 3 seconds |
| 10–12 | 4 seconds |
| Last 3 levels | 5 seconds |

Formula: `Math.min(1 + Math.floor((currentLevel - 1) / 3), 4) * 1000` ms, clamped to 5000 ms for last 3 levels.

### Trigger inputs
| Platform | Trigger |
|---|---|
| Desktop | Left mouse button + Right mouse button simultaneously |
| Mobile | 🔥 (fireball) button + 🚀 (missile) button simultaneously |

Desktop: tracks held mouse buttons via `mouseButtons: Set<number>` — both 0 and 2 present → activate.  
Mobile: `actionHeld` ref in `MobileControls.tsx` — both `fireball` and `missile` flags set within same press window → emits `touch-shield` GameEvent.

### Drop rate
| Drop | Probability |
|---|---|
| Weapon upgrade | 4% |
| Missile upgrade | 4% |
| Health pack | 10% |
| Ammo crate | 12% |
| **Shield pack** | **~2% (HARD/NIGHTMARE only)** |

### Visual implementation
A `Phaser.GameObjects.Graphics` object (`shieldGraphic`) is drawn **once** in local coordinates when the shield activates, then repositioned each frame via `setPosition(dragon.x, dragon.y)` — no per-frame redraw.

Layers drawn (local origin = dragon centre):
1. Outer glow ring: 6px cyan, 30% alpha, `r + 4`
2. Main arc: 3px `#00eeff`, 90% alpha, `r`
3. Inner shimmer: 1.5px white, 60% alpha, `r - 5`
4. Fill: faint cyan `0x00ccff`, 8% alpha

A pulsing tween animates `alpha: 0.5 → 1 → 0.5` (yoyo, 220ms period) on the Graphics object.

### New asset
`public/shield_pack.svg` — cyan shield icon (32×32) with cross symbol and sparkle dot, used as the pickup sprite.

### Pool pre-warming
4 shield pack sprites are pre-allocated during `create()` (`disableBody(true, true)`) so the first drop doesn't trigger a GC spike mid-game.

### GameEvent flow
```
enemy dies → spawnShieldPack() → player overlaps → handleShieldPickup()
  → shieldCount++ → GameEvents.emit('shields-changed', n)  [→ UIOverlay]

player triggers → activateShield()
  → shieldCount-- → isShieldActive = true → drawShieldArcLocal()
  → time.delayedCall(duration) → isShieldActive = false, clear arc
```

### Files changed
- `src/game/scenes/MainScene.ts`
- `src/components/MobileControls.tsx`
- `src/components/UIOverlay.tsx`
- `public/shield_pack.svg` (new)

---

## 3. Weapon/Missile Downgrade Floor (HARD / NIGHTMARE)

### Behaviour
In HARD and NIGHTMARE modes, taking damage no longer degrades weapons below level 2. Once a weapon reaches lv2+, that upgrade is protected.

### Implementation
```ts
const weaponFloor = (this.difficulty === 'HARD' || this.difficulty === 'NIGHTMARE') ? 2 : 1;
if (this.fireballLevel > weaponFloor) this.fireballLevel--;
if (this.missileLevel > weaponFloor) this.missileLevel--;
```

### Files changed
- `src/game/scenes/MainScene.ts` — `takeDamage()`

---

## 4. Performance Fixes

### Problem 1 — `applyEnvironmentStyle()` every frame
`applyEnvironmentStyle()` called `setTint()` + `setAlpha()` on 5 TileSprite/Image objects unconditionally 60× per second.

**Fix:** Move inside the state-change `if (currentEnvState !== prevEnvState)` block. Now runs ~4× per minute instead of 3,600×.

### Problem 2 — Shield arc redrawn every frame
`drawShieldArc()` executed `g.clear()` + 4 `arc()` + 1 `fillPath()` calls every single frame while shield was active. This is a full GPU path rebuild each tick.

**Fix:** Draw once in local coordinates on activation (`drawShieldArcLocal()`). In `update()`, only call `shieldGraphic.setPosition(dragon.x, dragon.y)` — a single property write.

### Problem 3 — Shield pack first-spawn GC stutter
`shieldPacks.get()` had zero pre-warmed entries. The first drop forced `new Phaser.Physics.Arcade.Sprite()` + physics body allocation mid-frame.

**Fix:** Pre-warm 4 sprites in `create()`:
```ts
for (let i = 0; i < 4; i++) {
  const s = this.shieldPacks.get(-2000, -2000);
  if (s) { s.setTexture('shield_pack'); s.setDisplaySize(28, 28); s.disableBody(true, true); }
}
```

### Problem 4 — Unbounded enemy accumulation
NIGHTMARE swarm spawns 3–5 rats + 2–3 normal enemies per interval with no ceiling. Could accumulate 50+ active physics bodies, all updating per frame.

**Fix:** Gate `spawnEnemy()` on `this.enemies.countActive() < 28`.

### Files changed
- `src/game/scenes/MainScene.ts` — `update()`, `activateShield()`, `create()`

---

## 5. YouTube Videos Refactor

### Problem
`YOUTUBE_VIDEOS` array was duplicated in two files:
- `src/components/BackgroundMusicPlayer.tsx` (as `const YOUTUBE_VIDEOS`)
- `src/game/scenes/MainScene.ts` (as `private youtubeVideos = [...]`)

### Solution
Extracted to a single shared module:

**`src/game/youtubeVideos.ts`**
```ts
export const YOUTUBE_VIDEOS = [ /* 55 video IDs */ ];
```

Both consumers import from this module. To add/remove videos, edit only `youtubeVideos.ts`.

### Files changed
- `src/game/youtubeVideos.ts` (new)
- `src/components/BackgroundMusicPlayer.tsx`
- `src/game/scenes/MainScene.ts`

---

## 6. Bug Fix — Shield Pickup Crash

### Root cause
`handleShieldPickup()` called `this.showFloatingText(...)` — a method that does not exist in `MainScene`. The moment the dragon overlapped a shield pack, Phaser threw `TypeError: this.showFloatingText is not a function`, crashing the Phaser `update()` loop and halting the game.

### Fix
Replaced with the same tint-flash feedback used by all other pickup handlers:
```ts
this.dragon.setTint(0xaaffff);
this.time.delayedCall(250, () => this.dragon.clearTint());
```

### Files changed
- `src/game/scenes/MainScene.ts` — `handleShieldPickup()`

---

## Commit Log

| Commit | File | Message |
|---|---|---|
| `5cc4b0a` | `public/shield_pack.svg` | feat: add shield_pack.svg asset for shield pickup drop |
| `35016bf` | `src/game/youtubeVideos.ts` | refactor: extract YOUTUBE_VIDEOS into shared youtubeVideos.ts module |
| `ad4fee1` | `src/components/BackgroundMusicPlayer.tsx` | refactor: import YOUTUBE_VIDEOS from shared youtubeVideos module |
| `1ebe3bd` | `src/components/UIOverlay.tsx` | feat: display shield count in UIOverlay HUD |
| `03d10ed` | `src/components/MobileControls.tsx` | feat: shrink d-pad, joystick 8-dir movement, shield combo trigger on mobile |
| `edeb881` | `src/game/scenes/MainScene.ts` | feat: add invincible shield skill, perf fixes, weapon floor for HARD/NIGHTMARE |
| `597480a` | `package.json` | chore: update package.json |
