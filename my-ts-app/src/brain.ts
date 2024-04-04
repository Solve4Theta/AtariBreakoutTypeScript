

export class Paddle {
   width: number = 175;
   height: number = 20;
   speed: number = 0;
   private intervalId: number = 0;
   velocity: number = 0;
   maxSpeed: number = 10;
   left: number;
   top: number;
   color: string;

   constructor(left: number, top: number, color: string) {
      this.left = left;
      this.top = top;
      this.color = color;
   }

   validateAndFixPosition(borderThickness: number) {
      if (this.left < borderThickness) 
         this.left = borderThickness;
      if ((this.left + this.width) > 1000 - borderThickness) 
         this.left = 1000 - borderThickness - this.width;
   }

   startMove(direction: number, borderThickness: number) {
      if (this.intervalId !== 0) 
         cancelAnimationFrame(this.intervalId);
       
      if (Math.sign(this.velocity) !== Math.sign(direction)) 
         this.velocity += direction * this.maxSpeed; 
      else 
         this.velocity = direction * this.maxSpeed;

      const move = () => {
          if (Math.abs(this.velocity) < 1) {
            this.velocity = 0;
            return;
          }

          this.left += this.velocity;
          this.validateAndFixPosition(borderThickness);
          this.intervalId = requestAnimationFrame(move);
      };
      this.intervalId = requestAnimationFrame(move);
   }

   stopMove(borderThickness: number) {
      if (this.intervalId !== 0) 
         cancelAnimationFrame(this.intervalId);
      
      const decelerate = () => {
         this.velocity *= 0.9; // Deceleration factor. Adjust for smoothness/playability
         if (Math.abs(this.velocity) < 0.5) {
             this.velocity = 0;
             cancelAnimationFrame(this.intervalId);
             this.intervalId = 0;
             return;
         }
         this.left += this.velocity;
         this.validateAndFixPosition(borderThickness);
         this.intervalId = requestAnimationFrame(decelerate);
     };
     decelerate();
   }
}

export class Ball {
   private playBallHitSound: () => void;
   private intervalId: number = 0;
   gameWon: boolean;
   gameOver: boolean;
   score: number;
   left: number;
   top: number;
   diameter: number;
   color: string;
   dx: number;
   dy: number;
   speedFactor: number;
   speedFactorFlag: boolean;

   constructor(left: number, top: number, diameter: number, color: string, dx: number, dy: number,
               playBallHitSound: () => void) {
      this.playBallHitSound = playBallHitSound;
      this.gameWon = false;
      this.gameOver = false;
      this.score = 0;
      this.left = left;
      this.top = top;
      this.diameter = diameter;
      this.color = color;
      this.dx = dx;
      this.dy = dy;
      this.speedFactor = 1;
      this.speedFactorFlag = false;
   }

   checkBorderCollision(borderThickness: number) {
      const GAME_WIDTH: number = 1000; 
      const GAME_HEIGHT: number = 1000;
  
      let ballDiameter: number = this.diameter;

      // left collision
      if (this.left < borderThickness) {
          this.left = borderThickness + 1; 
          this.dx = -this.dx;
      }
      // right collision
      else if ((this.left + ballDiameter) > GAME_WIDTH - borderThickness) {
          this.left = GAME_WIDTH - borderThickness - ballDiameter - 1;
          this.dx = -this.dx;
      }
      // top collision
      if (this.top < borderThickness) {
          this.top = borderThickness + 1; 
          this.dy = -this.dy;
      }
      // bottom collision
      else if ((this.top + ballDiameter) > GAME_HEIGHT - borderThickness) {
          this.top = GAME_HEIGHT - borderThickness - ballDiameter; 
          this.dy = -this.dy;
          this.gameOver = true;
      }
   }

