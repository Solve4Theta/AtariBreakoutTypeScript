import Brain from "./brain.ts";
import UI from "./ui.ts"

let gameActive: boolean = false;
let gamePaused: boolean = false;
let gameAnimationId: number = 0;
// let soundEffectTimeoutId: number | undefined;
let brain: Brain | null = null; // brain can hold either Brain or null
let ui: UI | null = null;
const appDiv = document.querySelector("#app") as HTMLElement;
let results: number[] = []; 
// const kurjam = document.querySelector("#kaRikkadNutavad") as HTMLAudioElement;
const death = document.querySelector("#death") as HTMLAudioElement;
const sonofabitch = document.querySelector("#sonofabitch") as HTMLAudioElement;

const ballHitSounds: HTMLAudioElement[] = new Array(10).fill(null).map(() => {
    const audio = new Audio("audio/tennisballbounce-39028-[AudioTrimmer.com].mp3"); 
    audio.preload = 'auto'; // trying to let the browser know that the audio must be preloaded
    return audio;
});
let currentBallHitSoundIndex = 0;

const playBallHitSound = () => {
    const sound = ballHitSounds[currentBallHitSoundIndex];
    sound.currentTime = 0; // Rewind to the start
    sound.play().catch((e) => console.error("Failed to play the ball hit sound", e));

    // move back to start of array if reached end
    currentBallHitSoundIndex = (currentBallHitSoundIndex + 1) % ballHitSounds.length;
};

function sortAndDisplayScores() {
    results.sort((a, b) => b - a);

    // let's limit the list to five of the highest scores
    if (results.length > 5) 
        results = results.slice(0, 5);
    
    updateBestResults();
}

function toggleGameElements(show: boolean) {
    // Have to specify HTMLElement so that TS can be sure that we can access .style
    const pauseButton = document.querySelector('#pauseButton') as HTMLElement;
    if (pauseButton !== null) 
        pauseButton.style.display = show ? "block" : "none";
    else 
        console.error("pauseButton element was null in toggleGameElements!");
}

function toggleMenu(show: boolean, continueOnly: boolean = false) {
    const gameMenu = document.querySelector('#gameMenu') as HTMLElement;
    gameMenu.classList.toggle('show', show);

    const startButton = document.querySelector('#startButton') as HTMLElement;
    if (startButton !== null) 
        startButton.style.display = continueOnly ? "none" : "block";
    else
        console.error("startButton element was null in toggleMenu!");
    
    const continueButton = document.querySelector('#continueButton') as HTMLElement;
    if (continueButton !== null) 
        continueButton.style.display = continueOnly ? "block" : "none";
    else
        console.error("continueButton element was null in toggleMenu");
}

function gameOver() {
    gamePaused = false;
    gameActive = false;

    if (brain !== null && brain.ball !== null)
        results.push(brain.ball.score);

    const currentScore = document.querySelector('#currentScore') as HTMLElement;
    if (currentScore !== null)
        currentScore.textContent = '';
    else
        console.error("currentScore element was null in gameOver!");

    sortAndDisplayScores();
    cancelAnimationFrame(gameAnimationId);

    if (brain !== null)
        brain.stopBallMove();
    else
        console.error("brain was null in gameOver!");

    toggleGameElements(false);
    toggleMenu(true);

    const bestResults = document.querySelector('#bestResults') as HTMLElement;
    if (bestResults !== null) 
        bestResults.style.display = "block";
    else
        console.error("bestResults element was null in gameOver!");

    const resetButton = document.querySelector('#resetButton') as HTMLElement;
    if (resetButton !== null) 
        resetButton.style.display = "none";
    else
        console.error("resetButton element was null in gameOver!");

    // kurjam.pause();
    // kurjam.currentTime = 0;

    death.play().then(() => {
        setTimeout(() => {
            death.pause(); 
            death.currentTime = 0; 
        }, 1000);
    }).catch(error => {
        console.error("Playback failed:", error);
    });
}

