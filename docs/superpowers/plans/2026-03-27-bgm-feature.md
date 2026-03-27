# Background Music Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a hidden YouTube player to play random music videos as background music at 33% volume during gameplay, pausing when the main checkpoint video plays.

**Architecture:** A new React component `BackgroundMusicPlayer` will be rendered in `App.tsx` alongside `GameCanvas`. It listens to `GameEvents` (`bgm-play` and `bgm-stop`) to control a hidden `react-youtube` player. The `MainScene.ts` will trigger these events on user interaction and scene pauses.

**Tech Stack:** React, TypeScript, Phaser 3, react-youtube

---

### Task 1: Create the Background Music Player Component

**Files:**
- Create: `src/components/BackgroundMusicPlayer.tsx`

- [ ] **Step 1: Create the component structure**

```typescript
// src/components/BackgroundMusicPlayer.tsx
import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { GameEvents } from '../game/GameEvents';

const YOUTUBE_VIDEOS = ["2DXfUDiIcsY","4xTJ3BPCtMc","6ju5NziYYlc","-84Hc6ywY04","9yACrRUsQoo","bzHm7JM0MI4","C9HIAUHqU7A","CSxMRjyvnPU","DFY_w8XmWfY","ESA07F5rQLk","Fp7opQZ39ds","gGXxE9OYIaM","GlTyyTUjLv0","gq9Fz6H9zE0","hV4maRZYX6M","iEky-ldyPnU","JdwTJsRHodc","JTdhuyB_0fE","jX1TbV26XDc","lePl30G1DUA","lXQWSiJQTvM","qd_9ksHVApQ","rtdpDahE3Lw","S_8-Le7xdns","SAZuBkHg_mU","TS2GDGR__48","ugXdVO8Bb9o","vqLaAxZy14A","vRplaUoD1S0","WxyZaNN6xQ8","xv8599zXFvQ","zGKjoTmyNRU","zoKfzZ25htA","zOSVBpr3hB0","ZYqST2YHOHs"];

export default function BackgroundMusicPlayer() {
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
    <div className="absolute top-[-9999px] left-[-9999px] opacity-0 pointer-events-none">
      <YouTube videoId={currentVideo} opts={opts} onReady={onReady} onEnd={onEnd} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/BackgroundMusicPlayer.tsx
git commit -m "feat: add hidden background music player component"
```

### Task 2: Integrate BGM Player into App and Scene

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/game/scenes/MainScene.ts`

- [ ] **Step 1: Add BackgroundMusicPlayer to App.tsx**

Import `BackgroundMusicPlayer` and render it inside the main div in `src/App.tsx` (before or after UIOverlay).

- [ ] **Step 2: Export Youtube videos array in MainScene**

To avoid duplication, export the array from `MainScene.ts` or just use it. Since we already hardcoded it in `BackgroundMusicPlayer.tsx` we can leave `MainScene.ts` as is, but we need to trigger the events.

In `src/game/scenes/MainScene.ts`, add a property:
```typescript
private bgmStarted: boolean = false;
```

In `MainScene.create()`:
```typescript
    // Inside the pointerdown listener or keyboard listener
    const startBgm = () => {
      if (!this.bgmStarted) {
        this.bgmStarted = true;
        GameEvents.emit('bgm-play');
      }
    };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      startBgm();
      // existing attack code...
    });
    
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown', startBgm);
    }
```

In `update()` where checkpoint is triggered:
```typescript
        // Pause scene and show modal
        this.scene.pause();
        GameEvents.emit('bgm-stop'); // ADD THIS
        GameEvents.emit('show-video', randomVideoId);
```

In `onVideoComplete`:
```typescript
      this.isPaused = false;
      this.scene.resume();
      GameEvents.emit('bgm-play'); // ADD THIS to resume bgm
      this.score += 50; // reward for watching video
```

- [ ] **Step 3: Run dev server to verify**
Run `npm run build`.

- [ ] **Step 4: Commit**
```bash
git add src/App.tsx src/game/scenes/MainScene.ts
git commit -m "feat: trigger background music on user interaction and pause during checkpoints"
```