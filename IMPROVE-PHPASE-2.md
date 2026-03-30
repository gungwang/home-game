# Plan: Dragon VS New York — Phase 2

## TL;DR
Expand weapon upgrades (fireballs to 7 levels with blue-fireball mechanic, missiles to 5 levels with dual-fire), add Hard mode, extend levels to 20 (Normal/Nightmare) and 15 (Hard), and add periodic small-dragon boss encounters every 5 levels. All changes are in `src/game/scenes/MainScene.ts` with minor UI updates.

---

## Phase A: Weapon System Overhaul

### Step 1 — Blue fireball support (foundation)
- In `handleFireballHit()` (~line 907): change hardcoded `10` damage to read from `fireball.getData('damage')`, defaulting to 10
- In `fireFireball()` (~line 873): after creating each fireball sprite, call `fireball.setData('damage', 10)` for normal fireballs
- For blue fireballs: `fireball.setTint(0x00ccff)` + `fireball.setData('damage', 20)` (double damage)
- No new assets needed — use programmatic tint on existing `fireball` texture

### Step 2 — Extend fireball levels from 4 → 7
- In `fireFireball()` (~line 873): extend the `if/else` chain:
  - Lv1: 1 normal fireball (unchanged)
  - Lv2: 2 normal fireballs (y ±10, unchanged)
  - Lv3: 3 normal fireballs (spread angles, unchanged)
  - Lv4: 5 normal fireballs (wider spread, unchanged)
  - Lv5: 5 fireballs — 1 blue (center) + 4 normal
  - Lv6: 5 fireballs — 2 blue (inner pair) + 3 normal
  - Lv7: 5 blue fireballs (all double damage)
- In `handleWeaponUpgradePickup()` (~line 1014): raise cap from `fireballLevel < 4` → `fireballLevel < 7`

### Step 3 — Extend missile levels from 4 → 5 with dual-fire
- In `fireMissile()` (~line 911): add Lv5 branch that spawns 2 missiles simultaneously (y offsets ±15, both using `missile_lv4` texture at Lv5 size)
- In `preload()`: no new texture needed — Lv5 reuses `missile_lv4` texture
- Size formula: `40 + (min(level,4)-1)*20` wide — cap visual scaling at Lv4
- Damage: `30 * 5 = 150` per missile (×2 missiles = 300 total per shot)
- In `handleMissileUpgradePickup()` (~line 1024): raise cap from `missileLevel < 4` → `missileLevel < 5`

### Step 4 — Nightmare weapon damage multiplier (triple)
- In `handleFireballHit()`: if `this.difficulty === 'NIGHTMARE'`, multiply fireball damage by 3
- In missile hit handler: if `this.difficulty === 'NIGHTMARE'`, multiply missile damage by 3
- This is a **player damage buff**, separate from the existing monster stat multipliers

---

## Phase B: Hard Mode

### Step 5 — Add Hard mode to difficulty selection
- In `showDifficultySelection()` (~line 447): add a third button for `'HARD'` mode
- Extend `this.difficulty` type to `'NORMAL' | 'NIGHTMARE' | 'HARD'`
- UI label: "HARD" with distinct color (e.g. orange/amber)

### Step 6 — Hard mode difficulty multipliers
- In `spawnEnemy()` (~line 1112): add Hard mode branches:
  - Monster health: ×2 (same as Nightmare)
  - Monster damage: ×2 (same as Nightmare)
  - Spawn count per wave: ×2 (2 chickens, 2 pigs, 2 cows — double all types)
- In enemy bullet logic (~line 1485): Hard mode uses same bullet patterns as Normal (no spread buff — differentiation is in monster stats/count, not bullet patterns)

---

## Phase C: Level Expansion & Boss Encounters

### Step 7 — Expand LEVELS array
- Extend `LEVELS` array (~line 72) from 10 → 20 entries
- Levels 11–20 reuse landmarks cyclically: `LEVELS[i] = LEVELS[i % 10]` (same name/landmark/video pattern)
- Add 10 new entries to `LEVEL_COLORS` array (~line 6) — cycle existing 10 colors
- For Hard mode: only the first 15 levels are used (controlled by max-level check)

### Step 8 — Mode-aware max level
- Add a `getMaxLevel()` helper returning: Normal → 20, Nightmare → 20, Hard → 15
- Replace all hardcoded level-10 checks:
  - Boss level trigger (~line 403): `currentLevel === 10` → final level check via `getMaxLevel()`
  - Game-over on final video (~line 391): `currentLevel >= 10` → `currentLevel >= getMaxLevel()`
  - Enemy spawn guard (~line 1126): `videosWatched >= 10` → `videosWatched >= getMaxLevel()`

### Step 9 — Small-dragon boss encounters every 5 levels
- Create `spawnSmallDragonBoss(count: number)` method:
  - Texture: `dragon-boss` with tint `0x66ffcc` (green tint to differentiate from big boss)
  - Size: 140×140 (smaller than big boss 200×200)
  - Health: 200 (Normal) / 400 (Nightmare/Hard)
  - Damage: 20
  - Points: 500
  - Behavior: `setImmovable(true)`, clamped to screen (same as big boss), **does not escape**
  - Flagged `isBoss: true` so existing boss-defeat logic counts them
