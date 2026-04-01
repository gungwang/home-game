# Contributing to Dragon vs New York | 飞龙大战纽约

[中文版](./CONTRIBUTING_CN.md)

Thank you for your interest in contributing to Dragon vs New York! We welcome contributions from everyone.

## 🌟 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots or GIFs if possible**
- **Note your browser and operating system**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would be used**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies**: `npm install`
3. **Make your changes**
4. **Test your changes**: Ensure the game runs correctly with `npm run dev`
5. **Build the project**: Run `npm run build` to ensure it compiles
6. **Commit your changes** with clear, descriptive commit messages
7. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- Follow the existing code style (TypeScript, React best practices)
- Write clear, concise commit messages
- Include comments in your code where necessary
- Update documentation if needed
- Test your changes thoroughly

## 🎮 Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/home-game.git
cd home-game

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── GameCanvas.tsx  # Main Phaser game canvas
│   ├── UIOverlay.tsx   # Game UI elements
│   ├── VideoModal.tsx  # YouTube video player
│   └── ResumeScreen.tsx # Resume display
├── game/               # Game logic
│   ├── GameConfig.ts   # Game configuration
│   ├── GameEvents.ts   # Custom game events
│   └── scenes/         # Phaser scenes
│       └── MainScene.ts # Main game scene
└── App.tsx             # Root component
```

## 💡 Development Tips

### Adding New Features

- **Game mechanics**: Modify `src/game/scenes/MainScene.ts`
- **UI components**: Add React components in `src/components/`
- **Configuration**: Update `src/game/GameConfig.ts`
- **Enemies/Weapons**: Extend the game classes in MainScene

### Coding Standards

- Use TypeScript with proper type definitions
- Follow React 19 best practices
- Use functional components with hooks
- Keep components modular and reusable
- Comment complex game logic

### Testing Your Changes

- Test in multiple browsers (Chrome, Firefox, Safari)
- Check mobile responsiveness
- Verify game performance
- Test all control schemes (keyboard, mouse)
- Ensure boss battle and resume screen work correctly

## 🎨 Asset Guidelines

If you're adding game assets (sprites, sounds, backgrounds):

- Use appropriate file formats (PNG for sprites, MP3/OGG for audio)
- Optimize file sizes
- Ensure assets match the cyberpunk aesthetic
- Provide attribution if using third-party assets
- Place assets in the `public/` directory

## 📝 Commit Message Format

Use clear, descriptive commit messages:

```
feat: Add new weapon upgrade system
fix: Resolve boss battle collision bug
docs: Update README with deployment instructions
style: Format code with prettier
refactor: Simplify enemy spawning logic
```

## 🤝 Code of Conduct

Please note that this project is released with a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## ❓ Questions?

Feel free to open an issue with your question or reach out to the maintainers.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🐉✨
