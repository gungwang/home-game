import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { GameEvents } from '../game/GameEvents';

const YOUTUBE_VIDEOS = ["2DXfUDiIcsY","4xTJ3BPCtMc","6ju5NziYYlc","-84Hc6ywY04","9yACrRUsQoo","bzHm7JM0MI4","C9HIAUHqU7A","CSxMRjyvnPU","DFY_w8XmWfY","ESA07F5rQLk","Fp7opQZ39ds","gGXxE9OYIaM","GlTyyTUjLv0","gq9Fz6H9zE0","hV4maRZYX6M","iEky-ldyPnU","JdwTJsRHodc","JTdhuyB_0fE","jX1TbV26XDc","lePl30G1DUA","lXQWSiJQTvM","qd_9ksHVApQ","rtdpDahE3Lw","S_8-Le7xdns","SAZuBkHg_mU","TS2GDGR__48","ugXdVO8Bb9o","vqLaAxZy14A","vRplaUoD1S0","WxyZaNN6xQ8","xv8599zXFvQ","zGKjoTmyNRU","zoKfzZ25htA","zOSVBpr3hB0","ZYqST2YHOHs"];

export default function BackgroundMusicPlayer() {
  // Use any for the player ref as react-youtube's internal player type is complex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  const getRandomVideo = () => YOUTUBE_VIDEOS[Math.floor(Math.random() * YOUTUBE_VIDEOS.length)];

  useEffect(() => {
    const handlePlay = (videoId?: string) => {
      setShouldPlay(true);
      if (!currentVideo || videoId) {
        setCurrentVideo(videoId || getRandomVideo());
      } else {
        playerRef.current?.playVideo();
      }
    };
    const handleStop = () => {
      setShouldPlay(false);
      playerRef.current?.pauseVideo();
    };

    GameEvents.on('bgm-play', handlePlay);
    GameEvents.on('bgm-stop', handleStop);
    GameEvents.on('game-over', handleStop);

    return () => {
      GameEvents.off('bgm-play', handlePlay);
      GameEvents.off('bgm-stop', handleStop);
      GameEvents.off('game-over', handleStop);
    };
  }, [currentVideo]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    event.target.setVolume(33); // 33% volume
    if (shouldPlay) {
      event.target.playVideo();
    }
  };

  const onEnd: YouTubeProps['onEnd'] = () => {
    if (shouldPlay) {
      setCurrentVideo(getRandomVideo()); // play next random song
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