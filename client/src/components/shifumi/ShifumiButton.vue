<template>
  <button :title="name" class="w-20 h-20 border-black border-2 text-4xl hover:bg-blue-100">
    <fa-icon :icon="['fas', icon]"></fa-icon>
  </button>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "ShifumiButton",
  props: {
    name: String,
    icon: String
  },
})
</script>

<style scoped>

</style>
