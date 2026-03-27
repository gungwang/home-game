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
    <div className="absolute top-4 left-4 text-white text-2xl font-mono space-y-2 pointer-events-none">
      <div>Score: {score}</div>
      <div>Missiles: {ammo}</div>
    </div>
  );
}