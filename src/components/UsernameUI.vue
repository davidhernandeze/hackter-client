<script setup>
import { onMounted, ref, useTemplateRef } from 'vue'

const props = defineProps({
  isConnecting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['connect'])

const playerName = defineModel('playerName')
const typingEffect = ref(false)
const playerNameInput = useTemplateRef('playerNameInput')

onMounted(() => {
  playerNameInput.value.focus()
})

// Simulate terminal typing effect
function startTypingEffect() {
  typingEffect.value = true
  setTimeout(() => {
    typingEffect.value = false
  }, 1500)
}

function connectToRoom() {
  if (props.isConnecting) return
  if (playerName.value.trim() === '') return
  emit('connect')
}
</script>

<template>
  <div class="login-container">
    <div class="terminal-window">
      <div class="terminal-header">
        <div class="terminal-title">HACKTER TERMINAL v1.0</div>
        <div class="terminal-buttons">
          <span class="terminal-button"></span>
          <span class="terminal-button"></span>
          <span class="terminal-button"></span>
        </div>
      </div>
      <div class="terminal-body">
        <div class="terminal-text">
          <div class="ascii-art">
            <pre>
 _    _          _____ _  _______ ______ _____
| |  | |   /\   / ____| |/ /_   _|  ____|  __ \
| |__| |  /  \ | |    | ' /  | | | |__  | |__) |
|  __  | / /\ \| |    |  &lt;   | | |  __| |  _  /
| |  | |/ ____ \ |____| . \  | | | |____| | \ \
|_|  |_/_/    \_\_____|_|\_\ |_| |______|_|  \_\
            </pre>
          </div>
          <p class="blink">SYSTEM INITIALIZED</p>
          <p>> Establishing secure connection...</p>
          <p>> Connection established.</p>
          <p>> Enter your hacker alias to continue:</p>
          <div class="input-line">
            <span class="prompt">$</span>
            <input
              ref="playerNameInput"
              v-model="playerName"
              class="terminal-input"
              @focus="startTypingEffect"
              @keyup.enter="!props.isConnecting && connectToRoom()"
              :class="{ typing: typingEffect }"
            />
          </div>
          <div class="connection-status" v-if="$slots.status">
            <slot name="status"></slot>
          </div>
          <button
            @click="connectToRoom"
            class="terminal-button-connect"
            :disabled="props.isConnecting"
            :class="{ connecting: props.isConnecting }"
          >
            <span class="button-text">{{ props.isConnecting ? 'CONNECTING...' : 'CONNECT' }}</span>
            <span class="button-glitch"></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #0a0a1a;
  background-image:
    radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.05) 0%, transparent 80%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 100%);
  font-family: 'Courier New', monospace;
}

.terminal-window {
  width: 80%;
  max-width: 800px;
  background-color: #0c0c14;
  border-radius: 8px;
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.2),
    0 0 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border: 1px solid #30cfd0;
  animation: borderPulse 4s infinite;
}

.terminal-header {
  background-color: #1a1a2e;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #30cfd0;
}

.terminal-title {
  color: #30cfd0;
  font-weight: bold;
  letter-spacing: 1px;
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
  padding: 20px;
  color: #00ff9c;
  background-color: rgba(10, 10, 26, 0.95);
  height: 500px;
  overflow-y: auto;
}

.terminal-text {
  line-height: 1.6;
}

.terminal-text p {
  margin: 8px 0;
}

.ascii-art {
  color: #30cfd0;
  font-size: 0.7em;
  margin-bottom: 20px;
  text-align: center;
}

.ascii-art pre {
  margin: 0;
  white-space: pre;
  font-family: 'Courier New', monospace;
}

.blink {
  animation: blink 1s infinite;
  color: #ff5f56;
}

.input-line {
  display: flex;
  align-items: center;
  margin: 15px 0;
}

.prompt {
  color: #30cfd0;
  margin-right: 10px;
  font-weight: bold;
}

.terminal-input {
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #30cfd0;
  color: #00ff9c;
  font-family: 'Courier New', monospace;
  font-size: 1em;
  padding: 5px;
  width: 80%;
  outline: none;
  caret-color: #00ff9c;
}

.terminal-input::placeholder {
  color: rgba(0, 255, 156, 0.5);
}

.terminal-input:focus {
  border-bottom: 1px solid #00ff9c;
  box-shadow: 0 1px 0 0 rgba(0, 255, 156, 0.5);
}

.typing {
  animation: typing 1.5s steps(30, end);
}

.terminal-button-connect {
  background-color: #1a1a2e;
  color: #30cfd0;
  border: 1px solid #30cfd0;
  padding: 10px 20px;
  font-family: 'Courier New', monospace;
  font-size: 1em;
  margin-top: 20px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: block;
}

.terminal-button-connect:hover {
  background-color: rgba(48, 207, 208, 0.1);
  box-shadow: 0 0 10px rgba(48, 207, 208, 0.5);
}

.terminal-button-connect:active {
  transform: scale(0.98);
}

.button-text {
  position: relative;
  z-index: 1;
}

.button-glitch {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 0;
}

.terminal-button-connect:hover .button-glitch::before {
  content: '';
  position: absolute;
  top: 0;
  left: -10px;
  width: 10px;
  height: 100%;
  background-color: rgba(48, 207, 208, 0.5);
  filter: blur(3px);
  animation: glitch 1s infinite;
}

.terminal-button-connect:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.terminal-button-connect.connecting {
  background-color: rgba(48, 207, 208, 0.1);
  animation: pulse 1.5s infinite;
}

.connection-status {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid rgba(48, 207, 208, 0.3);
  background-color: rgba(10, 10, 26, 0.8);
  border-radius: 4px;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 5px rgba(48, 207, 208, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(48, 207, 208, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(48, 207, 208, 0.5);
  }
}

@keyframes borderPulse {
  0% {
    box-shadow:
      0 0 10px rgba(48, 207, 208, 0.5),
      0 0 20px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      0 0 15px rgba(48, 207, 208, 0.8),
      0 0 30px rgba(0, 0, 0, 0.4);
  }
  100% {
    box-shadow:
      0 0 10px rgba(48, 207, 208, 0.5),
      0 0 20px rgba(0, 0, 0, 0.4);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes typing {
  from {
    width: 0;
  }
  to {
    width: 80%;
  }
}

@keyframes glitch {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(100%);
  }
  50% {
    transform: translateX(200%);
  }
  75% {
    transform: translateX(300%);
  }
  100% {
    transform: translateX(400%);
  }
}
</style>
