# 飞龙大战纽约-曼哈顿城：网页 2D 游戏设计文档

## 1. 概述与目标

本作是一款基于网页平台的 2D 横版过关射击游戏，采用像素风赛博朋克（Pixel Art Cyberpunk）视觉设定。玩家操控降临曼哈顿的“神龙”，消灭占领城市的家禽变异妖怪，同时在通过特定关卡节点（标志性大厦）时，观看玩家个人 YouTube 频道的音乐视频。游戏最终以通关奖励的形式呈现玩家的个人简历。

**核心特色:**
*   **视觉风格:** 像素艺术结合赛博朋克霓虹色彩（黑/白/红/黄/蓝/绿透明过渡），具备天气、昼夜四季变化。
*   **游戏节奏:** 中长模式（每关 3-5 分钟），共约 5-8 关，总通关时长 10-30 分钟。
*   **多媒体集成:** 关卡节点的大楼表面作为“视频墙”，播放随机抽取的 YouTube MV，观看可获积分。
*   **操作方式:** 键鼠控制神龙飞行与两种攻击模式。

## 2. 系统架构 (React + Phaser.js)

系统采用“网页 UI 壳 + 游戏画布”的混合架构，实现游戏体验与 Web 内容的无缝融合。

*   **前端框架 (React/TypeScript):**
    *   负责外层容器、主菜单、游戏内 UI 覆盖层（积分、生命值、弹药）、全屏播放 YouTube 视频的 Modal 遮罩，以及通关后的个人简历页面展示。
    *   管理全局游戏状态（总分、当前关卡、播放过的视频列表）。
*   **游戏引擎 (Phaser 3):**
    *   专注于 2D 渲染（视差滚动背景、像素角色、弹道特效）。
    *   负责 Arcade Physics 物理碰撞检测（神龙的飞行边界、敌我碰撞、子弹命中判定、飞入大楼窗户/空隙的区域判定）。
    *   处理天气粒子系统（雨、雪、霓虹灯闪烁动画）。

## 3. 游戏机制与关卡设计

### 3.1 角色与控制
*   **神龙 (主角):**
    *   **移动:** 键盘 WASD 或方向键控制上下左右飞行。
    *   **普通攻击 (龙息火球):** 鼠标左键，无限弹药，直线/轻微抛物线，低伤害。
    *   **重型攻击 (龙刺导弹):** 鼠标右键或指定按键，有限弹药（需拾取补给），跟踪或高爆发AOE，高伤害。
*   **妖怪 (敌人):**
    *   变异的家畜动物（鸡鸭猪羊牛），像素卡通形象，不同动物对应不同血量、移动模式和击杀得分。

### 3.2 关卡流程 (Story Mode 顺序化)
采用从中央公园到自由女神像的线性叙事，背景建筑按真实地理位置的抽象顺序出现。

1.  **场景滚动:** 背景（曼哈顿高楼群）向左滚动，神龙在屏幕左侧一定范围内自由移动射击前方涌来的妖怪。
2.  **大楼交互:** 部分标志性大厦具有物理碰撞边界，神龙可以（或必须）穿过大楼的间隙/窗户，增加飞行操作技巧。
3.  **通关节点 (Checkpoints):**
    *   每飞行 3-5 分钟，场景停止滚动，到达一座特定的标志性大厦（作为本关终点）。
    *   大厦表面预留了一块巨大的纯色屏幕区域。
    *   游戏暂停，React 层在此区域上方精准覆盖一个 YouTube Iframe，播放随机挑选的 MV。
    *   视频播放完毕或玩家跳过（给予不同积分奖励）后，结算本关积分，场景继续滚动，进入下一关。
4.  **结局:** 抵达自由女神像，击败最终目标，画面平滑过渡到基于 React 的个人简历展示页。

