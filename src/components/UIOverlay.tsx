import { useEffect, useState } from 'react';
import { GameEvents } from '../game/GameEvents';
import { getNextUnlock, type Difficulty, type GameProfile } from '../game/gameProfile';

const PROGRESS_PANEL_STORAGE_KEY = 'dragon-game-show-progress-panel';
const CONTROLS_PANEL_STORAGE_KEY = 'dragon-game-show-controls-panel';

function readPanelVisibility(storageKey: string): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(storageKey) !== 'false';
}

interface UIOverlayProps {
  profile: GameProfile;
}

interface WeaponState {
  fireballLevel: number;
  missileLevel: number;
}

export default function UIOverlay({ profile }: UIOverlayProps) {
  const showDevPresetLabel = import.meta.env.DEV;
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(3);
  const [health, setHealth] = useState(100);
  const [shields, setShields] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [weaponState, setWeaponState] = useState<WeaponState>({ fireballLevel: 1, missileLevel: 1 });
  const [bossWarning, setBossWarning] = useState('');
  const [showProgressPanel, setShowProgressPanel] = useState(() => readPanelVisibility(PROGRESS_PANEL_STORAGE_KEY));
  const [showControlsPanel, setShowControlsPanel] = useState(() => readPanelVisibility(CONTROLS_PANEL_STORAGE_KEY));

  const unlockedCount = profile.progression.unlocks.filter((unlock) => unlock.unlocked).length;
  const nextUnlock = getNextUnlock(profile);
  const nextUnlockProgress = nextUnlock
    ? Math.min(100, Math.round((nextUnlock.value / nextUnlock.target) * 100))
    : 100;
  const activeAssistBadges = [
    profile.settings.assistMode ? 'ASSIST' : null,
    profile.settings.reducedEffects ? 'FX CALM' : null,
    profile.settings.reducedMotion ? 'MOTION LIGHT' : null,
  ].filter(Boolean);

  useEffect(() => {
    const handleWeaponState = (nextState: WeaponState) => {
      setWeaponState(nextState);
    };

    GameEvents.on('score-changed', setScore);
    GameEvents.on('ammo-changed', setAmmo);
    GameEvents.on('health-changed', setHealth);
    GameEvents.on('shields-changed', setShields);
    GameEvents.on('level-changed', setCurrentLevel);
    GameEvents.on('difficulty-changed', setDifficulty);
    GameEvents.on('weapon-state-changed', handleWeaponState);
    GameEvents.on('boss-warning', setBossWarning);
    return () => {
      GameEvents.off('score-changed', setScore);
      GameEvents.off('ammo-changed', setAmmo);
      GameEvents.off('health-changed', setHealth);
      GameEvents.off('shields-changed', setShields);
      GameEvents.off('level-changed', setCurrentLevel);
      GameEvents.off('difficulty-changed', setDifficulty);
      GameEvents.off('weapon-state-changed', handleWeaponState);
      GameEvents.off('boss-warning', setBossWarning);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(PROGRESS_PANEL_STORAGE_KEY, String(showProgressPanel));
  }, [showProgressPanel]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CONTROLS_PANEL_STORAGE_KEY, String(showControlsPanel));
  }, [showControlsPanel]);

  return (
    <div className="absolute inset-0 pointer-events-none text-white font-mono">
      {bossWarning && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded border border-amber-400/70 bg-transparent px-4 py-2 text-center text-xs sm:text-sm md:text-lg uppercase tracking-[0.3em] text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.25)]">
          {bossWarning}
        </div>
      )}

      <div
        className="absolute top-2 left-2 min-w-[170px] rounded-lg border border-cyan-500/20 bg-transparent px-3 py-2 text-white shadow-none"
        style={{ fontSize: 'clamp(9px, 1.35vw, 16px)', lineHeight: 1.22 }}
      >
        <div className="mb-2 flex items-center justify-between gap-3 border-b border-cyan-500/10 pb-1 text-[9px] uppercase tracking-[0.22em] text-cyan-200/75 sm:text-[10px]">
          <span>Status</span>
          <span>{difficulty}</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3 text-pink-400">
            <span>HP</span>
            <span>{health}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-cyan-300">
            <span>Score</span>
            <span>{score.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-yellow-300">
            <span>Missiles</span>
            <span>{ammo}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[0.96em]">
            <div className="text-violet-200">Lv {currentLevel}</div>
            <div className="text-orange-300">Fire {weaponState.fireballLevel}</div>
            <div className="text-emerald-300">Mode {difficulty === 'NIGHTMARE' ? 'N.M.' : difficulty}</div>
            <div className="text-amber-200">Miss {weaponState.missileLevel}</div>
          </div>
          {shields > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-cyan-500/10 pt-1 text-cyan-200">
              <span>Shield</span>
              <span>{shields}</span>
            </div>
          )}
        </div>
      </div>

      {showProgressPanel ? (
        <div className="pointer-events-auto absolute bottom-2 left-2 w-[min(28vw,220px)] rounded-lg border border-pink-500/25 bg-transparent px-3 py-2 text-[10px] shadow-none sm:text-xs">
          <div className="mb-2 flex items-start justify-between gap-2 uppercase tracking-[0.22em] text-pink-200">
            <div>
              <div>Progress</div>
              <div className="mt-1 text-[9px] tracking-[0.18em] text-pink-100/75 sm:text-[10px]">{unlockedCount}/{profile.progression.unlocks.length}</div>
            </div>
            <button
              type="button"
              onClick={() => setShowProgressPanel(false)}
              className="rounded border border-pink-400/30 bg-transparent px-2 py-1 text-[10px] text-pink-200 transition hover:bg-pink-500/10"
              aria-label="Close progress panel"
            >
              x
            </button>
          </div>
          {showDevPresetLabel && (
            <div className="mb-2 inline-flex rounded border border-cyan-400/35 bg-cyan-500/10 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-cyan-200 sm:text-[10px]">
              {profile.progressionPreset}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
            <div>Runs {profile.progression.totalRuns}</div>
            <div>Best {profile.progression.highestLevel}</div>
            <div>Boss {profile.progression.bossesDefeated}</div>
            <div>Life {profile.progression.lifetimeScore.toLocaleString()}</div>
          </div>
          {nextUnlock ? (
            <div className="mt-2 border-t border-pink-500/10 pt-2">
              <div className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.18em] text-amber-200 sm:text-[10px]">
                <span>Next</span>
                <span>{nextUnlock.value.toLocaleString()}/{nextUnlock.target.toLocaleString()}</span>
              </div>
              <div className="mt-1 truncate text-white">{nextUnlock.name}</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400" style={{ width: `${nextUnlockProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="mt-2 border-t border-pink-500/10 pt-2 text-emerald-300">All unlocked</div>
          )}
          {activeAssistBadges.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] sm:text-[10px]">
              {activeAssistBadges.map((badge) => (
                <span key={badge} className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-cyan-200">
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowProgressPanel(true)}
          className="pointer-events-auto absolute bottom-2 left-2 rounded border border-pink-500/30 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-pink-200 transition hover:bg-pink-500/10 sm:text-xs"
        >
          Progress
        </button>
      )}

      {profile.settings.showControlHints && (showControlsPanel ? (
        <div className="pointer-events-auto absolute bottom-2 right-2 max-w-[min(92vw,520px)] rounded border border-cyan-500/25 bg-transparent px-3 py-2 text-[10px] text-cyan-100 sm:text-xs md:text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="uppercase tracking-[0.25em] text-cyan-300">Controls</div>
            <button
              type="button"
              onClick={() => setShowControlsPanel(false)}
              className="rounded border border-cyan-400/30 bg-transparent px-2 py-1 text-[10px] text-cyan-200 transition hover:bg-cyan-500/10"
              aria-label="Close controls panel"
            >
              x
            </button>
          </div>
          <div className="mt-1">Move with WASD or arrows. Left click fires fireballs, right click fires missiles, and orange boss alerts mean a heavy volley is about to start.</div>
          <div className="mt-1 text-cyan-200/80">Mobile runs use the D-pad plus fire and missile buttons. Persistent unlocks apply automatically on the next run.</div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowControlsPanel(true)}
          className="pointer-events-auto absolute bottom-2 right-2 rounded border border-cyan-500/25 bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-200 transition hover:bg-cyan-500/10 sm:text-xs"
        >
          Controls
        </button>
      ))}
    </div>
  );
}