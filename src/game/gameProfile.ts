export type Difficulty = 'NORMAL' | 'HARD' | 'NIGHTMARE'

export interface AccessibilitySettings {
  reducedEffects: boolean
  reducedMotion: boolean
  assistMode: boolean
  showControlHints: boolean
  onboardingSeen: boolean
}

export interface ProgressUnlock {
  id: 'reserve-cache' | 'drake-armor' | 'aether-core'
  name: string
  description: string
  reward: string
  bonus: Partial<ProfileBonuses>
  metric: 'lifetimeScore' | 'highestLevel' | 'bossesDefeated'
  target: number
  value: number
  unlocked: boolean
  unlockedAt: string | null
}

export interface ProgressionProfile {
  totalRuns: number
  lifetimeScore: number
  highestLevel: number
  bossesDefeated: number
  videosWatched: number
  lastRunScore: number
  unlocks: ProgressUnlock[]
}

export interface GameProfile {
  progressionPreset: ProgressionPresetName
  settings: AccessibilitySettings
  progression: ProgressionProfile
}

export interface RunSummary {
  score: number
  levelReached: number
  bossesDefeated: number
  videosWatched: number
  difficulty: Difficulty
}

export interface ProfileBonuses {
  startingMissiles: number
  startingMaxHealth: number
  startingFireballLevels: number
}

interface ProgressUnlockTemplate {
  id: ProgressUnlock['id']
  name: string
  description: string
  metric: ProgressUnlock['metric']
  target: number
  bonus: Partial<ProfileBonuses>
}

export type ProgressionPresetName = 'casual' | 'returning-player' | 'arcade'

export const GAME_PROFILE_STORAGE_KEY = 'dragon-game-profile'
export const GAME_PROGRESS_PRESET_OVERRIDE_STORAGE_KEY = 'dragon-game-progression-preset-override'

const FALLBACK_PROGRESSION_PRESET: ProgressionPresetName = 'returning-player'

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedEffects: false,
  reducedMotion: false,
  assistMode: false,
  showControlHints: true,
  onboardingSeen: false,
}

function isProgressionPresetName(value: unknown): value is ProgressionPresetName {
  return value === 'casual' || value === 'returning-player' || value === 'arcade'
}

function readProgressionPresetOverride(): ProgressionPresetName | null {
  if (typeof window === 'undefined') {
    return null
  }

  const override = window.localStorage.getItem(GAME_PROGRESS_PRESET_OVERRIDE_STORAGE_KEY)
  return isProgressionPresetName(override) ? override : null
}

function readConfiguredProgressionPreset(): ProgressionPresetName {
  const override = readProgressionPresetOverride()
  if (override) {
    return override
  }

  const envPreset = import.meta.env.VITE_PROGRESSION_PRESET
  if (isProgressionPresetName(envPreset)) {
    return envPreset
  }

  return FALLBACK_PROGRESSION_PRESET
}

export const ACTIVE_PROGRESSION_PRESET: ProgressionPresetName = readConfiguredProgressionPreset()

function describeUnlockBonus(bonus: Partial<ProfileBonuses>): string {
  if (bonus.startingMissiles) {
    return `Start each new run with +${bonus.startingMissiles} missiles.`
  }

  if (bonus.startingMaxHealth) {
    return `Start each new run with +${bonus.startingMaxHealth} max HP.`
  }

  if (bonus.startingFireballLevels) {
    return `Start each new run at fireball level ${1 + bonus.startingFireballLevels}.`
  }

  return 'Persistent reward unlocked.'
}

function createProgressUnlock(template: ProgressUnlockTemplate): ProgressUnlock {
  return {
    ...template,
    reward: describeUnlockBonus(template.bonus),
    value: 0,
    unlocked: false,
    unlockedAt: null,
  }
}

