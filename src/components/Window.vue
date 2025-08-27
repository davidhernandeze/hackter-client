<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: String,
  theme: {
    type: String,
    default: 'blue'
  },
})

const themeColor = ref(props.theme === 'red' ? '#ff3030' : '#30cfd0')
const themeGlowColor = ref(
  props.theme === 'red' ? 'rgba(255, 48, 48, 0.2)' : 'rgba(0, 255, 255, 0.2)',
)
</script>

<template>
  <div class="terminal-window" :class="{ 'theme-red': theme === 'red' }">
    <div class="terminal-header">
      <div class="terminal-title">{{ title }}</div>
      <div class="terminal-buttons">
        <span class="terminal-button"></span>
        <span class="terminal-button"></span>
        <span class="terminal-button"></span>
      </div>
    </div>
    <div class="terminal-body">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>

.terminal-window {
  position: absolute;
  top: v-bind(top);
  width: 80%;
  max-width: 1000px;
  background-color: #0c0c14;
  border-radius: 8px;
  box-shadow: 0 0 20px v-bind(themeGlowColor),
  0 0 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border: 1px solid v-bind(themeColor);
  animation: borderPulse 4s infinite;
}

.terminal-window.theme-red {
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.2),
  0 0 30px rgba(0, 0, 0, 0.4);
  border: 1px solid #ff3030;
}

.terminal-header {
  background-color: #1a1a2e;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid v-bind(themeColor);
}

.terminal-window.theme-red .terminal-header {
  border-bottom: 1px solid #ff3030;
}

.terminal-title {
  color: v-bind(themeColor);
  font-weight: bold;
  letter-spacing: 1px;
}

.terminal-window.theme-red .terminal-title {
  color: #ff3030;
}

.terminal-buttons {
  display: flex;
  gap: 8px;
}

.terminal-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #444;
  display: inline-block;
}

.terminal-button:nth-child(1) {
  background-color: #ff5f56;
}

.terminal-button:nth-child(2) {
  background-color: #ffbd2e;
}

.terminal-button:nth-child(3) {
  background-color: #27c93f;
}

.terminal-body {
  color: #00ff9c;
  background-color: rgba(10, 10, 26, 0.95);
  overflow: hidden;
}

@keyframes borderPulse {
  0% {
    box-shadow: 0 0 10px v-bind(themeGlowColor),
    0 0 20px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 15px v-bind(themeGlowColor),
    0 0 30px rgba(0, 0, 0, 0.4);
  }
  100% {
    box-shadow: 0 0 10px v-bind(themeGlowColor),
    0 0 20px rgba(0, 0, 0, 0.4);
  }
}
</style>
