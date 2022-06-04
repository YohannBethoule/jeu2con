<template>
  <div class="flex flex-col justify-center">
    <div class="flex divide-x ">
      <div class="flex flex-col justify-center p-10 w-96">
        <p id="playerText" v-html="playerText"></p>
        <h2 class="mt-10 mb-2 text-2xl ">Type words here : </h2>
        <input ref="playerInput"
               v-model="typedText" :disabled="!this.gameStarting && !this.playing"
               class="mx-auto bg-gray-200 appearance-none border-2 border-gray-200 rounded w-40 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-blue-700"
               type="text" @keyup.space="inputKeyup"/>
      </div>
      <div class="flex flex-col p-10 w-96">
        <p id="enemyText" v-html="enemyText"></p>
      </div>
    </div>
  </div>


</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  props: {
    gameStarted: Boolean,
    gameStarting: Boolean,
    gameEnd: Function
  },
  data() {
    return {
      playing: false,
      winner: "",
      enemyText: "",
      playerText: "",
      typedText: "",
      currentWord: 0,
      gameLength: 0
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
      this.$socket.client.emit('getLoremIpsum');
      this.playing = true;
      const playerInput = this.$refs.playerInput as HTMLInputElement;
      playerInput.focus();
    },
    end() {
      this.playing = false;
      this.$emit('gameEnd', this.winner + ' in ' + this.gameLength + ' seconds');
    },
    parseLoremIpsum(loremIpsum: { words: { word: string, isCorrect: number }[], currentWord: number }): string {
      let parsedWords = [] as string[];
      loremIpsum.words.forEach((word, index) => {
        let text = '';
        if (word.isCorrect === 1) {
          text += '<span class="is-correct">';
        } else if (word.isCorrect === -1) {
          text += '<span class="is-incorrect">';
        }
        if (index === loremIpsum.currentWord) {
          text += '<u>';
        }
        text += word.word;
        if (word.isCorrect !== 0) {
          text += '</span>';
        }
        if (index === loremIpsum.currentWord) {
          text += '</u>';
        }
        parsedWords.push(text);
      });
      return parsedWords.join(' ');
    },
    inputKeyup() {
      if (!this.playing) return; // ignore keyup events when not playing
      this.$socket.client.emit('checkInput', this.currentWord, this.typedText)
    }
  },
  sockets: {
    playerLoremIpsum(data) {
      this.typedText = "";
      this.playerText = this.parseLoremIpsum(data);
      this.currentWord = data.currentWord;
    },
    enemyLoremIpsum(data) {
      this.enemyText = this.parseLoremIpsum(data);
    },
    playerWin() {
      this.winner = "You win!";
      this.end();
    },
    enemyWin() {
      this.winner = "You lose!";
      this.end();
    },
    gameLength(data) {
      this.gameLength = data;
    }
  }
})


</script>

<style scoped>
:deep(.is-correct) {
  color: green;
}

:deep(.is-incorrect) {
  color: red;
}
</style>
