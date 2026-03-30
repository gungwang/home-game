const fs = require('fs');
let code = fs.readFileSync('src/game/scenes/MainScene.ts', 'utf8');

// Remove IGNORED_LEVEL_COLORS array definition block
code = code.replace(/const IGNORED_LEVEL_COLORS = \[[^]*?\];/m, '');
// Remove IGNORED_LEVELS array definition block
code = code.replace(/const IGNORED_LEVELS: LevelConfig\[\] = \[[^]*?\];/m, '');

fs.writeFileSync('src/game/scenes/MainScene.ts', code, 'utf8');
