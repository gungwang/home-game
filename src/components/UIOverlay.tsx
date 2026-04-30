import { useEffect, useState } from 'react';
import { GameEvents } from '../game/GameEvents';
import { getNextUnlock, type Difficulty, type GameProfile } from '../game/gameProfile';

interface UIOverlayProps {
  profile: GameProfile;
}

interface WeaponState {
  fireballLevel: number;
  missileLevel: number;
}

export default function UIOverlay({ profile }: UIOverlayProps) {
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(3);
  const [health, setHealth] = useState(100);
  const [shields, setShields] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [weaponState, setWeaponState] = useState<WeaponState>({ fireballLevel: 1, missileLevel: 1 });
  const [bossWarning, setBossWarning] = useState('');

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

  return (
    <div className="absolute inset-0 pointer-events-none text-white font-mono">
      {bossWarning && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded border border-amber-400/70 bg-black/70 px-4 py-2 text-center text-xs sm:text-sm md:text-lg uppercase tracking-[0.3em] text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.25)]">
          {bossWarning}
        </div>
      )}

      <div
        className="absolute top-1 left-1 rounded border border-cyan-500/30 bg-[#06131fcc] px-3 py-2 text-white shadow-[0_0_18px_rgba(6,182,212,0.12)]"
        style={{ fontSize: 'clamp(10px, 2.2vw, 22px)', lineHeight: 1.35 }}
      >
        <div className="text-pink-400">HP: {health}%</div>
        <div className="text-cyan-300">Score: {score.toLocaleString()}</div>
        <div className="text-yellow-300">Missiles: {ammo}</div>
        <div className="text-violet-200">Level: {currentLevel}</div>
        <div className="text-emerald-300">Mode: {difficulty}</div>
        <div className="text-orange-300">Fireball Lv.{weaponState.fireballLevel}</div>
        <div className="text-amber-200">Missile Lv.{weaponState.missileLevel}</div>
        {shields > 0 && <div className="text-cyan-200">Shield Charges: {shields}</div>}
      </div>

      <div className="absolute top-1 right-1 w-[min(42vw,320px)] rounded border border-pink-500/30 bg-[#140a17d9] px-3 py-3 shadow-[0_0_18px_rgba(236,72,153,0.14)]">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-pink-200 sm:text-xs">
          <span>Progress</span>
          <span>{unlockedCount}/{profile.progression.unlocks.length} unlocked</span>
        </div>
        <div className="text-[10px] text-slate-300 sm:text-xs md:text-sm">Runs: {profile.progression.totalRuns} | Lifetime Score: {profile.progression.lifetimeScore.toLocaleString()}</div>
        <div className="text-[10px] text-slate-300 sm:text-xs md:text-sm">Bosses Down: {profile.progression.bossesDefeated} | Best Level: {profile.progression.highestLevel}</div>
        {nextUnlock ? (
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200 sm:text-xs">Next Unlock</div>
            <div className="mt-1 text-xs text-white sm:text-sm md:text-base">{nextUnlock.name}</div>
            <div className="text-[10px] text-slate-300 sm:text-xs">{nextUnlock.description}</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-cyan-400" style={{ width: `${nextUnlockProgress}%` }} />
            </div>
            <div className="mt-1 text-[10px] text-slate-300 sm:text-xs">{nextUnlock.value.toLocaleString()} / {nextUnlock.target.toLocaleString()} • {nextUnlock.reward}</div>
          </div>
        ) : (
          <div className="mt-3 text-[10px] text-emerald-300 sm:text-xs md:text-sm">All persistent rewards are unlocked for future runs.</div>
        )}
        {activeAssistBadges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] sm:text-xs">
            {activeAssistBadges.map((badge) => (
              <span key={badge} className="rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-cyan-200">
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {profile.settings.showControlHints && (
        <div className="absolute bottom-2 left-2 max-w-[min(92vw,560px)] rounded border border-cyan-500/25 bg-black/65 px-3 py-2 text-[10px] text-cyan-100 sm:text-xs md:text-sm">
          <div className="uppercase tracking-[0.25em] text-cyan-300">Controls</div>
          <div className="mt-1">Move with WASD or arrows. Left click fires fireballs, right click fires missiles, and orange boss alerts mean a heavy volley is about to start.</div>
          <div className="mt-1 text-cyan-200/80">Mobile runs use the D-pad plus fire and missile buttons. Persistent unlocks apply automatically on the next run.</div>
        </div>
      )}
    </div>
  );
}