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
    *   引入显式的 `currentLevel: number` (1-10) 状态，初始为 1。
    *   维护一个包含上述 10 个关卡信息的配置数组（名称、对应的贴图 key、视频全息屏幕的相对偏移量和尺寸 `screenBox: { x, y, width, height }`）。
*   **过场动画/UI 提示 (Level Title UI):**
    *   在每次游戏开始，以及每次从视频播放完毕恢复游戏（`scene.resume()`）时，在屏幕中央显式一段文字动画，例如：`"LEVEL 3\nMIDTOWN SOUTH"`，持续 2-3 秒后淡出。
    *   **边界条件:** 第 10 关（自由女神像）的视频播放完毕后，不再显示新的关卡提示，而是直接触发 `triggerGameOver()` 进入个人简历页面。

### 3.2 检查点大楼替换 (Checkpoint Building Replacement)
*   **资源加载 (`preload`):**
    *   需要新增或重用 SVG 资产来代表 10 个地标。
    *   *已知已有资产:* `empire_state.svg`, `chrysler.svg`, `statue_of_liberty.svg`。
    *   *需新增资产 (Placeholder 即可，保持与现有风格一致的 SVG):* `plaza_hotel.svg`, `vessel.svg`, `washington_arch.svg`, `tenement.svg`, `cast_iron.svg`, `brooklyn_bridge.svg`, `one_wtc.svg`。
*   **生成逻辑 (`spawnCheckpoint`):**
    *   根据当前 `currentLevel`，获取对应的地标贴图（Sprite）。
    *   **全息屏幕定位:** 读取该地标配置的 `screenBox`，在计算出的绝对位置叠加原本的 `screenBuilding` (纯色框，设为半透明或发光材质)，用于精准定位 React 层的 YouTube iframe。
    *   **TV 图标保留:** 原有的 `tv` 图标将继续保留，悬浮在计算出的 `screenBox` 上方，提示玩家此处可播放视频。
*   **Boss 战与 Level 10 流程调整:**
    *   当前代码在打败 Boss 后直接结束游戏。修改流程：在击败 Boss 后，停止刷怪，场景继续滚动一段时间，随后生成第 10 关的检查点（自由女神像基座/Liberty Island）。
    *   玩家触碰该检查点后，播放最后一个视频。视频结束后触发通关（Resume 页面）。
    *   原本 `spawnBoss` 中的背景自由女神像 (`statue_of_liberty`) 可以作为远景预告保留，而检查点使用的则是可交互的地标精灵。

### 3.3 背景与生成逻辑调整
*   普通的滚动背景 (`city_far`, `city_near`) 保持不变，维持游戏性能和开发周期的可控。
*   普通的障碍物大楼 (`spawnBuilding`) 依然从随机池中抽取（可适当增加种类），但它们不承担播放视频的责任。

## 4. 后续步骤 (Next Steps)
1.  **资产准备:** 创建 7 个新的 SVG 占位符文件（形状、颜色与现有资产风格统一）。
2.  **代码修改:** 更新 `MainScene.ts`，引入 Level 数组、关卡标题动画，并修改 `spawnCheckpoint` 逻辑以使用关卡特定的地标。