### 3.3 积分系统平衡
*   **战斗得分:** 击杀不同级别的妖怪获得基础分。连续击杀、高难度击杀（如穿过大楼空隙时击杀）可获得倍率加成。
*   **视频得分:** 完整观看视频获得高额固定积分，中途跳过则按观看比例给予少量积分。
*   需在开发测试阶段调整两者的比例，确保玩家既有动力打怪，也有意愿欣赏视频。

## 4. 关键技术实现路径

1.  **YouTube API 集成:**
    *   维护一个包含 100+ 视频 ID 的 JSON 列表。
    *   使用 `react-youtube` 库或官方 Iframe API，监听 `onStateChange` (播放结束 `0`)。
    *   通过绝对定位和 `z-index` 将播放器精准覆盖在 Phaser Canvas 渲染出的大楼屏幕区域上方。
    *   youtube json files: /home/wang/projects/home-game-2/docs/youtube-json/
2.  **Phaser 与 React 通信:**
    *   通过 EventEmitter 或直接的函数回调，让 Phaser 引擎在到达大楼时触发 React 显示视频。
    *   React 视频播放结束后，通知 Phaser 恢复游戏循环 (`scene.resume()`)。
3.  **视差滚动与天气系统:**
    *   Phaser 中使用多个 `TileSprite` 实现不同深度的背景建筑滚动（远景慢，近景快）。
    *   利用 Phaser 的 Particle Emitter 结合透明度（Alpha）和色彩混合（Blend Modes）实现霓虹灯效和雨雪天气。

## 5. 开发阶段划分 (后续实现计划参考)

1.  **Phase 1: 基础框架搭建:** React 项目初始化，集成 Phaser 引擎，实现基本的飞龙移动和普通射击。
2.  **Phase 2: 场景与敌人:** 实现视差滚动背景，添加怪物生成逻辑和碰撞检测。
3.  **Phase 3: 核心循环与视频集成:** 实现到达大楼停顿的逻辑，精准嵌入 YouTube 播放器，完成“打怪-看视频-下一关”的闭环。
4.  **Phase 4: 机制完善与多媒体:** 引入导弹武器、天气系统、得分统计、最终的简历页面。
5.  **Phase 5: 优化与打磨:** 寻找/制作免费的美术资产，调整游戏手感，平衡数值，修复 Bug。

---

# Dragon vs New York – Manhattan: Web 2D Game Design Document

## 1. Overview & Goals

A web-based 2D side-scrolling shooter with a Pixel Art Cyberpunk visual style. The player controls a dragon descending upon Manhattan to eliminate mutant farm animals that have taken over the city. At specific checkpoint buildings, the player watches YouTube music videos from their personal channel. The game concludes by presenting the player's professional resume.

**Core Features:**
*   **Visual Style:** Pixel art combined with cyberpunk neon palette (black / white / red / yellow / blue / green with transparent transitions), featuring weather, day/night, and seasonal changes.
*   **Game Pacing:** Medium-length sessions (3–5 minutes per stage), approximately 5–8 stages, total playthrough 10–30 minutes.
*   **Multimedia Integration:** Designated building surfaces serve as "video walls" playing randomly selected YouTube MVs. Watching earns bonus score.
*   **Controls:** Keyboard and mouse for dragon flight and two attack modes.

## 2. System Architecture (React + Phaser.js)

A hybrid "Web UI shell + Game canvas" architecture for seamless blending of gameplay and web content.

*   **Frontend Framework (React / TypeScript):**
    *   Manages the outer container, main menu, in-game UI overlay (score, health, ammo), a fullscreen YouTube video modal, and the post-game resume page.
    *   Manages global game state (total score, current stage, list of viewed videos).
*   **Game Engine (Phaser 3):**
    *   Handles 2D rendering (parallax scrolling backgrounds, pixel characters, projectile effects).
    *   Manages Arcade Physics collision detection (dragon flight boundaries, player–enemy collisions, bullet hit detection, flying through building gaps).
    *   Drives the weather particle system (rain, snow, neon flicker animations).

