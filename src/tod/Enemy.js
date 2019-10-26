import Phaser from 'phaser';
import { spaceInner, spaceOuter } from './World';

export default new Phaser.Class({

  Extends: Phaser.Physics.Arcade.Sprite,

  initialize:

    function Enemy (scene)
    {
      Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'ufo');

      this.setDepth(1);

      this.speed = 100;
      this.checkOutOfBounds = false;
      this.target = new Phaser.Math.Vector2();
    },

  launch: function ()
  {
    // this.play('mine-anim');

    this.checkOutOfBounds = false;

    var p = Phaser.Geom.Rectangle.RandomOutside(spaceOuter, spaceInner);

    spaceInner.getRandomPoint(this.target);

    this.speed = Phaser.Math.Between(100, 400);

    this.setActive(true);
    this.setVisible(true);
    this.setPosition(p.x, p.y);

    this.body.reset(p.x, p.y);

    var angle = Phaser.Math.Angle.BetweenPoints(p, this.target);

    this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);
  },

  update: function (time, delta)
  {
    var withinGame = spaceInner.contains(this.x, this.y);

    if (!this.checkOutOfBounds && withinGame)
    {
      this.checkOutOfBounds = true;
    }
    else if (this.checkOutOfBounds && !withinGame)
    {
      this.kill();
    }
  },

  kill: function ()
  {
    this.setActive(false);
    this.setVisible(false);
    this.body.stop();
    this.scene.launchEnemy();
  }

});