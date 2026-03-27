import { useEffect, useState } from 'react';
import { GameEvents } from '../game/GameEvents';

export default function UIOverlay() {
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState(3);
  const [health, setHealth] = useState(100);

  useEffect(() => {
    GameEvents.on('score-changed', setScore);
    GameEvents.on('ammo-changed', setAmmo);
    GameEvents.on('health-changed', setHealth);
    return () => {
      GameEvents.off('score-changed', setScore);
      GameEvents.off('ammo-changed', setAmmo);
      GameEvents.off('health-changed', setHealth);
    };
  }, []);

  return (
    <div className="absolute top-4 left-4 text-white text-2xl font-mono space-y-2 pointer-events-none">
      <div className="text-pink-500">Health: {health}%</div>
      <div className="text-cyan-400">Score: {score}</div>
      <div className="text-yellow-400">Missiles: {ammo}</div>
    </div>
  );
}