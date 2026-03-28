# 飞龙大战纽约：背景音乐（BGM）功能设计

## 1. 目标
在游戏（飞行打怪）阶段，利用现有的 YouTube 视频列表随机播放作为背景音乐 (BGM)，该播放器需要隐藏视频画面仅输出音频。当到达关卡大厦播放主视图视频（VideoModal）时，停止 BGM；关闭主视频返回游戏时，随机挑选一首新的 BGM 开始播放，并将音量设置为正常音量的 1/3 (约 33%)。

## 2. 架构与组件设计
由于游戏的核心状态与 UI 层（React）绑定，而 YouTube Iframe API 强依赖 DOM 和 React 生命周期，因此 BGM 播放器适合作为 React 层的一个隐藏组件。

*   **组件 `BackgroundMusicPlayer` (React):**
    *   **位置:** 在 `App.tsx` 中与 `GameCanvas` 同级挂载。
    *   **UI:** 绝对定位，设置 `width: 0, height: 0, opacity: 0` 或者外层 `display: none`（部分浏览器要求 iframe 必须有极小的尺寸才能播放，可设为 1x1 像素隐藏在屏幕外）。
    *   **状态:** 接收 `isPlaying` (boolean) 和 `videoId` (string) 作为 props，或内部监听 `GameEvents` 来决定是否播放。
    *   **控制:**
        *   当组件挂载/恢复游戏时，随机选择视频 ID 并通过 `youtubePlayer.playVideo()` 播放。
        *   在 `onReady` 和 `onPlay` 事件中，使用 `youtubePlayer.setVolume(33)` 将音量强制设为 33%。
        *   监听 `onEnd` 事件，如果一首歌播完但游戏没结束，自动随机下一首。

*   **事件协同 (`GameEvents`):**
    *   新增事件：`bgm-play` (带参数 `videoId`)、`bgm-stop`。
    *   在 `MainScene.ts` 中：
        *   `create()` 结束时，或者用户第一次互动时触发 `bgm-play`（浏览器限制自动播放带声音的媒体，可能需要用户第一次点击/按键后才能开始 BGM）。
        *   触发大厦视频节点前（调用 `this.scene.pause()` 前），触发 `bgm-stop`。
        *   从大厦视频节点恢复（`video-complete` 监听器）时，触发 `bgm-play` 并随机传入一个新的 `videoId`。

## 3. 注意事项 (防范浏览器自动播放限制)
现代浏览器（Chrome/Safari）严格禁止未经过用户交互（User Gesture）的网页自动播放带声音的媒体。
*   **策略:** 游戏的初始 BGM 不应在 `MainScene` 刚加载就立刻播放。我们应该在用户的**第一次按键 (WASD) 或鼠标点击 (射击)** 时，检查 BGM 是否启动，如果未启动则启动它。这能完美绕过自动播放拦截。

---

# Dragon vs New York: Background Music (BGM) Feature Design

## 1. Goal
During gameplay (flying & combat), use the existing YouTube video list to randomly play background music (BGM) with the video hidden (audio-only output). When the player reaches a checkpoint building and the main video modal (VideoModal) opens, stop the BGM. When the main video closes and gameplay resumes, randomly select a new BGM track and play it at 1/3 of normal volume (~33%).

## 2. Architecture & Component Design
Since the game's core state is bound to the UI layer (React), and the YouTube Iframe API depends heavily on the DOM and React lifecycle, the BGM player is best implemented as a hidden React component.

*   **Component `BackgroundMusicPlayer` (React):**
    *   **Placement:** Mounted alongside `GameCanvas` in `App.tsx`.
    *   **UI:** Absolutely positioned with `width: 0, height: 0, opacity: 0`, or an outer container set to `display: none` (some browsers require the iframe to have a minimal size to play — a 1×1 pixel iframe hidden offscreen may be used).
    *   **State:** Receives `isPlaying` (boolean) and `videoId` (string) as props, or internally listens to `GameEvents` to decide whether to play.
    *   **Controls:**
        *   On mount / game resume, randomly select a video ID and call `youtubePlayer.playVideo()`.
        *   In the `onReady` and `onPlay` event handlers, force volume to 33% via `youtubePlayer.setVolume(33)`.
        *   Listen to the `onEnd` event — if a track finishes but the game hasn't ended, automatically select and play the next random track.

*   **Event Coordination (`GameEvents`):**
    *   New events: `bgm-play` (with `videoId` parameter), `bgm-stop`.
    *   In `MainScene.ts`:
        *   At the end of `create()`, or on the user's first interaction, emit `bgm-play` (browsers restrict autoplay of media with audio — BGM may need to start only after the user's first keypress or click).
        *   Before triggering the building video checkpoint (before calling `this.scene.pause()`), emit `bgm-stop`.
        *   When resuming from the building video checkpoint (inside the `video-complete` listener), emit `bgm-play` with a randomly selected new `videoId`.

## 3. Notes (Browser Autoplay Restrictions)
Modern browsers (Chrome / Safari) strictly prohibit autoplaying media with audio without a prior user gesture.
*   **Strategy:** The initial BGM should NOT start playing as soon as `MainScene` loads. Instead, on the **first keypress (WASD) or mouse click (shoot)**, check whether BGM has been started — if not, start it. This cleanly bypasses autoplay restrictions.