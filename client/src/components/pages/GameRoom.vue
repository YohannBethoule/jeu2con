<template>
  <main class="flex place-content-center w-full h-full">
    <button class="absolute top-10 left-10 text-5xl text-blue-500 hover:text-blue-700" @click="goToHome">
      <fa-icon :icon="['fas', 'home']"></fa-icon>
    </button>
    <div class="flex flex-col justify-center">
      <h1 class="self-center w-80 mx-20 text-center text-3xl">{{ playerName }}</h1>
      <button v-if="enemyName && !gameStarted && !gameStarting && this.needReadyState"
              :class="{'opacity-50': playerReady}"
              class="mt-5 self-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit"
              @click="ready">Ready
      </button>
      <h2 v-if="enemyName" class="text-xl mt-3">{{ playerWinCount }}</h2>
    </div>

    <div class="flex flex-col justify-center w-200">
      <h1 v-if="winnerText" class="text-3xl font-bold mb-10">
        {{ winnerText }}
      </h1>
      <h1 v-if="gameCountdown>0 && !gameStarted" class="self-center w-80 mx-20 text-center text-5xl font-bold">
        {{ gameCountdown }}...</h1>
      <FastTyperGameField v-if="gameName==='loremIpsum'" :gameStarted="gameStarted" :gameStarting="gameStarting"
                          @gameEnd="gameEnd"></FastTyperGameField>
      <ShifumiGameField v-if="gameName==='shifumi'" :gameStarted="gameStarted" :gameStarting="gameStarting"
                        @gameEnd="gameEnd"></ShifumiGameField>
      <GameField v-if="gameName==='pong'" :gameStarted="gameStarted" :gameStarting="gameStarting"
                 @gameEnd="gameEnd"></GameField>
    </div>


    <div class="flex flex-col justify-center align-center">
      <h1 v-if="enemyName" class="self-center w-80 mx-20 text-center text-3xl">{{ enemyName }}</h1>
      <div v-if="!enemyName" class="flex flex-col justify-center align-center">
        <h1 class="self-center w-80 mx-20 text-center text-3xl text-gray-500">Waiting for opponent ...</h1>
        <button class="mt-5 self-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit"
                @click="copyLink">
          <fa-icon :icon="['fas', 'link']"></fa-icon>
          Copy invitation link
        </button>
      </div>
      <button v-if="enemyName && !gameStarted && !gameStarting && this.needReadyState"
              :class="{'opacity-50': enemyReady}"
              class="mt-5 self-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-fit">Ready
      </button>
      <h2 v-if="enemyName" class="text-xl mt-3">{{ enemyWinCount }}</h2>
    </div>

  </main>

</template>

<script lang="ts">
import GameField from "../pong/GameField.vue";
import {defineComponent} from "vue";
import FastTyperGameField from "../loremIpsum/FastTyperGameField.vue";
import ShifumiGameField from "../shifumi/ShifumiGameField.vue";

export default defineComponent({
  name: "GameRoom",
  components: {
    ShifumiGameField,
    FastTyperGameField,
    GameField
  },
  props: {
    room: String,
    gameType: String
  },
  data() {
    return {
      enemyName: '',
      playerName: '',
      enemyReady: false,
      playerReady: false,
      playerWinCount: 0,
      enemyWinCount: 0,
      gameStarting: false,
      gameStarted: false,
      gameCountdown: '',
      winnerText: '',
      gameName: ''
    }
  },
  computed: {
    needReadyState() {
      return this.gameName !== 'shifumi';
    }
  },
  methods: {
    connect() {
      this.$socket.client.emit('joinRoom', this.room, this.gameType);
    },
    copyLink() {
      navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
          /* On peut alors écrire dans le presse-papier */
          navigator.clipboard.writeText(window.location.href)
        }
      });
    },
    ready() {
      this.playerReady = !this.playerReady;
      this.winnerText = '';
      this.$socket.client.emit('playerReadyState', this.room, this.playerReady);
    },
    startGame() {
      this.gameStarted = true;
      this.gameStarting = false;
    },
    gameEnd(winnerText: string) {
      this.gameStarted = false;
      this.gameStarting = false;
      this.playerReady = false;
      this.winnerText = winnerText;
      this.$socket.client.emit('playerReadyState', this.room, this.playerReady);
    },
    goToHome() {
      this.$router.push('/');
    }
  },
  sockets: {
    roomIsAlreadyFull(res) {
      this.$router.push({
        name: "Home",
        params: {error: res.errors[0].message}
      })
    },
    enemyReadyState(enemyReadyState) {
      this.enemyReady = enemyReadyState;
    },
    enemyName(enemyName) {
      this.enemyName = enemyName;
    },
    ownName(ownName) {
      this.playerName = ownName;
    },
    gameStarting(countdown) {
      if (this.gameStarted) return;
      this.gameStarting = true;
      this.gameCountdown = countdown;
    },
    enemyLeft() {
      this.enemyName = '';
      this.playerReady = false;
      this.enemyReady = false;
      this.gameStarting = false;
      this.gameStarted = false;
    },
    gameStart() {
      this.gameStarted = true;
      this.gameCountdown = '';
    },
    roomJoined(roomName, gameType) {
      this.gameName = gameType;
    },
    playerWin() {
      this.playerWinCount++;
    },
    enemyWin() {
      this.enemyWinCount++;
    },
  },
  mounted() {
    this.gameName = this.gameType as string;
    this.connect();
  },
  unmounted() {
    this.$socket.client.emit('leaveRoom', this.room);
  }
})
</script>

<style scoped>

</style>