   checkPaddleCollision(paddle: Paddle) {

      let BallDiameter: number = this.diameter;
  
      let ballBottom: number = this.top + BallDiameter;
      let ballTop: number = this.top;
      let ballRight: number = this.left + BallDiameter;
      let ballLeft: number = this.left;  

      let paddleLeft: number = paddle.left;
      let paddleRight: number = paddle.left + paddle.width;
      let paddleTop: number = paddle.top;
      let paddleBottom: number = paddle.top + paddle.height;
      let ballCenterX: number = this.left + BallDiameter / 2;
  
      if (ballBottom >= paddleTop && ballTop < paddleTop && 
         ballLeft + BallDiameter > paddleLeft && ballLeft < paddleLeft + paddle.width) {
 
         // Relative impact point from -1 (left) to 1 (right)
         let impactPointNormalized = (ballCenterX - (paddleLeft + paddle.width / 2)) / (paddle.width / 2);
 
         this.dy = -Math.abs(this.dy);
 
         // Adjust dx based on the impact point, ensuring a change in direction
         // We use a multiplier to control the influence of the impact point on the bounce angle
         const influenceMultiplier = 5;
         this.dx = influenceMultiplier * impactPointNormalized;
 
         let speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
         const desiredSpeed = 7; // Adjust if needed (additional feature?)
         let speedAdjustmentFactor = desiredSpeed / speed;
         this.dx *= speedAdjustmentFactor;
         this.dy *= speedAdjustmentFactor;
         this.top = paddleTop - BallDiameter - 1;
     }
     
      // Bottom collision
      else if (ballTop <= paddleBottom && ballBottom > paddleBottom &&
               ballRight > paddleLeft && ballLeft < paddleRight) {
          this.dy = Math.abs(this.dy); // Ensure the ball moves downwards
          this.top = paddleBottom + 1; 
      }
  
      // Side collisions
      // Right side of the paddle
      if (ballLeft <= paddleRight && ballRight > paddleRight &&
          ballBottom > paddleTop && ballTop < paddleBottom) {
          this.dx = Math.abs(this.dx); 
          this.left = paddleRight + 1; // + 1 just in case 
      }
      // Left side of the paddle
      else if (ballRight >= paddleLeft && ballLeft < paddleLeft &&
               ballBottom > paddleTop && ballTop < paddleBottom) {
          this.dx = -Math.abs(this.dx); 
          this.left = paddleLeft - this.diameter - 1; // -1 just in case
      }
  }


   // checkBlockCollision(blocks) {
   //    blocks.forEach((block, index) => {
   //       if (block.isActive && this.left < block.left + block.width && 
   //          this.left + this.diameter > block.left && 
   //          this.top < block.top + block.height && 
   //          this.top + this.diameter > block.top) {

   //          // Do this if you want the velocity of the ball to increase
   //          // dramatically between the top of the blocks and top border
   //          // this.dy = -this.dy - 1;
   //          this.dy = -this.dy;
   //          if (blocks[index].life > 0) blocks[index].life -= 1;
   //          else { blocks[index].isActive = false;
   //                 this.score += 1; }
   //          this.colliding = true;
   //          setTimeout(() => { this.colliding = false; }, 1000);
   //       }
   //    });
   // }

   checkBlockCollision(blocks: Block[]) {
      blocks.forEach((block: Block, index: number) => {
          if (!block.isActive) return;
  
          let ballLeft: number = this.left, ballRight = this.left + this.diameter;
          let ballTop: number = this.top, ballBottom = this.top + this.diameter;
          let blockLeft: number = block.left, blockRight = block.left + block.width;
          let blockTop: number = block.top, blockBottom = block.top + block.height;
  
          if (ballRight > blockLeft && ballLeft < blockRight && ballBottom > blockTop && ballTop < blockBottom) {

               this.playBallHitSound();

              let overlapLeft = ballRight - blockLeft;
              let overlapRight = blockRight - ballLeft;
              let overlapTop = ballBottom - blockTop;
              let overlapBottom = blockBottom - ballTop;
  
              // Assume the smallest overlap as the direction of collision
              let minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
  
              switch (minOverlap) {
                  case overlapLeft:
                      this.dx = -Math.abs(this.dx);
                      this.left -= overlapLeft; 
                      break;
                  case overlapRight:
                      this.dx = Math.abs(this.dx);
                      this.left += overlapRight;
                      break;
                  case overlapTop:
                      this.dy = -Math.abs(this.dy);
                      this.top -= overlapTop;
                      break;
                  case overlapBottom:
                      this.dy = Math.abs(this.dy);
                      this.top += overlapBottom;
                      break;
              }
              if (blocks[index].life > 0) blocks[index].life -= 1;
              else { blocks[index].isActive = false; this.score += 1; }
          }
      });
  }


