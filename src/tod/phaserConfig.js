import Phaser from 'phaser';
import { TOD_BASE_URL } from './consts';

import { WorldWidth, WorldHeight } from './World';
import { Player, PlayerStates } from './Player';
import Bullet from './Bullet';
import Enemy from './Enemy';

export const mainDivId = 'mainDivId';

const ScreenWidth = 800;
const ScreenHeight = 600;

var config = {
  parent: mainDivId,
  type: Phaser.AUTO,
  width: ScreenWidth,
  height: ScreenHeight,
  pixelArt: true,
  backgroundColor: '#2d2d2d',
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
    update: update,
    extend: {
      checkBulletVsEnemy: checkBulletVsEnemy,
      checkEnemyVsShip: checkEnemyVsShip,
      launchEnemy: launchEnemy,
      hitShip: hitShip,
      hitEnemy: hitEnemy
    }
  }
};

const game = new Phaser.Game(config);
let cursors;

let ship;
let playerHandgun;
let player;
var text;
var bullets;
var enemies;
var lastFired = 0;
var fire;
var xparticles;

let shipHp = 20;
let enemiesKilled = 0;
let shipHpText = '';

let gameOver = false;
let gameOverMsg;

function preload () {
  this.load.setBaseURL(TOD_BASE_URL);
  this.load.bitmapFont('atari', 'assets/fonts/atari-smooth.png', 'assets/fonts/atari-smooth.xml');
  this.load.image('ship', 'assets/fmship.png');
  this.load.image('ufo', 'assets/ufo.png');
  this.load.image('rocket', 'assets/projectiles/rocket.png');
  this.load.image('bullet', 'assets/projectiles/bullet.png');
  this.load.tilemapTiledJSON('map', 'assets/desert.json');
  this.load.image('tiles', 'assets/tmw_desert_spacing.png');
  this.load.spritesheet('player_handgun', 'assets/player_handgun.png',
    { frameWidth: 66, frameHeight: 60 }
  );

  this.load.atlas('space', 'assets/space.png', 'assets/space.json');
  this.load.atlas('explosion', 'assets/explosion.png', 'assets/explosion.json');
}

