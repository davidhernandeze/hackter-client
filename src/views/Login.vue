<script setup>
import { computed, ref } from 'vue'
import UsernameUI from '@/components/UsernameUI.vue'
import { breakpointsTailwind, promiseTimeout, useBreakpoints, useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'
import Desktop from '@/components/Desktop.vue'
import Window from '@/components/Window.vue'

const connectionStatus = ref('')
const isConnecting = ref(false)
const playerName = useStorage('username', 'anon')
const router = useRouter()

async function connectToRoom() {
  if (isConnecting.value) return

  isConnecting.value = true

  const messageDuration = import.meta.env.VITE_ENVIRONMENT === 'development' ? 2 : 1000
  connectionStatus.value = 'Initializing secure connection...'
  await promiseTimeout(messageDuration)
  connectionStatus.value = 'Authenticating user credentials...'
  await promiseTimeout(messageDuration)
  connectionStatus.value = 'Bypassing security protocols...'
  await promiseTimeout(messageDuration)
  connectionStatus.value = 'Establishing encrypted channel...'
  await promiseTimeout(messageDuration)
  connectionStatus.value = 'Connection established. Entering system...'
  await promiseTimeout(messageDuration)

  isConnecting.value = false
  connectionStatus.value = ''

  await router.push({ name: 'play' })
}

const breakpoints = useBreakpoints(breakpointsTailwind)
const smAndLarger = breakpoints.greaterOrEqual('sm')
const loginUiStyle = computed(() => ({
  width: smAndLarger.value ? '80dvw' : '90dvw',
  height: smAndLarger.value ? '80dvh' : '90dvh',
  top: smAndLarger.value ? '5%' : '5%',
  right: smAndLarger.value ? '5%' : '2%',
}))

</script>

<template>
  <Desktop>
    <Window :style="loginUiStyle">
      <UsernameUI
        v-model:playerName="playerName"
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
    </Window>
  </Desktop>
</template>

<style scoped>
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

.terminal-text p {
  margin: 8px 0;
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
