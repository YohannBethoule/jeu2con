<template>
  <h1 class="text-3xl font-bold underline">Jeu2Con.io</h1>
  <Modale :body="errorMessage" :displayed="errorMessage" title="Connection error!" type="error"></Modale>

  <div class="flex flex-col items-center space-y-5 m-10">
    <span class="flex flex-wrap mt-5 justify-center md:justify-start space-x-5">
      <GameCard image="loremIpsum.png" name="Lorem ipsum" title="Fast typing game"
                @click="newRoom('loremIpsum')"></GameCard>
      <GameCard image="shifumi.PNG" name="Shifumi" title="Pierre, feuille, ciseaux"
                @click="newRoom('shifumi')"></GameCard>
      <GameCard image="pong-icon.jpg" name="Pong" title="Le tout premier jeu vidéo" @click="newRoom('pong')"></GameCard>
    </span>
  </div>

  <h2 class="text-xl font-bold">Des jeux à jouer à 2 cons</h2>
  <!--    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-32" @click="newRoom">Create room</button>-->
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import Modale from '../Modale.vue'
import GameCard from "../GameCard.vue";

export default defineComponent({
  name: 'Home',
  components: {
    GameCard,
    Modale
  },
  props: {
    error: String
  },
  data() {
    return {
      errorMessage: this.error,
      roomName: undefined,
      gameType: ''
    }
  },
  methods: {
    newRoom(gameType: string) {
      this.gameType = gameType;
      this.$socket.client.emit('newRoom')
    },
    goToRoom(roomName: string) {
      this.$router.push({
        name: "Game",
        params: {room: roomName, gameType: this.gameType}
      });
    }
  },
  sockets: {
    connect_error(err) {
      console.log("connection error", err)
    },
    newRoom(roomName) {
      console.log('newRoom ', roomName);
      this.roomName = roomName;
      this.goToRoom(roomName);
    },
    joinRoom(roomName) {
      console.log('joinRoom name ', roomName);
      this.$router.push({name: 'Game', params: {room: roomName}})
    }
  }
});
</script>

<style scoped>

</style>
