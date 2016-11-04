/* globals __DEV__ */
import Phaser from 'phaser';
import Bubble from '../sprites/Bubble';
import Ship from '../sprites/Ship';
import Board from '../sprites/Board';
import BubbleOrder from '../sprites/BubbleOrder';
import Grid from '../sprites/Grid';
import {setResponsiveWidth} from '../utils';

export default class extends Phaser.State {
  init () {}
  preload () {}

  create () {
    //These bounds probably need something more intelligent. These are just some made up values
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.bubbleRadius = 32;
    this.grid = {width: 12, height: 15};
    this.leftBound = 32;
    this.rightBound = this.leftBound + this.grid.width * this.bubbleRadius;
    //this.bubbleColors = ['blue', 'red','purple','green','yellow'];
    this.bubbleColors = ['blue', 'red','green'];
    //DEBUG lines
    this.leftLine = new Phaser.Line(this.leftBound, 0, this.leftBound, this.game.world.height);
    this.rightLine = new Phaser.Line(this.rightBound, 0, this.rightBound, this.game.world.height);
    //this.bottomLine = new Phaser.Line(this.leftBound, this.game.world.height - 2*this.bubbleRadius, this.rightBound, this.game.world.height - 2* this.bubbleRadius);
    this.centerLine = new Phaser.Line(this.leftBound + (this.rightBound - this.leftBound)/2, this.game.world.height - 2* this.bubbleRadius, this.leftBound + (this.rightBound - this.leftBound)/2, this.game.world.height);

    //The ship's left and the right boundary are set bubbleRadius/2 inwards to avoid shooting bubbles into the walls
    this.ship = new Ship({
      game: this.game,
      x: this.leftBound + (this.rightBound - this.leftBound) / 2,
      y: this.game.world.height - this.bubbleRadius,
      asset: 'ship',
      rightBound:this.rightBound ,
      leftBound:this.leftBound,
      bubbleColors: this.bubbleColors
    });
    this.game.add.existing(this.ship);


    this.bubblesOnGrid = [];
    //dathis.makeGrid();

    this.bubbleOrder = new BubbleOrder({
      game: this.game,
      x:this.rightBound + this.bubbleRadius,
      y:this.bubbleRadius * 20,
      asset:'bubbleorder',
      ship:this.ship
    });
    this.game.add.existing(this.bubbleOrder);
    this.bubbleGrid= new Grid({
      game:this.game,
      x:this.leftBound,
      y:this.game.world.height,
      asset:'redbubble',
      leftBound:this.leftBound,
      rightBound:this.rightBound,
      width:this.grid.width,
      startingBubbleY:10,
      bubbleColors:this.bubbleColors
    });
    this.game.add.existing(this.bubbleGrid);
  }
  update() {
    //Move with A and D.
    //Shoot with left mouse button.
    //Ship movement
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.A)) {
      this.ship.move('left');
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.D)) {
      this.ship.move('right');
    } else {
      this.ship.move('nowhere');
    }

    //Shooting the bubble
    if(this.game.input.activePointer.leftButton.isDown) {
      this.ship.shoot();
      this.game.add.existing(this.ship.bubble);
    }

    //Check collision between the bubble that is being shot and the bubbles on the grid
    this.game.physics.arcade.overlap(
      this.ship.bubble,
      this.bubbleGrid.collisionGroup,
      this.bubbleCollision,
      null,
      this
    );
  }

  render () {
    if (__DEV__) {
      //DEBUG LINES
      this.game.debug.geom(this.leftLine, "#000000");
      //this.game.debug.geom(this.bottomLine, "#000000");
      this.game.debug.geom(this.rightLine, "#000000");
      this.game.debug.geom(this.centerLine, "#000000");
    }
  }

  //Gets called when the bubble that is currently being shot hits one of the bubbles on the grid.
  bubbleCollision(activeBubble, gridBubble) {
    //if(activeBubble.alive){
      if(activeBubble.color === gridBubble.color){
        this.bubbleGrid.onHit(gridBubble);
      }
      activeBubble.kill();
      this.ship.readyGun();
      this.bubbleOrder.updateOrder();
    //}

    //this.ship.bubble = null;
    //this.bubbleGrid.snapToGrid(activeBubble.body.center.x,activeBubble.body.center.y,activeBubble);

  }

  //Makes a grid of bubbles
  makeGrid() {
    //Creating some targets
    //Not Final
    for(var j=0; j < 3; j++) {
      for(var i = 0; i < 20; i++) {
        this.bubblesOnGrid[j * 20 +i] = new Bubble({
          game: this.game,
          x: this.leftBound + i*this.bubbleRadius + this.bubbleRadius/2,
          y: 400 + j*this.bubbleRadius,
          asset: 'bluebubble',
          rightBound: this.rightBound,
          leftBound: this.leftBound
        });
        this.bubblesOnGrid[j*20 +i].shot = true;
        this.game.add.existing(this.bubblesOnGrid[j * 20 + i]);
      }
    }
  }



}
