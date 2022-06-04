<template>
  <div class="flex flex-col justify-center">
    <h1 class="text-3xl mb-5">{{ winnerText }}</h1>
    <div class="flex divide-x ">
      <div :class="{ 'winner' : result === -1, 'loser' : result ===  1 }"
           class="flex flex-col items-center p-10 w-96 space-y-5">
        <ShifumiButton :class="{ 'bg-blue-200 is-active' : currentChoice==='rock' }" icon="hand-back-fist" name="rock"
                       @click="choose('rock')"/>
        <ShifumiButton :class="{ 'bg-blue-200 is-active': currentChoice==='paper' }" icon="hand" name="paper"
                       @click="choose('paper')"/>
        <ShifumiButton :class="{ 'bg-blue-200 is-active': currentChoice==='scissors' }" icon="hand-scissors"
                       name="scissors" @click="choose('scissors')"/>
      </div>
      <div :class="{ 'winner' : result === 1, 'loser' : result ===  -1 }"
           class="flex flex-col  items-center p-10 w-96 space-y-5">
        <ShifumiButton :class="{ 'bg-blue-200 is-active' : enemyChoice==='rock' }" icon="hand-back-fist" name="rock"/>
        <ShifumiButton :class="{ 'bg-blue-200 is-active' : enemyChoice==='paper' }" icon="hand" name="paper"/>
        <ShifumiButton :class="{ 'bg-blue-200 is-active' : enemyChoice==='scissors' }" icon="hand-scissors"
                       name="scissors"/>
      </div>
    </div>
  </div>


</template>

<script lang="ts">
import {defineComponent} from "vue";
import ShifumiButton from "./ShifumiButton.vue";

export default defineComponent({
  components: {ShifumiButton},
  props: {
    gameStarted: Boolean,
    gameStarting: Boolean,
    gameEnd: Function
  },
  data() {
    return {
      playing: false,
      winnerText: "",
      currentChoice: "",
      enemyChoice: "",
      result: undefined
    }
  },
  watch: {
    gameStarted(isStarted, wasStarted) {
      if (isStarted && !wasStarted) {
        this.start();
      }
    }
  },
  methods: {
    start() {
      this.playing = true;
      this.currentChoice = "";
      this.enemyChoice = "";
      this.winnerText = "";
      this.result = undefined;
    },
    end() {
      this.playing = false;
    },
    choose(choice: string) {
      this.currentChoice = choice;
      this.$socket.client.emit('playerChoice', choice);
    },
  },
  sockets: {
    result(data) {
      console.log("result", data)
      this.winnerText = data.winnerText;
      this.result = data.result;
      this.currentChoice = data.choice;
      this.enemyChoice = data.enemyChoice;
      setTimeout(this.start, 3000)
    }
  }
})


</script>

<style scoped>
.winner button.is-active {
  color: forestgreen;
}

.loser button.is-active {
  color: red;
}
</style>
