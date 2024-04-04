import Brain, { Ball, Block, Paddle } from "./brain";

export default class UI {
    // real screen dimensions
    width: number = -1;
    height: number = -1;
    brain: Brain | null = null;
    scaleX: number = 1;
    scaleY: number = 1;
    private appContainer: HTMLElement;
    scaledX: number;
    scaledY: number;
    scaledDiameter: number;

   constructor(brain: Brain, appContainer: HTMLElement) {
        this.scaledX = 0;
        this.scaledY = 0;
        this.scaledDiameter = 0;
        this.brain = brain;
        this.appContainer = appContainer;
        this.setScreenDimensions();
    }

    // setScreenDimensions(width, height) {
    setScreenDimensions() {
        // this.width = width || document.documentElement.clientWidth;
        // this.height = height || document.documentElement.clientHeight;
        this.width = document.documentElement.clientWidth;
        this.height = document.documentElement.clientHeight;

        if (this.brain !== null) {
            this.scaleX = this.width / this.brain.width;
            this.scaleY = this.height / this.brain.height; 
        }
        else console.error("brain null in UI -> setScreenDimensions!");
    }

    calculateScaledX(x: number, uniformScale: number = this.scaleX) {
        // '| 0' so I can use integers not floats
        return x * uniformScale | 0;
    }

    calculateScaledY(y: number, uniformScale: number = this.scaleY) {
        return y * uniformScale | 0;
    }

    drawBorderSingle(left: number, top: number, width: number, height: number, color: string) {
        let border = document.createElement('div') as HTMLElement;
        border.style.zIndex = 10 + ""; // Experimental to string conversion
        border.style.position = 'fixed';

        border.style.left = left + 'px';
        border.style.top = top + 'px';
        border.style.width = width + 'px';
        border.style.height = height + 'px';
        border.style.backgroundColor = color;
        
        this.appContainer.append(border);
    }

    drawBorder() {
        if (this.brain !== null) {
            // top border
            this.drawBorderSingle(0, 0, this.width, this.calculateScaledY(this.brain.borderThickness), 'powderblue');
            // left
            this.drawBorderSingle(0, 0, this.calculateScaledX(this.brain.borderThickness), this.height, 'powderblue');
            // right
            this.drawBorderSingle(this.width - this.calculateScaledX(this.brain.borderThickness), 0, 
            this.calculateScaledX(this.brain.borderThickness), this.height, 'powderblue');
            // bottom
            this.drawBorderSingle(0, this.height - this.calculateScaledY(this.brain.borderThickness),
            this.width, this.calculateScaledY(this.brain.borderThickness), 'powderblue');
        }
        else console.error("brain null in UI -> drawBorder!");
    }

    drawPaddle(paddle: Paddle) {
        let div = document.createElement('div');
        div.style.zIndex = 10 + "";
        div.style.position = 'fixed';

        div.style.left = this.calculateScaledX(paddle.left) + 'px';
        div.style.top = this.calculateScaledY(paddle.top) + 'px';
        div.style.width = this.calculateScaledX(paddle.width) + 'px';
        div.style.height = this.calculateScaledY(paddle.height) + 'px';
        div.style.backgroundColor = paddle.color;
        
        this.appContainer.append(div); 
    }

    drawBlock(block: Block) {
        if (!block.isActive) return; 
    
        let div = document.createElement('div');
        div.style.zIndex = 10 + "";
        div.style.position = 'fixed';

        div.style.left = this.calculateScaledX(block.left) + 'px';
        div.style.top = this.calculateScaledY(block.top) + 'px';
        div.style.width = this.calculateScaledX(block.width) + 'px';
        div.style.height = this.calculateScaledY(block.height) + 'px';
        div.style.backgroundColor = block.color;
        
        this.appContainer.append(div);
    }

    drawBall(ball: Ball) {
        let div = document.createElement('div');
        div.style.zIndex = 20 + ""; 
        div.style.position = 'fixed';

        // let uniformScale = Math.min(this.scaleX, this.scaleY);
        // ball.updateScale(uniformScale);
        // this.scaledX = this.calculateScaledX(ball.left, uniformScale);
        // this.scaledY = this.calculateScaledY(ball.top, uniformScale);
        // this.scaledDiameter = ball.diameter * uniformScale;

        // div.style.left = this.scaledX + 'px';
        // div.style.top = this.scaledY + 'px';
        // div.style.width = this.scaledDiameter + 'px';
        // div.style.height = this.scaledDiameter + 'px';
        // div.style.backgroundColor = ball.color;
        // div.style.borderRadius = '50%';

        div.style.left = this.calculateScaledX(ball.left) + 'px';
        div.style.top = this.calculateScaledY(ball.top) + 'px';
        div.style.width = this.calculateScaledX(ball.diameter) + 'px';
        div.style.height = this.calculateScaledY(ball.diameter) + 'px';
        div.style.backgroundColor = ball.color;
        div.style.borderRadius = '50%'; // This makes the square a circle

        this.appContainer.append(div);

    }

    draw() {
        this.setScreenDimensions();
        this.appContainer.innerHTML = '';

        this.drawBorder();

        if (this.brain !== null) {
            this.drawPaddle(this.brain.paddle);
            this.brain.blocks.forEach(block => this.drawBlock(block));
            this.drawBall(this.brain.ball); 
        }
        else console.error("brain null in UI -> draw!");
    }
}
