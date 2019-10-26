import Phaser from 'phaser';

export const WorldHeight = 1280;
export const WorldWidth = 1280;

export const spaceInner = new Phaser.Geom.Rectangle(0, 0, WorldWidth, WorldHeight);
const outerPerimiterPadding = 100;
export const spaceOuter = new Phaser.Geom.Rectangle(-outerPerimiterPadding, -outerPerimiterPadding,
  WorldWidth+outerPerimiterPadding, WorldHeight+outerPerimiterPadding);