- Boss encounter schedule (per mode):

  | Level | Normal/Nightmare | Hard |
  |-------|-----------------|------|
  | 5 | 1 small-dragon | 1 small-dragon |
  | 10 | 2 small-dragons | 2 small-dragons |
  | 15 | 3 small-dragons | 3 small-dragons + 2 big-boss (FINAL) |
  | 20 | 4 small-dragons + 2 big-boss (FINAL) | — |

- Trigger: on `currentLevel` reaching a multiple of 5, set `isBossLevel = true` and call the appropriate spawn function
- At the final level for each mode, also call `spawnBoss()` with 2 big-boss dragons alongside the small-dragons
- After all bosses defeated: same existing logic — reset `isBossLevel`, advance to final checkpoint

### Step 10 — Update existing spawnBoss() for final battle
- Modify `spawnBoss()` (~line 1193) to accept a `count` parameter instead of random 2–3
- For the final level: pass `count = 2` for big bosses
- Nightmare scales big boss count: `count * 3` (existing pattern)
- Remove the existing random count logic; boss count is now deterministic per level

---

## Relevant Files

- `src/game/scenes/MainScene.ts` — **Primary file**: all weapon logic, spawning, modes, levels, boss system
  - `fireFireball()` (~L873): fireball spawning & level logic
  - `handleFireballHit()` (~L907): fireball damage application
  - `fireMissile()` (~L911): missile spawning & level logic
  - `handleWeaponUpgradePickup()` (~L1014): fireball upgrade cap
  - `handleMissileUpgradePickup()` (~L1024): missile upgrade cap
  - `showDifficultySelection()` (~L447): mode selection UI
  - `spawnEnemy()` (~L1112): enemy spawning with mode multipliers
  - `spawnBoss()` (~L1193): boss spawning
  - `killEnemy()` (~L1040): boss defeat tracking
  - `LEVELS` array (~L72): level definitions
  - `LEVEL_COLORS` (~L6): per-level sky colors
  - `update()` (~L1389+): level progression, boss clamping, enemy shooting
  - `takeDamage()` (~L816): weapon downgrade on hit
- `src/components/UIOverlay.tsx` — May need update if weapon level display shows max (cosmetic)

---

## Verification

1. **Build check**: `npm run build` must pass with zero TypeScript errors
2. **Fireball levels**: Play Normal mode, collect weapon upgrades — verify Lv1–7 progression, blue tint appears at Lv5+, damage doubles confirmed via boss HP drain rate
3. **Missile levels**: Collect missile upgrades — verify Lv5 fires 2 missiles simultaneously
4. **Nightmare triple damage**: Start Nightmare, compare fireball/missile kill speed vs Normal — should kill ~3× faster
5. **Hard mode**: Verify Hard mode button appears, monsters have ×2 health/damage/count, 15 levels total
6. **Boss schedule**: In each mode, verify small-dragon boss spawns at levels 5/10/15(/20), correct count, stays on screen, green-tinted, smaller than big boss
7. **Final battle**: Verify final level spawns correct mix of small-dragons + big bosses, game ends after defeating all + watching final video
8. **Weapon downgrade**: Verify `takeDamage()` still correctly decrements levels (min 1) for the extended level ranges
9. **Level cycling**: Verify levels 11–20 properly reuse landmarks and colors without index errors

---

## Decisions

- **Lv5 fireball (gap in spec)**: Spec skips from Lv4 to Lv6. Plan fills Lv5 as transitional: 5 fireballs, 1 blue center — provides smooth upgrade progression
- **Small-dragon visual**: Green-tinted `dragon-boss` at 140×140 (vs big boss 200×200) — user confirmed "smaller & different tint"
- **Blue fireball**: Programmatic tint on existing sprite — user confirmed, no new assets
- **Hard mode bullet pattern**: Same as Normal (no spread) — differentiation is purely in monster stats/count
- **Landmarks for new levels**: Cycled from existing 10 — user confirmed
- **Nightmare weapon triple damage**: Applied as player-side multiplier, stacks with blue fireball's ×2 (a blue fireball in Nightmare = 10 × 2 × 3 = 60 damage)

---

## Further Considerations

1. **Weapon downgrade floor at Lv5+**: Currently, each hit drops weapon level by 1. With 7 levels, losing 1 level at Lv7 is gentle. Should death/respawn reset to Lv1, or keep as-is? **Recommendation**: keep current behavior (−1 per hit, min 1).
2. **Drop rate rebalancing**: With 7 fireball levels and 5 missile levels to reach, the current 4%/4% upgrade drop rates may feel grindy over 20 levels. Consider raising to 6% each, or increasing drop rate in later levels. **Recommendation**: address in a future balance pass after playtesting.
