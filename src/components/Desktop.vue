<script setup>
defineProps({
  title: {
    type: String,
    default: 'TERMINAL',
  },
  theme: {
    type: String,
    default: 'blue', // 'blue' or 'red'
  },
})
</script>

<template>
  <div class="desktop-window-container">
    <slot />
  </div>
</template>

<style scoped>
.desktop-window-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100dvh;
  width: 100dvw;
  background-color: #0a0a1a;
  background-image:
    radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.05) 0%, transparent 80%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 100%);
  font-family: 'Courier New', monospace;
}
</style>
