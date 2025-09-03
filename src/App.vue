<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
  <span style="position: fixed; bottom: 1rem; right: 1rem; color: #3a3a3a">0.5</span>
</template>

<style>
body, html {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #1f2937 transparent;
}

/* Chrome, Edge, and Safari */
*::-webkit-scrollbar {
  width: 5px;
}

*::-webkit-scrollbar-track {
  background: #2c394a;
  border-radius: 5px;
}

*::-webkit-scrollbar-thumb {
  background-color: #1f2937;
}
</style>
