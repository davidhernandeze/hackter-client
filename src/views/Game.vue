<script setup>
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { Game } from '@/engine/Game'
import UsernameUI from '@/components/UsernameUI.vue'

const gameUI = useTemplateRef('gameUI')
const mainInput = useTemplateRef('mainInput')

const gameStarted = ref(false)
const gameOver = ref(false)
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

        // Set up state change handler to check for player deletion
        game.onStateChange(() => {
          if (game.isPlayerDeleted()) {
            gameOver.value = true
          }
        })

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

function backToLogin() {
  // Reset game state
  if (game) {
    game.destroy()
    game = new Game(gameUI.value)
  }

  // Reset UI state
  gameOver.value = false
  gameStarted.value = false
  command.value = ''
}
</script>

<template>
  <main>
    <div v-show="gameStarted && !gameOver">
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

    <!-- Game Over Screen -->
    <div v-show="gameOver" class="game-over-container">
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="terminal-title">SYSTEM ALERT</div>
          <div class="terminal-buttons">
            <span class="terminal-button"></span>
            <span class="terminal-button"></span>
            <span class="terminal-button"></span>
          </div>
        </div>
        <div class="terminal-body">
          <div class="terminal-text">
            <p class="blink">CONNECTION TERMINATED</p>
            <p>> User account has been deleted from the system.</p>
            <p>> Access privileges revoked.</p>
            <p>> Session terminated by administrator.</p>
            <button
              @click="backToLogin"
              class="terminal-button-connect"
            >
              <span class="button-text">BACK TO LOGIN</span>
              <span class="button-glitch"></span>
            </button>
          </div>
        </div>
      </div>
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

/* Game Over Screen Styles */
.game-over-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: #0a0a1a;
  background-image:
    radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.1) 0%, transparent 80%),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.2) 100%);
  font-family: 'Courier New', monospace;
}

.terminal-window {
  width: 80%;
  max-width: 800px;
  background-color: #0c0c14;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.2), 0 0 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  border: 1px solid #ff3030;
  animation: borderPulse 4s infinite;
}

.terminal-header {
  background-color: #1a1a2e;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ff3030;
}

.terminal-title {
  color: #ff3030;
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
  color: #ff9c9c;
  background-color: rgba(10, 10, 26, 0.95);
  height: 300px;
  overflow-y: auto;
}

.terminal-text {
  line-height: 1.6;
}

.terminal-text p {
  margin: 8px 0;
}

.blink {
  animation: blink 1s infinite;
  color: #ff5f56;
}

.terminal-button-connect {
  background-color: #1a1a2e;
  color: #ff3030;
  border: 1px solid #ff3030;
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
  background-color: rgba(255, 48, 48, 0.1);
  box-shadow: 0 0 10px rgba(255, 48, 48, 0.5);
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
  background-color: rgba(255, 48, 48, 0.5);
  filter: blur(3px);
  animation: glitch 1s infinite;
}

@keyframes borderPulse {
  0% {
    box-shadow: 0 0 10px rgba(255, 48, 48, 0.5), 0 0 20px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 15px rgba(255, 48, 48, 0.8), 0 0 30px rgba(0, 0, 0, 0.4);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 48, 48, 0.5), 0 0 20px rgba(0, 0, 0, 0.4);
  }
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

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes glitch {
  0% { transform: translateX(0); }
  25% { transform: translateX(100%); }
  50% { transform: translateX(200%); }
  75% { transform: translateX(300%); }
  100% { transform: translateX(400%); }
}
</style>
