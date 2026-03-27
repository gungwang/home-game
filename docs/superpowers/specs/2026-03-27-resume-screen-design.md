# 飞龙大战纽约：简历与结算界面更新设计

## 1. 目标
更新现有的 Game Over (简历) 界面，以更好地展示玩家的最终得分，提供重新开始游戏的选项，并详细展示指定的个人简历信息。

## 2. 需求列表
*   **显示最终得分：** 在界面显著位置显示玩家在游戏中获得的总分。
*   **重新开始按钮：** 增加一个“Restart Game”按钮，点击后可以重置游戏状态并返回游戏初始画面。
*   **简历信息更新：**
    *   姓名显示为：`Gung Wang`
    *   职位显示为：`AI Software Engineer`
    *   增加一个指向个人网站的超链接：`bio.gungwang.com`

## 3. 组件更新设计
主要修改 `src/components/ResumeScreen.tsx` 和 `src/App.tsx`。

*   **`ResumeScreen.tsx`**:
    *   **Props 接收:** 增加接收 `score` (number) 和 `onRestart` (() => void) 属性。
    *   **UI 布局:**
        *   顶部显示 "GAME OVER" 或 "MISSION COMPLETE"。
        *   下方显示 "Final Score: [score]"，使用赛博朋克发光字体。
        *   简历区域：更新姓名、Title，并在显眼位置添加 `<a href="https://bio.gungwang.com" target="_blank">bio.gungwang.com</a>`，添加发光 hover 效果。
        *   底部：放置一个 "RESTART GAME" 按钮，使用赛博朋克风格的边框和悬停动画。
*   **`App.tsx`**:
    *   **状态管理:** 需要在 `game-over` 触发时，将当前的 `score` 状态保存下来传递给 `ResumeScreen`。因为现在的 score 是由 `UIOverlay` 内部维护的，我们需要将 `score` 的状态提升到 `App.tsx` 或者让 `App.tsx` 也能监听 `score-changed` 事件。
    *   **重启逻辑:** 实现 `handleRestart` 函数。该函数将 `isGameOver` 设为 false，并可能需要触发一个事件通知 Phaser 重启 `MainScene`。

## 4. 游戏重启逻辑 (`MainScene.ts`)
*   由于 Phaser 的游戏实例一直存在于 `<GameCanvas />` 中，当 React 重新渲染并把 `isGameOver` 设为 false 时，我们需要让 Phaser 的当前 Scene 重新启动。
*   **方案:** 在 `App.tsx` 的 `handleRestart` 中，触发 `GameEvents.emit('restart-game')`。
*   在 `MainScene.ts` 中，如果是 Game Over 状态，监听该事件，当收到事件时调用 `this.scene.restart()` 来重置整个场景的状态（包括血量、弹药、分数和实体组）。