## 3. Game Mechanics & Level Design

### 3.1 Characters & Controls
*   **Dragon (Player Character):**
    *   **Movement:** WASD or arrow keys for up/down/left/right flight.
    *   **Primary Attack (Dragon Breath Fireball):** Left mouse button, unlimited ammo, straight/slight arc trajectory, low damage.
    *   **Heavy Attack (Dragon Spike Missile):** Right mouse button or designated key, limited ammo (requires pickup), homing or high-burst AOE, high damage.
*   **Monsters (Enemies):**
    *   Mutated farm animals (chicken, duck, pig, sheep, cow) in pixel-cartoon style. Different animals have different health, movement patterns, and kill scores.

### 3.2 Level Flow (Story Mode — Linear)
A linear narrative from Central Park to the Statue of Liberty, with landmark buildings appearing in an abstracted geographic order.

1.  **Scene Scrolling:** The Manhattan skyline scrolls leftward. The dragon moves freely within the left portion of the screen, shooting oncoming monsters.
2.  **Building Interaction:** Certain landmark buildings have physical collision boundaries. The dragon can (or must) navigate through gaps / windows in buildings, adding flight skill challenge.
3.  **Checkpoints:**
    *   After every 3–5 minutes of flight, scrolling stops at a specific landmark building (the stage endpoint).
    *   The building facade features a large, solid-color screen area.
    *   The game pauses; the React layer precisely overlays a YouTube iframe on this area to play a randomly selected MV.
    *   After the video ends or the player skips it (with differing score rewards), stage score is tallied, scrolling resumes, and the next stage begins.
4.  **Ending:** Upon reaching the Statue of Liberty and defeating the final boss, the screen transitions smoothly to a React-based professional resume page.

### 3.3 Scoring System Balance
*   **Combat Score:** Killing different-tier monsters yields base points. Kill streaks and high-difficulty kills (e.g., killing while navigating building gaps) grant multiplier bonuses.
*   **Video Score:** Watching a full video earns a large fixed score bonus; skipping mid-way grants a proportional fraction.
*   The ratio between the two should be tuned during testing to ensure players are motivated both to fight and to watch videos.

## 4. Key Technical Implementation

1.  **YouTube API Integration:**
    *   Maintain a JSON list of 100+ video IDs.
    *   Use the `react-youtube` library or the official Iframe API; listen to `onStateChange` (ended = `0`).
    *   Position the player precisely over the Phaser Canvas building screen area using absolute positioning and `z-index`.
    *   YouTube JSON files: `/home/wang/projects/home-game-2/docs/youtube-json/`
2.  **Phaser ↔ React Communication:**
    *   Via an EventEmitter or direct function callbacks: Phaser emits an event when reaching a building; React shows the video.
    *   When the React video ends, it notifies Phaser to resume the game loop (`scene.resume()`).
3.  **Parallax Scrolling & Weather System:**
    *   Multiple `TileSprite` layers in Phaser render background buildings at different depths (far = slow, near = fast).
    *   Phaser's Particle Emitter with alpha and Blend Modes creates neon glow and rain/snow weather effects.

## 5. Development Phases (Reference Roadmap)

1.  **Phase 1 — Foundation:** Initialize React project, integrate Phaser engine, implement basic dragon movement and primary attack.
2.  **Phase 2 — Scene & Enemies:** Implement parallax scrolling backgrounds, add monster spawn logic and collision detection.
3.  **Phase 3 — Core Loop & Video Integration:** Implement building-checkpoint pause logic, precisely embed the YouTube player, complete the "fight → watch video → next stage" loop.
4.  **Phase 4 — Mechanics & Multimedia:** Introduce missile weapon, weather system, score tracking, and the final resume page.
5.  **Phase 5 — Polish & Optimization:** Source/create free art assets, tune game feel, balance numbers, fix bugs.