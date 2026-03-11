<script setup>
import { ref, watch } from 'vue'
import { diffWordsWithSpace } from 'diff'

// State for the two text panels
const leftText = ref('')
const rightText = ref('')

// State for notification
const notification = ref('')

// Watch both text boxes for any changes
watch([leftText, rightText], ([newLeft, newRight]) => {
  // No calculation if both are empty
  if (!newLeft && !newRight) return

  // Calculate the diff
  const differences = diffWordsWithSpace(newLeft, newRight)

  // TMP: Log the differences to the console
  console.clear()
  console.log('Diff Result:')
  console.log(differences)
})

// Helper to show the notification and auto-hide it
const showNotification = (msg) => {
  notification.value = msg
  setTimeout(() => {
    notification.value = ''
  }, 1000)
}

// Copy function using the standard Clipboard API
const copyText = async (textToCopy) => {
  try {
    await navigator.clipboard.writeText(textToCopy)
    showNotification('Copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy: ', err)
  }
}

// Paste function
const pasteText = async (targetPanel) => {
  try {
    const text = await navigator.clipboard.readText()
    if (targetPanel === 'left') leftText.value = text
    if (targetPanel === 'right') rightText.value = text
  } catch (err) {
    console.error('Failed to read clipboard: ', err)
  }
}
</script>

<template>
  <Transition name="fade">
    <div v-if="notification" class="toast">
      {{ notification }}
    </div>
  </Transition>

  <div class="workspace">
    <header class="header">
      <h1>Comparetto</h1>
    </header>

    <div class="panels-container">
      <div class="panel">
        <div class="toolbar">
          <span class="label">Original Text</span>
          <div class="actions">
            <button @click="copyText(leftText)">Copy</button>
            <button @click="pasteText('left')">Paste</button>
          </div>
        </div>
        <textarea v-model="leftText" placeholder="Paste original text here..."></textarea>
      </div>

      <div class="panel">
        <div class="toolbar">
          <span class="label">Modified Text</span>
          <div class="actions">
            <button @click="copyText(rightText)">Copy</button>
            <button @click="pasteText('right')">Paste</button>
          </div>
        </div>
        <textarea v-model="rightText" placeholder="Paste modified text here..."></textarea>
      </div>
    </div>
  </div>
</template>