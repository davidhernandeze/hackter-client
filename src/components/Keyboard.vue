<script setup>
import Keyboard from 'simple-keyboard'
import 'simple-keyboard/build/css/index.css'
import { onMounted } from 'vue'

const inputValue = defineModel()
const emit = defineEmits(['enter'])

let keyboard = null
onMounted(() => {
  keyboard = new Keyboard({
    onChange: (input) => onChange(input),
    onKeyPress: (button) => onKeyPress(button),
    layout: {
      default: [
        '1 2 3 4 5 6 7 8 9 0 {bksp}',
        'q w e r t y u i o p',
        'a s d f g h j k l {enter}',
        'z x c v b n m',
        '{space}',
      ],
    },
  })
})

function onChange(input) {
  console.log('Input changed', input)
}

function onKeyPress(button) {
  console.log('Button pressed', button)
  if (button === '{bksp}') {
    inputValue.value = inputValue.value.slice(0, -1)
    return
  }
  if (button === '{enter}') {
    emit('enter')
    return
  }
  inputValue.value += button
}
</script>
<template>
  <div class="simple-keyboard" />
</template>