   refactorBlocks(blocks: Block[]) {
      const indices: number[] = [];
      let activeBlocks: number = 0;
      blocks.forEach((block: Block, index: number) => {
         if (block.isActive === false) 
            indices.push(index);
         else { activeBlocks += 1; };
      })

      for (let i: number = indices.length - 1; i >= 0; i--) 
         blocks.splice(indices[i], 1);

      if (activeBlocks === 0) 
         this.gameWon = true;
      
      return blocks;
   }

   moveBall(borderThickness: number, paddle: Paddle, blocks: Block[]) {
      if (this.intervalId !== 0) return; // Avoid reinitializing the animation

      const move = () => {
         if (this.speedFactorFlag)
            this.speedFactor += 0.0001;
         else this.speedFactor = 1;
         this.left += this.dx * this.speedFactor;
         this.top += this.dy * this.speedFactor;
         this.checkBorderCollision(borderThickness);
         this.checkPaddleCollision(paddle);
         this.checkBlockCollision(blocks);
         blocks = this.refactorBlocks(blocks);

         if (this.intervalId !== 0) {
            this.intervalId = requestAnimationFrame(move);
         }
      };
      this.intervalId = requestAnimationFrame(move);
   }

   stopBall() {
      cancelAnimationFrame(this.intervalId);
      this.intervalId = 0;
  }
}

export class Block {
   left: number;
   top: number;
   width: number;
   height: number;
   color: string;
   isActive: boolean;
   life: number;

   constructor(left: number, top: number, width: number, height: number, color: string, life: number) {
       this.left = left;
       this.top = top;
       this.width = width;
       this.height = height;
       this.color = color;
       this.isActive = true; 
       this.life = life;
   }
}

export default class Brain {
   width: number = 1000;
   height: number = 1000;
   borderThickness: number = 30;
   paddle: Paddle;
   ball: Ball;
   blocks: Block[] = [];

   constructor(playBallHitSoundCallback: () => void) {
      this.initializeBlocks();
      this.paddle = new Paddle(50, 900, 'darkgray');
      this.ball = new Ball(900, 900, 20, 'black', -3, -7, playBallHitSoundCallback);
   }

   initializeMoveBall() {
      this.ball.moveBall(this.borderThickness, this.paddle, this.blocks);
   }

   stopBallMove() {
      this.ball.stopBall();
   }

   initializeBlocks() {
      const rows: number = 5;
      const cols: number = 10;
      const blockWidth: number = 80;
      const blockHeight: number = 20;
      const padding: number = 10; // Space between blocks
      const offsetTop: number = 100; // Starting Y position
      const offsetLeft: number = 50; // Starting X position
      let blockLife: number = 5;

      for (let row: number = 0; row < rows; row++) {
         blockLife -= 1;
         for (let col: number = 0; col < cols; col++) {
            let left = offsetLeft + (col * (blockWidth + padding));
            let top = offsetTop + (row * (blockHeight + padding));
            this.blocks.push(new Block(left, top, blockWidth, blockHeight, 'deepskyblue', blockLife));
         }
      }
   }

   startMovePaddle(paddle: Paddle, step: number) {
      paddle.startMove(step, this.borderThickness);
   }

   stopMovePaddle(paddle: Paddle) {
      paddle.stopMove(this.borderThickness);
   }
}