import Phaser from 'phaser';
import { TOD_BASE_URL } from './consts';

export const mainDivId = 'mainDivId';
const WorldHeight = 1280;
const WorldWidth = 1280;

var config = {
  parent: mainDivId,
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  physics: {
    default: 'arcade',
  },
  scene: {
    preload: preload,
    create: create,
    update: updateDirect,
  }
};

let ship;
const game = new Phaser.Game(config);
let cursors;

function preload () {
  this.load.setBaseURL(TOD_BASE_URL);
  this.load.image('ship', 'assets/fmship.png');
  this.load.tilemapTiledJSON('map', 'assets/desert.json');
  this.load.image('tiles', 'assets/tmw_desert_spacing.png');
}

function create () {
  this.cameras.main.setBounds(0, 0, WorldWidth, WorldHeight);
  this.physics.world.setBounds(0, 0, WorldWidth, WorldHeight);

  const map = this.make.tilemap({ key: 'map' });
  const tiles = map.addTilesetImage('Desert', 'tiles');
  // layer = map.createDynamicLayer('Ground', tiles, 0, 0).setVisible(false);
  var layer = map.createStaticLayer('Ground', tiles, 0, 0);

  cursors = this.input.keyboard.createCursorKeys();

  ship = this.add.image(400, 100, 'ship').setAngle(90);

  this.cameras.main.startFollow(ship, true, 0.08, 0.08);

  // this.cameras.main.setZoom(0.25);
}

function updateDirect ()
{
  if (cursors.left.isDown && ship.x > 0)
  {
    ship.setAngle(-90);
    ship.x -= 2.5;
  }
  else if (cursors.right.isDown && ship.x < WorldWidth)
  {
    ship.setAngle(90);
    ship.x += 2.5;
  }

  if (cursors.up.isDown && ship.y > 0)
  {
    ship.y -= 2.5;
  }
  else if (cursors.down.isDown && ship.y < WorldHeight)
  {
    ship.y += 2.5;
  }
}

// why was this provided in the example?
function update ()
{
  ship.setVelocity(0);

  if (cursors.left.isDown)
  {
    ship.setAngle(-90).setVelocityX(-200);
  }
  else if (cursors.right.isDown)
  {
    ship.setAngle(90).setVelocityX(200);
  }

  if (cursors.up.isDown)
  {
    ship.setVelocityY(-200);
  }
  else if (cursors.down.isDown)
  {
    ship.setVelocityY(200);
  }
}