<template>
  <div class="flex flex-col justify-center">
    <h1 class="text-3xl font-bold">
      <p :style="this.winner === '' ? { visibility: 'hidden' } : {}">{{ winner }} wins</p>
      {{ player1.score }} - {{ player2.score }}
    </h1>
    <canvas id="gameField" :height="fieldHeight" :width="fieldWidth"></canvas>
  </div>


</template>

<script lang="ts">
//height and width of game field (in px)
import {defineComponent} from "vue";
import io from 'socket.io-client';

const fieldH = 500;
const fieldW = 800;

//height and width of players (in px)
const playerH = 50;
const playerW = 10;

const limiterW = 4;

const playerSpeed = 2;
const ballSpeed = 2;

const ballRadius = 10;

const maxScore = 5;

interface Rect {
  x: number,
  y: number,
  w: number,
  h: number
}

class Player implements Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  moving: number;
  score: number;

  constructor(name: string, x: number, y: number = fieldH / 2 - playerH / 2) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.w = playerW;
    this.h = playerH;
    this.moving = 0;
    this.score = 0;
  }

  move(): void {
    const newPos = this.y + this.moving;
    if (newPos > 0 && newPos + playerH < fieldH) {
      this.y = newPos;
    }
  }

  reset(): void {
    this.y = fieldH / 2 - playerH / 2;
    this.moving = 0;
  }
}

class Ball {
  x: number;
  y: number;
  r: number;
  moveX: number;
  moveY: number;

  constructor() {
    this.x = fieldW / 2;
    this.y = fieldH / 2 - ballRadius;
    this.r = ballRadius;
    this.moveX = 0;
    this.moveY = 0;
  }

  move(): void {
    this.x += this.moveX;
    this.y += this.moveY;
  }

  reset(): void {
    this.x = fieldW / 2;
    this.y = fieldH / 2 - ballRadius;
    this.moveX = 0;
    this.moveY = 0;
  }
}

const limiter: Rect = {
  x: fieldW / 2 - limiterW / 2,
  y: 0,
  w: limiterW,
  h: fieldH
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

export default defineComponent({
  props: {
    gameStarted: Boolean
  },
  data() {
    return {
      fieldHeight: fieldH,
      fieldWidth: fieldW,
      player1: new Player("Player 1", 10),
      player2: new Player("Player 2", fieldW - 20),
      ball: new Ball(),
      playing: false,
      winner: "",
      socket: io('localhost:3001')
    }
  },
  mounted() {
    canvas = document.getElementById('gameField') as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.draw();

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      switch (e.key) {
        case 'z':
          this.player1.moving = -playerSpeed;
          break;
        case 's':
          this.player1.moving = playerSpeed;
          break;
        case 'ArrowUp':
          this.player2.moving = -playerSpeed;
          break;
        case 'ArrowDown':
          this.player2.moving = playerSpeed;
          break;
      }
    });

    window.addEventListener("keyup", (e: KeyboardEvent) => {
      if (!this.playing) {
        this.start();
      }
      switch (e.key) {
        case 'z':
          this.player1.moving = 0;
          break;
        case 's':
          this.player1.moving = 0;
          break;
        case 'ArrowUp':
          this.player2.moving = 0;
          break;
        case 'ArrowDown':
          this.player2.moving = 0;
          break;
      }
    });
  },
  watch: {
    gameStarted(isStarted, wasStarted) {
      console.log("gameStarted", isStarted, wasStarted);
      if (isStarted && !wasStarted) {
        this.start();
      }
    }
  },
  methods: {
    draw() {
      this.manageMove();
      ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas

      ctx.beginPath();
      ctx.fillStyle = 'white';
      ctx.rect(limiter.x, limiter.y, limiter.w, limiter.h);

      ctx.rect(this.player1.x, this.player1.y, this.player1.w, this.player1.h);

      ctx.rect(this.player2.x, this.player2.y, this.player2.w, this.player2.h);

      ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
      ctx.closePath();

      ctx.fill();

      requestAnimationFrame(this.draw);
    },
    manageMove() {
      //Manage collides with bound limits
      if (this.ball.y <= 0) this.ball.moveY = ballSpeed;
      if (this.ball.y >= fieldH - this.ball.r) this.ball.moveY = -ballSpeed;

      //Manage collides with player1
      if (this.ball.x <= this.player1.x + this.player1.w
          && this.ball.x >= this.player1.x
          && this.ball.y >= this.player1.y
          && this.ball.y <= this.player1.y + this.player1.h) {
        this.ball.moveX = ballSpeed;
      }
      if (this.ball.x <= this.player2.x + this.player2.w
          && this.ball.x >= this.player2.x
          && this.ball.y >= this.player2.y
          && this.ball.y <= this.player2.y + this.player2.h) {
        this.ball.moveX = -ballSpeed;
      }

      //Manage scoring
      if (this.ball.x <= 0) {
        this.score(this.player2);
      }
      if (this.ball.x >= fieldW - this.ball.r) {
        this.score(this.player1);
      }

      this.player1.move();
      this.player2.move();
      this.ball.move();
    },
    score(player: Player) {
      player.score++;
      this.player1.reset();
      this.player2.reset();
      this.ball.reset();
      this.playing = false;
      if (player.score >= maxScore) {
        this.end(player);
      }
    },
    start() {
      this.playing = true;
      if (this.winner.length > 0) {
        this.player1.score = 0;
        this.player2.score = 0;
        this.winner = "";
      }
      let negativeX = 1;
      if (Math.random() > 0.5) {
        negativeX = -1;
      }
      let negativeY = 1;
      if (Math.random() > 0.5) {
        negativeY = -1;
      }
      this.ball.moveX = negativeX * (Math.random() * (ballSpeed - 1) + 1);
      this.ball.moveY = negativeY * (Math.random() * (ballSpeed - 1) + 1);
    },
    end(player: Player) {
      this.winner = player.name;
    }
  }
})


</script>

<style scoped>
#gameField {
  background-color: black;
}
</style>
