# 飞龙大战纽约 - 关卡与背景升级设计 (NYC Levels & Backgrounds Upgrade)

## 1. 概述 (Overview)

本设计文档补充并扩展了原有的《飞龙大战纽约-曼哈顿城》设计文档，重点在于引入 10 个具有明确地理标识和名称的纽约市关卡。游戏流程将按照从北向南的真实地理位置推进，最终在炮台公园（The Battery）与自由女神像（Statue of Liberty）进行最终的 Boss 战。

**核心目标：**
*   将游戏明确划分为 10 个关卡，每个关卡都有特定的纽约地标名称。
*   在每个关卡的开头显示当前关卡名称，增强游戏进程感。
*   将原本通用的“检查点大楼”（播放视频的大楼）替换为该关卡对应的标志性地标建筑。

## 2. 关卡流程设计 (Level Progression - North to South)

游戏将按照以下顺序进行，神龙从曼哈顿中城/中央公园一路向南飞行，最终到达港口。

| Level | Name (UI Display) | Landmark (Checkpoint Building) | Notes |
| :--- | :--- | :--- | :--- |
| 1 | Central Park | The Plaza Hotel | 起点关卡 |
| 2 | Midtown North | Chrysler Building | 装饰艺术风格大厦 |
| 3 | Midtown South | Empire State Building | 曼哈顿核心地标 |
| 4 | Chelsea & High Line | The Vessel | 现代建筑风格 |
| 5 | Greenwich Village | Washington Square Arch | 穿越狭窄街道与拱门 |
| 6 | Lower East Side | Tenement Museum | 历史街区 |
| 7 | Tribeca & SoHo | Cast-Iron Buildings | 铸铁建筑群 |
| 8 | Brooklyn Bridge | Brooklyn Bridge (Tower) | 沿桥梁飞行 |
| 9 | Financial District | One World Trade Center | 华尔街高楼林立 |
| 10 | The Battery | Statue of Liberty | 终点/Boss 战 |

## 3. 技术实现路径 (Technical Implementation)

采用 **Option A (Landmark Checkpoints)** 的实现方案：

### 3.1 关卡状态管理 (State Management)
*   **Phaser Scene (`MainScene.ts`):**
    *   移除原本仅通过 `videosWatched` 计数来隐式决定 Boss 关卡的逻辑。
    *   引入显式的 `currentLevel: number` (1-10) 状态。
    *   维护一个包含上述 10 个关卡信息的数组（名称、对应的贴图 key）。
*   **过场动画/UI 提示 (Level Title UI):**
    *   在每次游戏开始，以及每次从视频播放完毕恢复游戏（`scene.resume()`）时，在屏幕中央显式一段文字动画，例如：`"LEVEL 3\nMIDTOWN SOUTH"`，持续 2-3 秒后淡出。

### 3.2 检查点大楼替换 (Checkpoint Building Replacement)
*   **资源加载 (`preload`):**
    *   需要新增或重用 SVG 资产来代表 10 个地标。
    *   *已知已有资产:* `empire_state.svg`, `chrysler.svg`, `statue_of_liberty.svg`。
    *   *需新增资产 (Placeholder 即可，保持与现有风格一致的 SVG):* `plaza_hotel.svg`, `vessel.svg`, `washington_arch.svg`, `tenement.svg`, `cast_iron.svg`, `brooklyn_bridge.svg`, `one_wtc.svg`。
*   **生成逻辑 (`spawnCheckpoint`):**
    *   原本 `spawnCheckpoint` 生成的是一个通用的 `screenBuilding` (黑色背景绿色边框)。
    *   修改逻辑：根据当前 `currentLevel`，获取对应的地标贴图（如 Level 3 使用 `empire_state`）。
    *   由于视频播放器（React YouTube iframe）需要覆盖在大楼表面，我们需要确保这些地标贴图在视觉上有一个相对平整的区域供视频播放，或者我们保留原本的绿色边框框体，将其作为“全息屏幕”悬浮在特定的地标建筑前方或上方。
    *   **推荐做法：** 在生成地标精灵 (Sprite) 的同时，在其适当位置（例如建筑的中上部）叠加一个 `screenBuilding` 的纯色框，用于定位和播放视频。

### 3.3 背景与生成逻辑调整
*   普通的滚动背景 (`city_far`, `city_near`) 保持不变，维持游戏性能和开发周期的可控。
*   普通的障碍物大楼 (`spawnBuilding`) 依然从随机池中抽取（可适当增加种类），但它们不承担播放视频的责任。

## 4. 后续步骤 (Next Steps)
1.  **资产准备:** 创建 7 个新的 SVG 占位符文件（形状、颜色与现有资产风格统一）。
2.  **代码修改:** 更新 `MainScene.ts`，引入 Level 数组、关卡标题动画，并修改 `spawnCheckpoint` 逻辑以使用关卡特定的地标。