function create () {
  this.physics.world.setBounds(0, 0, WorldWidth, WorldHeight);
  this.cameras.main.setBounds(0, 0, WorldWidth, WorldHeight);

  const map = this.make.tilemap({ key: 'map' });
  const tiles = map.addTilesetImage('Desert', 'tiles');
  // layer = map.createDynamicLayer('Ground', tiles, 0, 0).setVisible(false);
  var layer = map.createStaticLayer('Ground', tiles, 0, 0);


  cursors = this.input.keyboard.createCursorKeys();

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

  const playerSpriteNameMap = {
    [PlayerStates.Vehicle]: { name: 'ship', size: { width: 60, height: 60 } },
    [PlayerStates.OnFoot]: { name: 'player_handgun', size: { width: 30, height: 30 } },
  };
  const playerSpriteMap = {};
  Object.keys(playerSpriteNameMap).forEach(state => {
    const { name, size }  = playerSpriteNameMap[state];
    const sprite = this.physics.add.image(0, 0, name)
      .setOrigin(0.5, 0.5).setDisplaySize(size.width, size.height)
      .setDepth(2).setActive(false).setVisible(false);
    playerSpriteMap[state] = sprite;
  });

  player = new Player({
    spriteMap: playerSpriteMap,
    initState: PlayerStates.Vehicle,
    initPosition: { x: 400, y: 100 },
    physics: this.physics,
    cursors: cursors,
    camera: this.cameras.main,
    onSpriteChange: onPlayerSpriteChange.bind(this),
  });


  let spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
  spaceKey.on('down', function (key, event) {
    player.toggleState();
  });
  // ship = this.physics.add.image(400, 100, 'ship').setDepth(2)
  //   .setCollideWorldBounds(true); // new Player();
  // this.physics.add.existing(ship);
    // new Player()).setDepth(2);
  // this.cameras.main.startFollow(ship, true, 0.08, 0.08);



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

  // xparticles.createEmitter({
  //   frame: 'red',
  //   angle: { min: 0, max: 360, steps: 32 },
  //   lifespan: 1000,
  //   speed: 400,
  //   quantity: 32,
  //   scale: { start: 0.3, end: 0 },
  //   on: false
  // });

  xparticles.createEmitter({
    frame: 'muzzleflash2',
    lifespan: 200,
    scale: { start: 2, end: 0 },
    rotate: { start: 0, end: 180 },
    on: false
  });

  // var particles = this.add.particles('space');

  // var emitter = particles.createEmitter({
  //   frame: 'blue',
  //   speed: 200,
  //   lifespan: {
  //     onEmit: function (particle, key, t, value)
  //     {
  //       return Phaser.Math.Percent(ship.body.speed, 0, 400) * 2000;
  //     }
  //   },
  //   alpha: {
  //     onEmit: function (particle, key, t, value)
  //     {
  //       return Phaser.Math.Percent(ship.body.speed, 0, 400);
  //     }
  //   },
  //   angle: {
  //     onEmit: function (particle, key, t, value)
  //     {
  //       // var v = Phaser.Math.Between(-10, 10);
  //       var v = 0;
  //       return (ship.angle - 180) + v;
  //     }
  //   },
  //   scale: { start: 0.6, end: 0 },
  //   blendMode: 'ADD'
  // });
  //
  // emitter.startFollow(ship);

  for (var i = 0; i < 6; i++)
  {
    this.launchEnemy();
  }

  // var graphics = this.add.graphics({ x: 0, y: 0, fillStyle: { color: 0xff00ff, alpha: 0.6 }, lineStyle: { color: 0x00ff00 } });
  shipHpText = this.add.text(ScreenWidth-300, 100).setScrollFactor(0);
  gameOverMsg = this.add.text(ScreenWidth / 2.0 - 40, ScreenHeight / 2.0 - 40)
    .setText('Game Over').setColor('#EF1903').setFontSize(16).setScrollFactor(0).setVisible(false);
  // var bounds1 = shipHpText.getTextBounds();
  // graphics.fillRect(bounds1.global.x, bounds1.global.y, bounds1.global.width, bounds1.global.height);

  this.cameras.main.setZoom(1.5);
}

function onPlayerSpriteChange(newSprite) {
  this.physics.add.overlap(newSprite, enemies, this.hitShip, this.checkEnemyVsShip, this);
  this.cameras.main.pan(newSprite.x, newSprite.y, 0.5);
  this.cameras.main.startFollow(newSprite, true, 0.08, 0.08);
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

function checkEnemyVsShip(enemy) {
  return enemy.active;
}

function hitShip (ship, enemy)
{
  xparticles.emitParticleAt(enemy.x, enemy.y);

  shipHp -= 10;
  enemiesKilled += 1;
  enemy.kill();

  if (shipHp <= 0) {
    this.cameras.main.shake(2000, 0.05);
    ship.setActive(false);
    ship.setVisible(false);
    gameOver = true;
  } else {
    this.cameras.main.shake(500, 0.01);
  }
}

function hitEnemy (bullet, enemy)
{
  xparticles.emitParticleAt(enemy.x, enemy.y);

  this.cameras.main.shake(300, 0.005);

  enemiesKilled += 1;
  bullet.kill();
  enemy.kill();
}

function update (time, delta)
{
  shipHpText.setText([`HP: ${shipHp}`, `Points: ${enemiesKilled*10}` ]);

  if (gameOver){
    gameOverMsg.setVisible(true);
    return;
  }

  player.update(time, delta, cursors);
  // const angularDelta = 2;
  // const speed = 3;
  // if (cursors.left.isDown)
  // {
  //   ship.setAngle(ship.angle - angularDelta);
  //   // ship.x -= 2.5;
  // }
  // else if (cursors.right.isDown)
  // {
  //   ship.setAngle(ship.angle + angularDelta);
  // }
  //
  // if (cursors.up.isDown)
  // {
  //   ship.x += speed * Math.cos(ship.rotation);
  //   ship.y += speed * Math.sin(ship.rotation);
  // }

  if (cursors.space.isDown && time > lastFired)
  {
    var bullet = bullets.get();

    if (bullet)
    {
      bullet.fire(player.activeSprite);

      lastFired = time + 100;
    }
  }
}