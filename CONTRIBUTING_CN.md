# 参与贡献 | Contributing to Dragon vs New York

[English Version](./CONTRIBUTING.md)

感谢您对《飞龙大战纽约》项目的关注！我们欢迎任何形式的贡献。

## 🌟 如何贡献？

### 报告 Bug

在创建 Bug 报告之前，请先查看现有的 issues。创建 Bug 报告时，请尽可能详细地描述：

- **使用清晰简洁的标题**
- **描述重现问题的准确步骤**
- **提供具体的示例**
- **描述你观察到的行为和预期的行为**
- **如果可能，包含屏幕截图或 GIF**
- **注明你的浏览器和操作系统**

### 提出改进建议

改进建议通过 GitHub issues 进行跟踪。创建改进建议时：

- **使用清晰简洁的标题**
- **详细描述建议的改进**
- **解释为什么这个改进会有用**
- **列举一些使用示例**

### 提交 Pull Request

1. **Fork 这个仓库**，并从 `main` 分支创建你的分支
2. **安装依赖**：`npm install`
3. **进行修改**
4. **测试你的修改**：确保使用 `npm run dev` 运行游戏正常
5. **构建项目**：运行 `npm run build` 确保编译通过
6. **提交修改**，使用清晰的提交信息
7. **推送到你的 Fork**，并提交 Pull Request

#### Pull Request 指南

- 遵循现有的代码风格（TypeScript、React 最佳实践）
- 编写清晰简洁的提交信息
- 必要时在代码中添加注释
- 如需要，更新文档
- 彻底测试你的修改

## 🎮 开发环境设置

```bash
# 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/home-game.git
cd home-game

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
src/
├── components/          # React 组件
│   ├── GameCanvas.tsx  # 主游戏画布（Phaser）
│   ├── UIOverlay.tsx   # 游戏UI元素
│   ├── VideoModal.tsx  # YouTube 视频播放器
│   └── ResumeScreen.tsx # 简历展示
├── game/               # 游戏逻辑
│   ├── GameConfig.ts   # 游戏配置
│   ├── GameEvents.ts   # 自定义游戏事件
│   └── scenes/         # Phaser 场景
│       └── MainScene.ts # 主游戏场景
└── App.tsx             # 根组件
```

## 💡 开发提示

### 添加新功能

- **游戏机制**：修改 `src/game/scenes/MainScene.ts`
- **UI 组件**：在 `src/components/` 中添加 React 组件
- **配置**：更新 `src/game/GameConfig.ts`
- **敌人/武器**：在 MainScene 中扩展游戏类

### 编码规范

- 使用 TypeScript 并提供适当的类型定义
- 遵循 React 19 最佳实践
- 使用函数组件和 Hooks
- 保持组件模块化和可复用
- 为复杂的游戏逻辑添加注释

### 测试你的修改

- 在多个浏览器中测试（Chrome、Firefox、Safari）
- 检查移动端响应式
- 验证游戏性能
- 测试所有控制方式（键盘、鼠标）
- 确保 Boss 战和简历屏幕正常工作

## 🎨 素材指南

如果你要添加游戏素材（精灵、声音、背景）：

- 使用适当的文件格式（PNG 用于精灵，MP3/OGG 用于音频）
- 优化文件大小
- 确保素材符合赛博朋克美学
- 如使用第三方素材，请注明出处
- 将素材放置在 `public/` 目录中

## 📝 提交信息格式

使用清晰、描述性的提交信息：

```
feat: 添加新的武器升级系统
fix: 解决 Boss 战碰撞 Bug
docs: 更新 README 部署说明
style: 使用 prettier 格式化代码
refactor: 简化敌人生成逻辑
```

## 🤝 行为准则

请注意，本项目遵循[行为准则](./CODE_OF_CONDUCT_CN.md)。参与本项目即表示您同意遵守其条款。

## ❓ 有问题？

欢迎提出 issue 或联系维护者。

## 📜 许可证

通过贡献，您同意您的贡献将在 MIT 许可证下授权。

---

感谢您的贡献！ 🐉✨
