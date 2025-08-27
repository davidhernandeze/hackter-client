<script setup>
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { Game } from '@/engine/Game'
import UsernameUI from '@/components/UsernameUI.vue'

const gameUI = useTemplateRef('gameUI')
const mainInput = useTemplateRef('mainInput')

const gameStarted = ref(false)
const command = ref('')
const connectionStatus = ref('')
const isConnecting = ref(false)

// Game instance
let game = null

onMounted(() => {
  // Initialize game when component is mounted
  if (gameUI.value) {
    game = new Game(gameUI.value)
  }
})

onUnmounted(() => {
  // Clean up game resources when component is unmounted
  if (game) {
    game.destroy()
    game = null
  }
})

async function connectToRoom(playerName) {
  if (!game || isConnecting.value) return

  try {
    isConnecting.value = true

    // Update connection status messages with delays for dramatic effect
    connectionStatus.value = 'Initializing secure connection...'

    setTimeout(() => {
      connectionStatus.value = 'Authenticating user credentials...'
    }, 800)

    setTimeout(() => {
      connectionStatus.value = 'Establishing encrypted channel...'
    }, 1600)

    setTimeout(() => {
      connectionStatus.value = 'Bypassing security protocols...'
    }, 2400)

    // Connect to the game server after a delay for visual effect
    setTimeout(async () => {
      try {
        connectionStatus.value = 'Connection established. Entering system...'
        await game.connectToServer('ws://localhost:2567', playerName)

        setTimeout(() => {
          gameStarted.value = true
          mainInput.value.focus()
          isConnecting.value = false
          connectionStatus.value = ''
        }, 1000)
      } catch (error) {
        console.error('Failed to connect to server:', error)
        connectionStatus.value = 'Connection failed. Security breach detected.'
        isConnecting.value = false
      }
    }, 10)
  } catch (error) {
    console.error('Failed to connect to server:', error)
    connectionStatus.value = 'Connection failed. Security breach detected.'
    isConnecting.value = false
  }
}

function handleCommand() {
  if (game) {
    // Send command to the server
    game.sendCommand(command.value)
    command.value = ''
  }
}
</script>

<template>
  <main>
    <div v-show="gameStarted">
      <div ref="gameUI" />
      <div
        style="
          position: fixed;
          margin: auto;
          bottom: 20px;
          display: flex;
          width: 100%;
          justify-content: center;
          align-items: center;
        "
      >
        <input
          v-model="command"
          ref="mainInput"
          type="text"
          style="
            width: 80%;
            background-color: #1f1f3e;
            padding: 0.5rem;
            color: white;
            border: none;
            font-size: 2rem;
            border-radius: 1rem;
          "
          @keyup.enter="handleCommand"
        />
      </div>
      <div style="position: fixed; top: 0; right: 0; background-color: #1f1f3e; padding: 0.8rem; color: white">
        <h4>Available commands:</h4>
        <ul>
          <li>up</li>
          <li>down</li>
          <li>left</li>
          <li>right</li>
          <li>print {text}</li>
        </ul>
      </div>
    </div>
    <div v-show="!gameStarted">
      <UsernameUI
        :isConnecting="isConnecting"
        @connect="connectToRoom"
      >
        <template #status>
          <p class="status-message">{{ connectionStatus }}</p>
          <div class="loading-indicator">
            <span></span><span></span><span></span>
          </div>
        </template>
      </UsernameUI>
    </div>
  </main>
</template>

<style scoped>
/* Styles for the loading indicator in the status slot */
.status-message {
  color: #00ff9c;
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 5px;
}

.loading-indicator span {
  width: 8px;
  height: 8px;
  background-color: #30cfd0;
  border-radius: 50%;
  display: inline-block;
  animation: loadingDots 1.4s infinite ease-in-out both;
}

.loading-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
