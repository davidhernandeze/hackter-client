<script setup>
import { ref, useTemplateRef, onMounted, onUnmounted, computed } from 'vue'
import { Game } from '@/engine/Game'
import { breakpointsTailwind, useBreakpoints, useStorage } from '@vueuse/core'
import Desktop from '@/components/Desktop.vue'
import { useRouter } from 'vue-router'
import Window from '@/components/Window.vue'

const gameUI = useTemplateRef('gameUI')
const mainInput = useTemplateRef('mainInput')
const router = useRouter()

const gameStarted = ref(false)
const gameOver = ref(false)
const command = ref('')
const isConnecting = ref(false)

let game = null
const playerName = useStorage('username', 'anon')

onMounted(async () => {
  game = new Game(gameUI.value)
  mainInput.value.focus()
  await connectToRoom()
})

onUnmounted(() => {
  if (game) {
    game.destroy()
    game = null
  }
})

async function connectToRoom() {
  try {
    await game.connectToServer(import.meta.env.VITE_SERVER_URL, playerName.value)

    game.onStateChange(() => {
      if (game.isPlayerDeleted()) {
        console.log('Player has been deleted from the server.')
        gameOver.value = true
        game.destroy()
        game = null
      }
    })
  } catch (error) {
    console.error('Failed to connect to server:', error)
    isConnecting.value = false
  }
}

const zoomLevels = [4, 5, 6]
let currentZoomIndex = 1

function handleCommand() {
  if (!game) return
  const cmd = command.value.toLowerCase().trim()

  if (cmd === 'zoom in') {
    if (currentZoomIndex < zoomLevels.length - 1) {
      currentZoomIndex++
    }
    game.setCameraZoom(zoomLevels[currentZoomIndex])
    command.value = ''
    return
  } else if (cmd === 'zoom out') {
    if (currentZoomIndex > 0) {
      currentZoomIndex--
    }
    game.setCameraZoom(zoomLevels[currentZoomIndex])
    command.value = ''
    return
  }
  game.sendCommand(command.value)
  command.value = ''
}

function backToLogin() {
  gameOver.value = false
  gameStarted.value = false
  command.value = ''
  router.replace({ name: 'login' })
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const smAndLarger = breakpoints.greaterOrEqual('sm')

const gameUiStyle = computed(() => ({
  width: smAndLarger.value ? '80dvw' : '95dvw',
  height: smAndLarger.value ? '80dvh' : '60dvh',
  top: smAndLarger.value ? '2dvh' : '2dvh',
  right: smAndLarger.value ? '5%' : '2%',
}))

const helpUiStyle = computed(() => ({
  width: smAndLarger.value ? '20dvw' : '55dvw',
  height: smAndLarger.value ? '25dvh' : '18dvh',
  fontSize: smAndLarger.value ? '1rem' : '0.7rem',
  top: '0',
  left: smAndLarger.value ? '2%' : '0',
}))
</script>

<template>
  <main>
    <Desktop v-if="!gameOver">
      <Window title="hackter.exe" :style="gameUiStyle" :body-overflow="'hidden'">
        <div :style="{ height: gameUiStyle.height }" ref="gameUI" />
        <div
          style="
            position: absolute;
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
      </Window>
      <Window title="command_list.exe " :style="helpUiStyle">
        <div style="padding: 0.5rem">
          <ul style="margin: 0; padding-left: 1rem">
            <li>up</li>
            <li>down</li>
            <li>left</li>
            <li>right</li>
            <li>print {text}</li>
            <li>zoom in</li>
            <li>zoom out</li>
          </ul>
        </div>
      </Window>
    </Desktop>
    <Desktop v-show="gameOver">
      <Window title="SYSTEM ALERT" theme="red">
        <div class="terminal-text">
          <p class="blink">CONNECTION TERMINATED</p>
          <p>> User account has been deleted from the system.</p>
          <p>> Access privileges revoked.</p>
          <p>> Session terminated by administrator.</p>
          <button @click="backToLogin" class="terminal-button-connect">
            <span class="button-text">BACK TO LOGIN</span>
            <span class="button-glitch"></span>
          </button>
        </div>
      </Window>
    </Desktop>
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

.terminal-text {
  padding: 1rem;
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
    box-shadow:
      0 0 10px rgba(255, 48, 48, 0.5),
      0 0 20px rgba(0, 0, 0, 0.4);
  }
  50% {
    box-shadow:
      0 0 15px rgba(255, 48, 48, 0.8),
      0 0 30px rgba(0, 0, 0, 0.4);
  }
  100% {
    box-shadow:
      0 0 10px rgba(255, 48, 48, 0.5),
      0 0 20px rgba(0, 0, 0, 0.4);
  }
}

@keyframes loadingDots {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
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
