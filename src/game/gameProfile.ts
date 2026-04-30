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

export const GAME_PROFILE_STORAGE_KEY = 'dragon-game-profile'

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reducedEffects: false,
  reducedMotion: false,
  assistMode: false,
  showControlHints: true,
  onboardingSeen: false,
}

const DEFAULT_UNLOCKS: ProgressUnlock[] = [
  {
    id: 'reserve-cache',
    name: 'Reserve Cache',
    description: 'Earn a total of 2,000 points across all runs.',
    reward: 'Start each new run with +2 missiles.',
    metric: 'lifetimeScore',
    target: 2000,
    value: 0,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'drake-armor',
    name: 'Drake Armor',
    description: 'Reach level 5 in any run.',
    reward: 'Start each new run with +15 max HP.',
    metric: 'highestLevel',
    target: 5,
    value: 0,
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'aether-core',
    name: 'Aether Core',
    description: 'Defeat your first boss.',
    reward: 'Start each new run at fireball level 2.',
    metric: 'bossesDefeated',
    target: 1,
    value: 0,
    unlocked: false,
    unlockedAt: null,
  },
]

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

function mergeUnlocks(unlocks: ProgressUnlock[] | undefined, progression: ProgressionProfile): ProgressUnlock[] {
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

    const unlocked = storedUnlock.unlocked || metricValue >= defaultUnlock.target

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
  progression.unlocks = mergeUnlocks(progressionCandidate.unlocks, progression)

  return {
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
  const unlockedIds = new Set(
    profile.progression.unlocks.filter((unlock) => unlock.unlocked).map((unlock) => unlock.id),
  )

  return {
    startingMissiles: unlockedIds.has('reserve-cache') ? 2 : 0,
    startingMaxHealth: unlockedIds.has('drake-armor') ? 15 : 0,
    startingFireballLevels: unlockedIds.has('aether-core') ? 1 : 0,
  }
}

export function getNextUnlock(profile: GameProfile): ProgressUnlock | null {
  return profile.progression.unlocks.find((unlock) => !unlock.unlocked) ?? null
}