const PROGRESSION_PRESET_TEMPLATES: Record<ProgressionPresetName, ProgressUnlockTemplate[]> = {
  casual: [
    {
      id: 'reserve-cache',
      name: 'Reserve Cache',
      description: 'Earn a total of 600 points across all runs.',
      metric: 'lifetimeScore',
      target: 600,
      bonus: { startingMissiles: 3 },
    },
    {
      id: 'drake-armor',
      name: 'Drake Armor',
      description: 'Reach level 3 in any run.',
      metric: 'highestLevel',
      target: 3,
      bonus: { startingMaxHealth: 25 },
    },
    {
      id: 'aether-core',
      name: 'Aether Core',
      description: 'Defeat your first boss.',
      metric: 'bossesDefeated',
      target: 1,
      bonus: { startingFireballLevels: 1 },
    },
  ],
  'returning-player': [
    {
      id: 'reserve-cache',
      name: 'Reserve Cache',
      description: 'Earn a total of 900 points across all runs.',
      metric: 'lifetimeScore',
      target: 900,
      bonus: { startingMissiles: 2 },
    },
    {
      id: 'drake-armor',
      name: 'Drake Armor',
      description: 'Reach level 4 in any run.',
      metric: 'highestLevel',
      target: 4,
      bonus: { startingMaxHealth: 20 },
    },
    {
      id: 'aether-core',
      name: 'Aether Core',
      description: 'Defeat 2 bosses across all runs.',
      metric: 'bossesDefeated',
      target: 2,
      bonus: { startingFireballLevels: 1 },
    },
  ],
  arcade: [
    {
      id: 'reserve-cache',
      name: 'Reserve Cache',
      description: 'Earn a total of 1500 points across all runs.',
      metric: 'lifetimeScore',
      target: 1500,
      bonus: { startingMissiles: 1 },
    },
    {
      id: 'drake-armor',
      name: 'Drake Armor',
      description: 'Reach level 6 in any run.',
      metric: 'highestLevel',
      target: 6,
      bonus: { startingMaxHealth: 15 },
    },
    {
      id: 'aether-core',
      name: 'Aether Core',
      description: 'Defeat 3 bosses across all runs.',
      metric: 'bossesDefeated',
      target: 3,
      bonus: { startingFireballLevels: 1 },
    },
  ],
}

function getPresetUnlocks(preset: ProgressionPresetName = ACTIVE_PROGRESSION_PRESET): ProgressUnlock[] {
  return PROGRESSION_PRESET_TEMPLATES[preset].map((template) => createProgressUnlock(template))
}

const DEFAULT_UNLOCKS: ProgressUnlock[] = getPresetUnlocks()

const DEFAULT_PROGRESSION: ProgressionProfile = {
  totalRuns: 0,
  lifetimeScore: 0,
  highestLevel: 1,
  bossesDefeated: 0,
  videosWatched: 0,
  lastRunScore: 0,
  unlocks: DEFAULT_UNLOCKS,
}

