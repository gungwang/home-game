import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { GameEvents } from '../game/GameEvents';
import { YOUTUBE_VIDEOS } from '../game/youtubeVideos';
const TARGET_VOLUME = 15;
const FADE_DURATION = 3000; // 3 seconds

export default function BackgroundMusicPlayer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  const getRandomVideo = () => YOUTUBE_VIDEOS[Math.floor(Math.random() * YOUTUBE_VIDEOS.length)];

  const fadeVolume = (targetVolume: number, onComplete?: () => void) => {
    if (!playerRef.current) return;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const startVolume = playerRef.current.getVolume();
    const steps = 30; // Number of steps for the fade
    const volumeStep = (targetVolume - startVolume) / steps;
    const intervalTime = FADE_DURATION / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const nextVolume = startVolume + (volumeStep * currentStep);
      playerRef.current.setVolume(Math.max(0, Math.min(100, nextVolume)));

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;
        if (onComplete) onComplete();
      }
    }, intervalTime);
  };

  useEffect(() => {
    const handlePlay = (videoId?: string) => {
      setShouldPlay(true);
      if (!currentVideo || videoId) {
        setCurrentVideo(videoId || getRandomVideo());
      } else {
        playerRef.current?.playVideo();
        fadeVolume(TARGET_VOLUME);
      }
    };
    const handleStop = () => {
      setShouldPlay(false);
      fadeVolume(0, () => {
        playerRef.current?.pauseVideo();
      });
    };

    GameEvents.on('bgm-play', handlePlay);
    GameEvents.on('bgm-stop', handleStop);
    GameEvents.on('game-over', handleStop);

    return () => {
      GameEvents.off('bgm-play', handlePlay);
      GameEvents.off('bgm-stop', handleStop);
      GameEvents.off('game-over', handleStop);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [currentVideo]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(shouldPlay ? TARGET_VOLUME : 0);
    if (shouldPlay) {
      event.target.playVideo();
    }
  };

  const onEnd: YouTubeProps['onEnd'] = () => {
    if (shouldPlay) {
      setCurrentVideo(getRandomVideo());
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      origin: window.location.origin
    },
  };

  if (!currentVideo) return null;

  return (
    <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none w-1 h-1 overflow-hidden">
      <YouTube videoId={currentVideo} opts={opts} onReady={onReady} onEnd={onEnd} />
    </div>
  );
}