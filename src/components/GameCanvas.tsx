import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '../game/GameConfig';

export default function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game(getGameConfig('phaser-container'));
    }
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div id="phaser-container" className="flex justify-center items-center w-full h-screen bg-[#09111d]" />;
}