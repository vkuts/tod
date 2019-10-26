import Phaser from 'phaser';
import { TOD_BASE_URL } from './consts';

import { WorldWidth, WorldHeight } from './World';
import Bullet from './Bullet';
import Enemy from './Enemy';

export const mainDivId = 'mainDivId';


var config = {
  parent: mainDivId,
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  // physics: {
  //   default: 'arcade',
  // },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      fps: 60,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: updateDirect,
    extend: {
      checkBulletVsEnemy: checkBulletVsEnemy,
      launchEnemy: launchEnemy,
      hitShip: hitShip,
      hitEnemy: hitEnemy
    }
  }
};

const game = new Phaser.Game(config);
let cursors;

let ship;
var text;
var bullets;
var enemies;
var lastFired = 0;
var fire;
var xparticles;

function preload () {
  this.load.setBaseURL(TOD_BASE_URL);
  this.load.image('ship', 'assets/fmship.png');
  this.load.image('ufo', 'assets/ufo.png');
  this.load.image('rocket', 'assets/projectiles/rocket.png');
  this.load.image('bullet', 'assets/projectiles/bullet.png');
  this.load.tilemapTiledJSON('map', 'assets/desert.json');
  this.load.image('tiles', 'assets/tmw_desert_spacing.png');

  this.load.atlas('space', 'assets/space.png', 'assets/space.json');
  this.load.atlas('explosion', 'assets/explosion.png', 'assets/explosion.json');
}

function create () {
  this.cameras.main.setBounds(0, 0, WorldWidth, WorldHeight);
  // this.matter.world.setBounds(0, 0, WorldWidth, WorldHeight);

  const map = this.make.tilemap({ key: 'map' });
  const tiles = map.addTilesetImage('Desert', 'tiles');
  // layer = map.createDynamicLayer('Ground', tiles, 0, 0).setVisible(false);
  var layer = map.createStaticLayer('Ground', tiles, 0, 0);

  cursors = this.input.keyboard.createCursorKeys();

  ship = this.physics.add.image(400, 100, 'ship').setDepth(2);

  this.cameras.main.startFollow(ship, true, 0.08, 0.08);

  bullets = this.physics.add.group({
    classType: Bullet,
    maxSize: 30,
    runChildUpdate: true
  });

  enemies = this.physics.add.group({
    classType: Enemy,
    maxSize: 60,
    runChildUpdate: true
  });

  this.physics.add.overlap(bullets, enemies, this.hitEnemy, this.checkBulletVsEnemy, this);

  xparticles = this.add.particles('explosion');

  xparticles.createEmitter({
      frame: [ 'smoke-puff', 'cloud', 'smoke-puff' ],
      angle: { min: 240, max: 300 },
      speed: { min: 200, max: 300 },
      quantity: 6,
      lifespan: 2000,
      alpha: { start: 1, end: 0 },
      scale: { start: 1.5, end: 0.5 },
      on: false
  });

  xparticles.createEmitter({
    frame: 'red',
    angle: { min: 0, max: 360, steps: 32 },
    lifespan: 1000,
    speed: 400,
    quantity: 32,
    scale: { start: 0.3, end: 0 },
    on: false
  });

  xparticles.createEmitter({
    frame: 'muzzleflash2',
    lifespan: 200,
    scale: { start: 2, end: 0 },
    rotate: { start: 0, end: 180 },
    on: false
  });

  var particles = this.add.particles('space');

  var emitter = particles.createEmitter({
    frame: 'blue',
    speed: 200,
    lifespan: {
      onEmit: function (particle, key, t, value)
      {
        return Phaser.Math.Percent(ship.body.speed, 0, 400) * 2000;
      }
    },
    alpha: {
      onEmit: function (particle, key, t, value)
      {
        return Phaser.Math.Percent(ship.body.speed, 0, 400);
      }
    },
    angle: {
      onEmit: function (particle, key, t, value)
      {
        // var v = Phaser.Math.Between(-10, 10);
        var v = 0;
        return (ship.angle - 180) + v;
      }
    },
    scale: { start: 0.6, end: 0 },
    blendMode: 'ADD'
  });

  emitter.startFollow(ship);

  for (var i = 0; i < 6; i++)
  {
    this.launchEnemy();
  }

  // this.cameras.main.setZoom(0.25);
}

function launchEnemy ()
{
  var b = enemies.get();

  if (b)
  {
    b.launch();
  }
}

function checkBulletVsEnemy (bullet, enemy)
{
  return (bullet.active && enemy.active);
}

function hitShip (ship, enemy)
{
}

function hitEnemy (bullet, enemy)
{
  xparticles.emitParticleAt(enemy.x, enemy.y);

  this.cameras.main.shake(500, 0.01);

  bullet.kill();
  enemy.kill();
}

function updateDirect (time)
{
  const angularDelta = 2;
  const speed = 3;
  if (cursors.left.isDown)
  {
    ship.setAngle(ship.angle - angularDelta);
    // ship.x -= 2.5;
  }
  else if (cursors.right.isDown)
  {
    ship.setAngle(ship.angle + angularDelta);
  }

  if (cursors.up.isDown)
  {
    ship.x += speed * Math.cos(ship.rotation);
    ship.y += speed * Math.sin(ship.rotation);
  }

  if (cursors.space.isDown && time > lastFired)
  {
    var bullet = bullets.get();

    if (bullet)
    {
      bullet.fire(ship);

      lastFired = time + 100;
    }
  }
}