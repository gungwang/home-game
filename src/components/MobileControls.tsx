import { useEffect, useState, useCallback, useRef } from 'react';
import { GameEvents } from '../game/GameEvents';

/**
 * On-screen touch controls for mobile devices.
 * D-pad (lower-left) + Fireball & Missile buttons (lower-right).
 * Only rendered when a touch-capable device is detected.
 *
 * D-pad uses joystick-style tracking: the entire cross area handles touch and
 * computes the angle to support all 8 directions (cardinal + diagonals).
 */
export default function MobileControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const dpadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      const touch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(touch);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // --- Joystick direction logic ---
  const getDirsFromTouch = useCallback((touch: React.Touch): string[] => {
    const el = dpadRef.current;
    if (!el) return [];
    const rect = el.getBoundingClientRect();
    const dx = touch.clientX - (rect.left + rect.width / 2);
    const dy = touch.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Ignore tiny movements in the dead zone
    if (dist < 8) return [];
    // atan2: right=0°, down=+90°, left=±180°, up=-90°
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const dirs: string[] = [];
    // Each cardinal spans ±67.5° → each diagonal is 45° wide
    if (angle > -67.5 && angle < 67.5) dirs.push('right');
    if (angle > 112.5 || angle < -112.5) dirs.push('left');
    if (angle > 22.5 && angle < 157.5) dirs.push('down');
    if (angle > -157.5 && angle < -22.5) dirs.push('up');
    return dirs;
  }, []);

  const emitDirs = useCallback((dirs: string[]) => {
    GameEvents.emit('touch-direction', dirs);
  }, []);

  const clearAllDirections = useCallback(() => {
    GameEvents.emit('touch-direction', []);
  }, []);

  const onDpadTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    emitDirs(getDirsFromTouch(e.touches[0]));
  }, [getDirsFromTouch, emitDirs]);

  const onDpadTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    emitDirs(getDirsFromTouch(e.touches[0]));
  }, [getDirsFromTouch, emitDirs]);

  const onDpadTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      clearAllDirections();
    } else {
      emitDirs(getDirsFromTouch(e.touches[0]));
    }
  }, [getDirsFromTouch, emitDirs, clearAllDirections]);

  // --- Action helpers ---
  const fireballInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track which action buttons are currently held, to detect simultaneous press
  const actionHeld = useRef({ fireball: false, missile: false });

  const checkShieldCombo = useCallback(() => {
    if (actionHeld.current.fireball && actionHeld.current.missile) {
      GameEvents.emit('touch-shield');
    }
  }, []);

  const startFireball = useCallback(() => {
    actionHeld.current.fireball = true;
    checkShieldCombo();
    GameEvents.emit('touch-fireball');
    // Auto-fire while held
    fireballInterval.current = setInterval(() => {
      GameEvents.emit('touch-fireball');
    }, 200);
  }, [checkShieldCombo]);

  const stopFireball = useCallback(() => {
    actionHeld.current.fireball = false;
    if (fireballInterval.current) {
      clearInterval(fireballInterval.current);
      fireballInterval.current = null;
    }
  }, []);

  const fireMissile = useCallback(() => {
    actionHeld.current.missile = true;
    checkShieldCombo();
    GameEvents.emit('touch-missile');
    // Reset missile held state after a short window so next tap works
    setTimeout(() => { actionHeld.current.missile = false; }, 300);
  }, [checkShieldCombo]);

  if (!isTouchDevice) return null;

  const btnBase =
    'select-none rounded-full flex items-center justify-center font-bold text-white border-2 active:scale-95 transition-transform';

  // D-pad cell size: ~48px (w-12 h-12), ~25% smaller than the previous 64px
  const dpadCell = 'w-12 h-12';

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* ===== D-PAD (lower-left, sticky to bottom-left corner) ===== */}
      {/* Entire container is the touch target — joystick-style angle detection */}
      <div
        ref={dpadRef}
        className="pointer-events-auto absolute bottom-1 left-1"
        style={{ width: '9rem', height: '9rem', touchAction: 'none' }}
        onTouchStart={onDpadTouchStart}
        onTouchMove={onDpadTouchMove}
        onTouchEnd={onDpadTouchEnd}
        onTouchCancel={clearAllDirections}
      >
        {/* Visual cross — purely decorative, touch handled by parent */}
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-0">
          {/* Row 1 */}
          <div />
          <div className={`${btnBase} ${dpadCell} bg-white/10 border-cyan-400/50`}>
            <span className="text-base pointer-events-none">▲</span>
          </div>
          <div />
          {/* Row 2 */}
          <div className={`${btnBase} ${dpadCell} bg-white/10 border-cyan-400/50`}>
            <span className="text-base pointer-events-none">◀</span>
          </div>
          <div className="rounded-full bg-white/5 border border-cyan-400/20" />
          <div className={`${btnBase} ${dpadCell} bg-white/10 border-cyan-400/50`}>
            <span className="text-base pointer-events-none">▶</span>
          </div>
          {/* Row 3 */}
          <div />
          <div className={`${btnBase} ${dpadCell} bg-white/10 border-cyan-400/50`}>
            <span className="text-base pointer-events-none">▼</span>
          </div>
          <div />
        </div>
      </div>

      {/* ===== ACTION BUTTONS (lower-right, sticky to bottom-right corner) ===== */}
      <div className="pointer-events-auto absolute bottom-1 right-1 flex flex-col gap-1 items-center">
        {/* Missile / Launch */}
        <div
          className={`${btnBase} bg-yellow-500/20 border-yellow-400/60 active:bg-yellow-400/40`}
          style={{ width: '3.25rem', height: '3.25rem' }}
          onTouchStart={(e) => {
            e.preventDefault();
            fireMissile();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="text-base pointer-events-none">🚀</span>
        </div>

        {/* Fireball / Shoot */}
        <div
          className={`${btnBase} bg-red-500/20 border-red-400/60 active:bg-red-400/40`}
          style={{ width: '3.75rem', height: '3.75rem' }}
          onTouchStart={(e) => {
            e.preventDefault();
            startFireball();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopFireball();
          }}
          onTouchCancel={stopFireball}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="text-lg pointer-events-none">🔥</span>
        </div>
      </div>
    </div>
  );
}