function gameWon() {
    gamePaused = false;
    gameActive = false;

    if (brain !== null)
        results.push(brain.ball.score);
    else 
        console.error("brain was null in gameWon!");

    // Telling TS to ignore possible 'null' regarding currentScore div
    document.querySelector('#currentScore')!.textContent = 'Game Won!';
    sortAndDisplayScores();

    // Already checked if brain was null
    brain!.stopBallMove();
    toggleGameElements(false);
    toggleMenu(true);

    const bestResults = document.querySelector('#bestResults') as HTMLElement;
    if (bestResults !== null) 
        bestResults.style.display = "block";
    else
        console.error("bestResults element was null in gameWon!");

    const resetButton = document.querySelector('#resetButton') as HTMLElement;
    if (resetButton !== null) 
        resetButton.style.display = "none";
    else
        console.error("resetButton element was null in gameWon!");

    // kurjam.pause()
    // kurjam.currentTime = 0;

    sonofabitch.play().then(() => {
        setTimeout(() => {
            sonofabitch.pause(); 
            sonofabitch.currentTime = 0; 
        }, 2000);
    }).catch(error => {
        console.error("Playback failed sonoafabitch:", error);
    }); 

}

function resetGame() {
    if (gameActive || gamePaused) 
        results.push(brain!.ball.score);

    gamePaused = false;
    gameActive = true;

    const currentScore = document.querySelector('#currentScore');
    if (currentScore !== null)
        currentScore.textContent = '';
    else console.error("currentScore null in resetGame!");

    cancelAnimationFrame(gameAnimationId);
    if (brain !== null)
        brain.stopBallMove();
    else console.error("brain null in resetGame!");

    initializeGame(); 
    toggleMenu(false);
    toggleGameElements(true);

    // kurjam.currentTime = 0;
}

function pauseGame() {
    if (!gamePaused && gameActive) {
        if (brain !== null)
            brain.stopBallMove();
        else console.error("brain null in pauseGame!");
        cancelAnimationFrame(gameAnimationId);
        gamePaused = true;
        toggleGameElements(false);

        document.querySelector('#currentScore')!.textContent = "Current score: " + brain!.ball.score;
        sortAndDisplayScores();

        toggleMenu(true, true);

        const bestResults = document.querySelector('#bestResults') as HTMLElement;
        if (bestResults !== null) 
            bestResults.style.display = "block";
        else
            console.error("bestResults element was null in pauseGame!");
    
        const resetButton = document.querySelector('#resetButton') as HTMLElement;
        if (resetButton !== null) 
            resetButton.style.display = "block";
        else
            console.error("resetButton element was null in pauseGame!");

        // kurjam.pause();
    }
}

function continueGame() {
    if (gamePaused) {
        document.querySelector('#currentScore')!.textContent = '';
        gamePaused = false;
        toggleGameElements(true);
        toggleMenu(false);

        const resetButton = document.querySelector('#resetButton') as HTMLElement;
        if (resetButton !== null) 
            resetButton.style.display = "none";
        else console.error("resetButton was null in continueGame!");

        gameAnimationId = uiDrawRepeater();
        brain!.initializeMoveBall(); // no point in checking for brain null if we reassign anyway

        // kurjam.play();
    }
}

function uiDrawRepeater() {
    const draw = () => {
        if (!gamePaused) {
            if(brain!.ball.gameOver) {
                cancelAnimationFrame(gameAnimationId);
                // To allow for the gameOver logic to be implemented 
                // as soon as the call stack is cleared
                setTimeout(() => {
                    gameOver();
                }, 0);
                return;
            }
            else if (brain!.ball.gameWon) {
                cancelAnimationFrame(gameAnimationId);
                setTimeout(() => {
                    gameWon();
                }, 0);
                return;
            }
            ui!.draw();
            gameAnimationId = requestAnimationFrame(draw);
        }
    };
    return requestAnimationFrame(draw);
}