export function getDefaultGameProfile(): GameProfile {
  return {
    progressionPreset: ACTIVE_PROGRESSION_PRESET,
    settings: { ...DEFAULT_SETTINGS },
    progression: {
      ...DEFAULT_PROGRESSION,
      unlocks: DEFAULT_UNLOCKS.map((unlock) => ({ ...unlock })),
    },
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function mergeUnlocks(
  unlocks: ProgressUnlock[] | undefined,
  progression: ProgressionProfile,
  preserveStoredUnlockedState: boolean,
): ProgressUnlock[] {
  const unlockMap = new Map((unlocks ?? []).map((unlock) => [unlock.id, unlock]))

  return DEFAULT_UNLOCKS.map((defaultUnlock) => {
    const storedUnlock = unlockMap.get(defaultUnlock.id)
    const metricValue = progression[defaultUnlock.metric]

    if (!storedUnlock) {
      return {
        ...defaultUnlock,
        value: metricValue,
        unlocked: metricValue >= defaultUnlock.target,
        unlockedAt: metricValue >= defaultUnlock.target ? new Date().toISOString() : null,
      }
    }

    const unlocked = (preserveStoredUnlockedState && storedUnlock.unlocked) || metricValue >= defaultUnlock.target

    return {
      ...defaultUnlock,
      value: Math.max(metricValue, storedUnlock.value ?? 0),
      unlocked,
      unlockedAt: unlocked ? storedUnlock.unlockedAt ?? new Date().toISOString() : null,
    }
  })
}

export function sanitizeGameProfile(input: unknown): GameProfile {
  const defaults = getDefaultGameProfile()

  if (!input || typeof input !== 'object') {
    return defaults
  }

  const candidate = input as Partial<GameProfile>
  const settings = (candidate.settings ?? {}) as Partial<AccessibilitySettings>
  const progressionCandidate = (candidate.progression ?? {}) as Partial<ProgressionProfile>
  const storedPreset = isProgressionPresetName(candidate.progressionPreset)
    ? candidate.progressionPreset
    : ACTIVE_PROGRESSION_PRESET

  const progression: ProgressionProfile = {
    totalRuns: Number(progressionCandidate.totalRuns ?? defaults.progression.totalRuns) || defaults.progression.totalRuns,
    lifetimeScore: Number(progressionCandidate.lifetimeScore ?? defaults.progression.lifetimeScore) || defaults.progression.lifetimeScore,
    highestLevel: Number(progressionCandidate.highestLevel ?? defaults.progression.highestLevel) || defaults.progression.highestLevel,
    bossesDefeated: Number(progressionCandidate.bossesDefeated ?? defaults.progression.bossesDefeated) || defaults.progression.bossesDefeated,
    videosWatched: Number(progressionCandidate.videosWatched ?? defaults.progression.videosWatched) || defaults.progression.videosWatched,
    lastRunScore: Number(progressionCandidate.lastRunScore ?? defaults.progression.lastRunScore) || defaults.progression.lastRunScore,
    unlocks: [],
  }

  progression.highestLevel = Math.max(1, progression.highestLevel)
  progression.totalRuns = Math.max(0, progression.totalRuns)
  progression.lifetimeScore = Math.max(0, progression.lifetimeScore)
  progression.bossesDefeated = Math.max(0, progression.bossesDefeated)
  progression.videosWatched = Math.max(0, progression.videosWatched)
  progression.lastRunScore = Math.max(0, progression.lastRunScore)
  progression.unlocks = mergeUnlocks(
    progressionCandidate.unlocks,
    progression,
    storedPreset === ACTIVE_PROGRESSION_PRESET,
  )

  return {
    progressionPreset: ACTIVE_PROGRESSION_PRESET,
    settings: {
      reducedEffects: Boolean(settings.reducedEffects ?? defaults.settings.reducedEffects),
      reducedMotion: Boolean(settings.reducedMotion ?? defaults.settings.reducedMotion),
      assistMode: Boolean(settings.assistMode ?? defaults.settings.assistMode),
      showControlHints: Boolean(settings.showControlHints ?? defaults.settings.showControlHints),
      onboardingSeen: Boolean(settings.onboardingSeen ?? defaults.settings.onboardingSeen),
    },
    progression,
  }
}

export function loadGameProfile(): GameProfile {
  const storage = getStorage()
  if (!storage) {
    return getDefaultGameProfile()
  }

  const rawProfile = storage.getItem(GAME_PROFILE_STORAGE_KEY)
  if (!rawProfile) {
    return getDefaultGameProfile()
  }

  try {
    return sanitizeGameProfile(JSON.parse(rawProfile))
  } catch {
    return getDefaultGameProfile()
  }
}

export function saveGameProfile(profile: GameProfile): GameProfile {
  const sanitizedProfile = sanitizeGameProfile(profile)
  const storage = getStorage()

  if (storage) {
    storage.setItem(GAME_PROFILE_STORAGE_KEY, JSON.stringify(sanitizedProfile))
  }

  return sanitizedProfile
}

export function updateProfileSettings(
  profile: GameProfile,
  updates: Partial<AccessibilitySettings>,
): GameProfile {
  return saveGameProfile({
    ...profile,
    settings: {
      ...profile.settings,
      ...updates,
    },
  })
}

export function applyRunSummaryToProfile(profile: GameProfile, summary: RunSummary): GameProfile {
  const nextProfile = sanitizeGameProfile({
    ...profile,
    progression: {
      ...profile.progression,
      totalRuns: profile.progression.totalRuns + 1,
      lifetimeScore: profile.progression.lifetimeScore + Math.max(0, summary.score),
      highestLevel: Math.max(profile.progression.highestLevel, summary.levelReached),
      bossesDefeated: profile.progression.bossesDefeated + Math.max(0, summary.bossesDefeated),
      videosWatched: profile.progression.videosWatched + Math.max(0, summary.videosWatched),
      lastRunScore: Math.max(0, summary.score),
      unlocks: profile.progression.unlocks,
    },
  })

  return saveGameProfile(nextProfile)
}

export function getProfileBonuses(profile: GameProfile): ProfileBonuses {
  return profile.progression.unlocks.reduce<ProfileBonuses>((bonuses, unlock) => {
    if (!unlock.unlocked) {
      return bonuses
    }

    bonuses.startingMissiles += unlock.bonus.startingMissiles ?? 0
    bonuses.startingMaxHealth += unlock.bonus.startingMaxHealth ?? 0
    bonuses.startingFireballLevels += unlock.bonus.startingFireballLevels ?? 0
    return bonuses
  }, {
    startingMissiles: 0,
    startingMaxHealth: 0,
    startingFireballLevels: 0,
  })
}

export function getNextUnlock(profile: GameProfile): ProgressUnlock | null {
  return profile.progression.unlocks.find((unlock) => !unlock.unlocked) ?? null
}