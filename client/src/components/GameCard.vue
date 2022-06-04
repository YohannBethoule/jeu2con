<template>
  <button :title="title" class="relative group mb-5 w-2/5 h-22 md:w-48 md:h-32">
    <div class="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600
          blur opacity-10 group-hover:opacity-100 transition duration-300 group-hover:duration-300"></div>
    <div
        class="relative h-full  text-center flex flex-col justify-center bg-white ring-1 ring-gray-900/5 leading-none py-2">
      <img v-if="image" :alt="name" :src="'/games/' + image" class="h-6 md:h-10 mx-auto mt-3 md:mt-5">
      <div class=" my-auto font-bold  md:text-xl">
        {{ name }}
      </div>
    </div>
  </button>
</template>

<script>
import {defineComponent} from "vue";

export default defineComponent({
  name: "GameCard",
  props: {
    name: String,
    image: String,
    title: String
  }
});
</script>

<style scoped>

</style>
