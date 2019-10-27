import Phaser from 'phaser';

export const PlayerStates = {
  'Vehicle': 'Vehicle',
  'OnFoot': 'OnFoot',
};

const PlayerParams = {
  'Vehicle': {
    velocity: 3,
    angularVelocity: 2,
  },
  'OnFoot': {
    velocity: 1,
    angularVelocity: 3,
  },
};

export const Player = class Player {
  spriteNamesMap = null;
  spriteMap = null;
  activeSprite = null;
  state = null;

  angle = 0;
  position = { x: 0, y: 0 };
  speed = 3;
  angularSpeed = 2;

  constructor(args) {
    const { spriteMap, initState, initPosition, onSpriteChange } = args;
    this.spriteMap = spriteMap;
    this.position = initPosition;
    this.onSpriteChange = onSpriteChange;
    this.setState(initState);
  }

  setState = (state) => {
    if (this.state !== state) {
      this.state = state;
      if (this.activeSprite) {
        this._setSpriteState(this.activeSprite, false);
      }
      this.activeSprite = this.spriteMap[state];
      this._setSpriteState(this.activeSprite, true);
    }
 };

  toggleState = () => {
    this.setState(this.state === PlayerStates.Vehicle ? PlayerStates.OnFoot : PlayerStates.Vehicle);
  };

  update = (time, delta, cursors) => {
    const sprite = this.activeSprite;

    const { velocity, angularVelocity } =  PlayerParams[this.state];
    // switch (this.state) {
      // case PlayerStates.Vehicle:
    if (cursors.left.isDown)
    {
      this.angle = this.angle - angularVelocity;
    }
    else if (cursors.right.isDown)
    {
      this.angle = this.angle + angularVelocity;
    }

    if (cursors.up.isDown)
    {
      const rad = Phaser.Math.DegToRad(this.angle);
      this.position.x += velocity * Math.cos(rad);
      this.position.y += velocity * Math.sin(rad);
    }

      // break;
      // case PlayerStates.OnFoot:
      //
      //   break;
      // default:
      //   console.warn(`Unexpected player state: ${this.state}`);
    // }

    sprite.setAngle(this.angle);
    sprite.x = this.position.x;
    sprite.y = this.position.y;
  };

  kill = () => {
    this._setSpriteState(this.activeSprite, false);
    this.activeSprite.body.stop();
  };

  _setSpriteState = (sprite, isActive) => {
    sprite.setActive(isActive).setVisible(isActive);
    if (isActive) {
      sprite.setCollideWorldBounds(true);
      sprite.x = this.position.x;
      sprite.y = this.position.y;
      // this.camera.pan(this.position.x, this.position.y, 0.5);
      // this.camera.startFollow(sprite, true, 0.08, 0.08);
      this.onSpriteChange(sprite);
    }
  };
};