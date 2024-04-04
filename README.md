# Pure JS Atari Breakout

Run from command line  

~~~sh
npm run dev
~~~

## Favicon

[Favicon creator](https://www.favicon.cc/)

## MUTE STUPID MUSIC (music is disabled right now):
~~~
- use 'm' key to mute and unmute stupid soundtrack
~~~

## Highly recommended keyboard shortcuts & additional functionality

~~~
- Enter in start screen -> start game
- Escape while in game -> toggle pause menu
- Escape while in pause menu -> reset game and update score list
- Enter while in pause menu -> continue game 
- Pressing p or P in game -> toggle increasing ball speed (toggleing off will result in the current speed remaining)
  (this applies for the whole session. Meaning if you press p to toggle velocity increasing, it will stay toggled for
   the next game too until p is pressed again)
~~~

## Shortcomings:
    - Paddle is redrawn a fraction after game over if player presses arrow key(s) fast
    - Naive approach towards UI rendering

## Notes/Design Choices:
    - Currently, if the game is reset, the score is still recorded. 
    - Current score is displayed only in pause menu to avoid unnecessary
      clutter when playing

## Critical solved problems:
    - Tunneling
        - the old function is uncommented, but remains in the code, so the workflow towards fixing can be found there
        - reason: the code that refactors the blocks was not efficient/fast enough
    - Ball hit paddle sound effect
        - hits in succession within a small time frame solved: used an array of audio objects to instantly cycle to next 
          object instead of waiting 100ms in setTimeOut
        - To avoid delay of sound effect for first hit (due to browser loading the audio file), I "prime" each audio object
          in array (play them and then pause them immediately) to force them being preloaded

## What to add:
    - Refactor UI rendering towards a more thread focused approach

## git usage reminder 

~~~sh
    git add .
    git commit -a -m "$1"
    git push
~~~