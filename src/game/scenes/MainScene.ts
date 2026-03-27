import Phaser from 'phaser';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    // placeholders
  }

  create() {
    this.add.text(100, 100, 'Dragon Game Loaded', { color: '#0f0' });
  }
}