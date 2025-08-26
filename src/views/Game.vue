<script setup>
import Colyseus from 'colyseus.js'
import { Application, Container, Graphics, Text } from 'pixi.js'
import { onMounted, ref, useTemplateRef, onUnmounted } from 'vue'

const gameUI = useTemplateRef('gameUI')
const mainInput = useTemplateRef('mainInput')

const gameStarted = ref(false)
const playerName = ref('anon')
const command = ref('')
const playerContainers = new Map()
const playerTargetPositions = new Map()
const app = new Application()
let room
let animationFrameId

onMounted(async () => {
  await createGameUI()
  startAnimationLoop()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

function lerp(start, end, t) {
  return start + (end - start) * t
}

function startAnimationLoop() {
  const updateFrame = () => {
    for (const [id, container] of playerContainers) {
      if (playerTargetPositions.has(id)) {
        const target = playerTargetPositions.get(id)
        container.x = lerp(container.x, target.x, 0.1)
        container.y = lerp(container.y, target.y, 0.1)
      }
    }

    animationFrameId = requestAnimationFrame(updateFrame)
  }

  animationFrameId = requestAnimationFrame(updateFrame)
}

async function connectToRoom() {
  mainInput.value.focus()
  const client = new Colyseus.Client('ws://localhost:2567')
  room = await client.joinOrCreate('arena', {
    name: playerName.value,
    color: Math.floor(Math.random() * 0xffffff),
  })

  console.log('joined successfully', room)
  gameStarted.value = true

  room.onStateChange((state) => {
    renderPlayers(state.players)
  })
}

async function createGameUI() {
  await app.init({ background: '#1b2e49', resizeTo: window })
  gameUI.value.appendChild(app.canvas)
}

function renderPlayers(players) {
  // Remove players that no longer exist
  for (const [id, container] of playerContainers) {
    if (!players.has(id)) {
      app.stage.removeChild(container)
      playerContainers.delete(id)
      playerTargetPositions.delete(id)
    }
  }

  for (const [id, player] of players) {
    if (!playerContainers.has(id)) {
      // Create new player container for first appearance
      const playerContainer = new Container()
      // Set initial position directly (no interpolation needed for first appearance)
      playerContainer.x = player.x
      playerContainer.y = player.y

      const circle = new Graphics()
      circle.circle(0, 0, 20)
      circle.fill(player.color)
      playerContainer.addChild(circle)

      const text = new Text({
        text: player.name,
        style: {
          fontFamily: 'Arial',
          fontSize: 14,
          fill: 0xffffff,
        },
      })
      text.x = -(playerContainer.width / 2) + 5
      text.y = -playerContainer.height
      playerContainer.addChild(text)

      const message = new Text({
        text: '',
        style: {
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 0x34ffff,
          wordWrap: true,
        },
      })
      message.x = playerContainer.width - 10
      message.y = -5
      playerContainer.addChild(message)

      app.stage.addChild(playerContainer)

      playerContainers.set(id, playerContainer)
      // Initialize target position to match current position
      playerTargetPositions.set(id, { x: player.x, y: player.y })
    } else {
      // For existing players, update the target position instead of directly setting position
      // The animation loop will handle the smooth transition
      playerTargetPositions.set(id, { x: player.x, y: player.y })
    }

    const playerContainer = playerContainers.get(id)
    // Update message text directly (no need for smooth transition)
    playerContainer.children[2].text = player.message ?? ''
  }
}

function handleCommand() {
  room.send('command', command.value)
  command.value = ''
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
