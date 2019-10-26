import Phaser from 'phaser';

export const WorldHeight = 1280;
export const WorldWidth = 1280;

export const spaceInner = new Phaser.Geom.Rectangle(0, 0, 1280, 1280);

export const spaceOuter = new Phaser.Geom.Rectangle(-200, -200,
  1280+200, 1280+200);