function updateBestResults() {
    const resultsList = document.querySelector('#resultsList');
    if (resultsList !== null) 
        resultsList.innerHTML = '';
    else console.error("resultsList null in updateBestResults!");

    results.forEach(score => {
        const li = document.createElement('li');
        li.textContent = score.toString();
        resultsList!.appendChild(li); // ignore possible null in resultsList
    });
}

function initializeGame() {
    brain = new Brain(playBallHitSound);
    ui = new UI(brain, appDiv);
    
    document.querySelector('#currentScore')!.textContent = '';
    if (gameAnimationId !== 0) {
        cancelAnimationFrame(gameAnimationId);
    }

    gamePaused = false;
    gameActive = true;
    toggleMenu(false);
    toggleGameElements(true);
    gameAnimationId = uiDrawRepeater();

    if (brain !== null)
        brain.initializeMoveBall();
    else console.error("brain null in initializeGame!");

    window.addEventListener('resize', () => {
        if (ui) 
            ui.draw(); 
    });

    // priming ballHitSounds for immediate playback
    ballHitSounds.forEach(sound => {
        sound.volume = 0; // Mute the sound temporarily
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
            sound.volume = 1; // Restore the volume
        }).catch(e => console.error("Audio priming failed:", e));
    });

    // kurjam.play();
}

function confirmSpeedToggle(isEnabled: boolean) {
    const confirmMes = document.querySelector('#speedToggleConfirm') as HTMLElement;
    if (confirmMes) {
        confirmMes.textContent = isEnabled ? "Speed Increased: ON" : "Speed Increased: OFF";
        confirmMes.style.display = 'block'; 

        setTimeout(() => {
            confirmMes.style.display = 'none';
        }, 2000);
    } else {
        console.error("speedToggleConfirm element not found!");
    }   
}


function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (!gamePaused && gameActive && brain !== null && ui !== null) {
            switch(e.key) {
                case 'ArrowLeft': brain.startMovePaddle(brain.paddle, -1); break;
                case 'ArrowRight': brain.startMovePaddle(brain.paddle, 1); break;
                case 'Escape': pauseGame(); break;
            }
            ui.drawPaddle(brain.paddle);
        }
        else if (!gameActive) {
            if (e.key == 'Enter') { initializeGame(); };
        }
        else if (gamePaused) {
            if (e.key == 'Escape') { resetGame(); }
            else if (e.key == 'Enter') { continueGame(); };
        }

        if (e.key == 'p' || e.key == 'P') {
            if (brain != null) {
                brain.ball.speedFactorFlag = !brain.ball.speedFactorFlag;
                confirmSpeedToggle(brain.ball.speedFactorFlag);
            }
        }

        // if (e.key == 'm' || e.key == 'M') {
            // kurjam.muted = !kurjam.muted;
        // }
    });

    document.addEventListener('keyup', (e) => {
        if (!gamePaused && (e.key === 'ArrowLeft' || e.key === 'ArrowRight') 
            && brain !== null && ui !== null) {
            brain.stopMovePaddle(brain.paddle);
            ui.drawPaddle(brain.paddle);
        }
    });
}

function setupButtonEventListeners() { 
    const startButton = document.querySelector('#startButton')
    if (startButton !== null) 
        startButton.addEventListener('click', initializeGame);
    else console.error("startButton null in setupButtonEventListeners!");

    const pauseButton = document.querySelector('#pauseButton')
    if (pauseButton !== null) 
        pauseButton.addEventListener('click', pauseGame);
    else console.error("pauseButton null in setupEventListeners!");

    const resetButton = document.querySelector('#resetButton')
    if (resetButton !== null)
        resetButton.addEventListener('click', resetGame);
    else console.error("resetButton null in setupButtonEventListeners!");

    const continueButton = document.querySelector('#continueButton')
    if (continueButton !== null)
        continueButton.addEventListener('click', continueGame);
    else console.error("continueButton null in setupButtonEventListeners!");
    // return [startButton, pauseButton, resetButton, continueButton];
}

function main() {
    toggleMenu(true);
    setupButtonEventListeners();
    setupEventListeners();
}

// ================== ENTRY POINT ==================
console.log("App startup...");
main();
