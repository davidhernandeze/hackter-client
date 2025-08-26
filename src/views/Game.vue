<script setup>
import { ref, useTemplateRef, onMounted, onUnmounted } from 'vue'
import { Game } from '@/engine/Game'

const gameUI = useTemplateRef('gameUI')
const mainInput = useTemplateRef('mainInput')

const gameStarted = ref(false)
const playerName = ref('anon')
const command = ref('')

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

async function connectToRoom() {
  if (!game) return

  try {
    // Connect to the game server
    await game.connectToServer('ws://localhost:2567', playerName.value)

    // Focus the input field
    mainInput.value.focus()

    // Update UI state
    gameStarted.value = true
  } catch (error) {
    console.error('Failed to connect to server:', error)
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
      <h1>Game</h1>
      <p>Game page content goes here.</p>
      <input v-model="playerName" placeholder="Enter your name" />
      <button @click="connectToRoom">connect to room</button>
    </div>
  </main>
</template>
