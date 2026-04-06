import { useEffect, useState, useCallback, useRef } from 'react';
import { GameEvents } from '../game/GameEvents';

/**
 * On-screen touch controls for mobile devices.
 * D-pad (lower-left) + Fireball & Missile buttons (lower-right).
 * Only rendered when a touch-capable device is detected.
 */
export default function MobileControls() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const activeDirections = useRef<Set<string>>(new Set());

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

  // --- Direction helpers ---
  const dirStart = useCallback((dir: string) => {
    if (!activeDirections.current.has(dir)) {
      activeDirections.current.add(dir);
      GameEvents.emit('touch-direction', Array.from(activeDirections.current));
    }
  }, []);

  const dirEnd = useCallback((dir: string) => {
    activeDirections.current.delete(dir);
    GameEvents.emit('touch-direction', Array.from(activeDirections.current));
  }, []);

  const clearAllDirections = useCallback(() => {
    activeDirections.current.clear();
    GameEvents.emit('touch-direction', []);
  }, []);

  // --- Action helpers ---
  const fireballInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startFireball = useCallback(() => {
    GameEvents.emit('touch-fireball');
    // Auto-fire while held
    fireballInterval.current = setInterval(() => {
      GameEvents.emit('touch-fireball');
    }, 200);
  }, []);

  const stopFireball = useCallback(() => {
    if (fireballInterval.current) {
      clearInterval(fireballInterval.current);
      fireballInterval.current = null;
    }
  }, []);

  const fireMissile = useCallback(() => {
    GameEvents.emit('touch-missile');
  }, []);

  if (!isTouchDevice) return null;

  const btnBase =
    'select-none rounded-full flex items-center justify-center font-mono font-bold text-white border-2 active:scale-95 transition-transform';

  const dpadBtn = (dir: string, label: string, extra: string) => (
    <div
      className={`${btnBase} w-16 h-16 bg-white/10 border-cyan-400/50 active:bg-cyan-400/30 ${extra}`}
      onTouchStart={(e) => {
        e.preventDefault();
        dirStart(dir);
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        dirEnd(dir);
      }}
      onTouchCancel={() => dirEnd(dir)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="text-2xl pointer-events-none">{label}</span>
    </div>
  );

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50"
      onTouchEnd={() => {
        /* safety: clear if all fingers lifted */
      }}
    >
      {/* ===== D-PAD (lower-left) ===== */}
      <div
        className="pointer-events-auto absolute bottom-6 left-4 grid grid-cols-3 grid-rows-3 gap-1"
        style={{ width: '13rem', height: '13rem' }}
        onTouchEnd={clearAllDirections}
      >
        {/* Row 1 */}
        <div /> {/* empty */}
        {dpadBtn('up', '▲', 'col-start-2')}
        <div /> {/* empty */}

        {/* Row 2 */}
        {dpadBtn('left', '◀', '')}
        <div /> {/* center dead zone */}
        {dpadBtn('right', '▶', '')}

        {/* Row 3 */}
        <div /> {/* empty */}
        {dpadBtn('down', '▼', 'col-start-2')}
        <div /> {/* empty */}
      </div>

      {/* ===== ACTION BUTTONS (lower-right) ===== */}
      <div className="pointer-events-auto absolute bottom-8 right-4 flex flex-col gap-4 items-center">
        {/* Missile */}
        <div
          className={`${btnBase} w-18 h-18 bg-yellow-500/20 border-yellow-400/60 active:bg-yellow-400/40`}
          style={{ width: '4.5rem', height: '4.5rem' }}
          onTouchStart={(e) => {
            e.preventDefault();
            fireMissile();
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="text-sm pointer-events-none leading-tight text-center">
            🚀
          </span>
        </div>

        {/* Fireball */}
        <div
          className={`${btnBase} bg-red-500/20 border-red-400/60 active:bg-red-400/40`}
          style={{ width: '5.5rem', height: '5.5rem' }}
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
          <span className="text-lg pointer-events-none leading-tight text-center">
            🔥
          </span>
        </div>
      </div>
    </div>
  );
}
