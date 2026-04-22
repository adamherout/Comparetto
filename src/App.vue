<script setup>
import { ref, watch } from 'vue'
import { diffWordsWithSpace } from 'diff'

// State for the two text panels
const leftText = ref('')
const rightText = ref('')

// State to toggle diff highlighting
const isDiffEnabled = ref(true)

// State for notification
const notification = ref('')

// State to hold the diff result
const diffResult = ref([])

// State to hold the processed diff with replacement info
const processedDiff = ref([])

// Watch both text boxes for any changes
watch([leftText, rightText], ([newLeft, newRight]) => {
  if (!newLeft && !newRight) {
    diffResult.value = []
    return
  }

  const rawDifferences = diffWordsWithSpace(newLeft || '', newRight || '')
  processedDiff.value = processDiff(rawDifferences)
})

const processDiff = (rawDiff) => {
  const processed = []
  for (let i = 0; i < rawDiff.length; i++) {
    const current = rawDiff[i]
    const next = rawDiff[i + 1]

    // Check for a replacement pattern (removed followed by added)
    if (current.removed && next && next.added) {
      processed.push({
        isReplacement: true,
        removed: current,
        added: next
      })
      i++
    } 
    // Standard standalone token
    else {
      processed.push({
        isReplacement: false,
        ...current
      })
    }
  }
  return processed
}

// Helper to separate a word from its trailing spaces/newlines
const splitWhitespace = (text) => {
  const match = text.match(/^([\s\S]*?)(\s*)$/)
  return {
    word: match[1],
    space: match[2]
  }
}

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
      <div class="toggle-container">
        <span class="toggle-label">Toggle Diff</span>
        <label class="switch">
          <input type="checkbox" v-model="isDiffEnabled">
          <span class="slider"></span>
        </label>
      </div>
    </header>
    <div class="panels-container">
      <div class="panel">
        <div class="toolbar">
          <span class="label">Original Text</span>
          <div class="actions">
            <!-- Copy button is currently disabled for the left panel -->
            <!-- <button class="icon-btn" title="Copy Text" @click="copyText(leftText)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button> -->
            <button class="icon-btn" title="Paste Text" @click="pasteText('left')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </button>
          </div>
        </div>
        <div v-if="isDiffEnabled" class="content-display">
          <template v-for="(block, index) in processedDiff" :key="'left-' + index">
            <span v-if="block.isReplacement" class="replacement-grid">
              <span class="ghost-layer">
                <span>{{ splitWhitespace(block.added.value).word }}</span>
                <span>{{ splitWhitespace(block.added.value).space }}</span>
              </span>
              <span class="visible-layer">
                <span class="highlight-removed">{{ splitWhitespace(block.removed.value).word }}</span>
                <span>{{ splitWhitespace(block.removed.value).space }}</span>
              </span>
              <span class="filler-layer dotted-bg"></span>
            </span>
            <span v-else-if="block.added">
              <span class="dotted-bg">{{ splitWhitespace(block.value).word }}</span>
              <span class="unselectable-space">{{ splitWhitespace(block.value).space }}</span>
            </span>
            <span v-else>
              <span :class="{ 'highlight-removed': block.removed }">{{ splitWhitespace(block.value).word }}</span>
              <span>{{ splitWhitespace(block.value).space }}</span>
            </span>
          </template>
          <span v-if="!leftText" class="placeholder">Original ...</span>
        </div>
        <textarea 
          v-else 
          v-model="leftText" 
          placeholder="Original ..."
        ></textarea>
      </div>
      <div class="panel">
        <div class="toolbar">
          <span class="label">Modified Text</span>
          <div class="actions">
            <button class="icon-btn" title="Copy Text" @click="copyText(rightText)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="icon-btn" title="Paste Text" @click="pasteText('right')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </button>
          </div>
        </div>
        <div v-if="isDiffEnabled" class="content-display">
          <template v-for="(block, index) in processedDiff" :key="'right-' + index">
            <span v-if="block.isReplacement" class="replacement-grid">
              <span class="ghost-layer">
                <span>{{ splitWhitespace(block.removed.value).word }}</span>
                <span>{{ splitWhitespace(block.removed.value).space }}</span>
              </span>
              <span class="visible-layer">
                <span class="highlight-added">{{ splitWhitespace(block.added.value).word }}</span>
                <span>{{ splitWhitespace(block.added.value).space }}</span>
              </span>
              <span class="filler-layer dotted-bg"></span>
            </span>
            <span v-else-if="block.removed">
              <span class="dotted-bg">{{ splitWhitespace(block.value).word }}</span>
              <span class="unselectable-space">{{ splitWhitespace(block.value).space }}</span>
            </span>
            <span v-else>
              <span :class="{ 'highlight-added': block.added }">{{ splitWhitespace(block.value).word }}</span>
              <span>{{ splitWhitespace(block.value).space }}</span>
            </span>
          </template>
          <span v-if="!rightText" class="placeholder">Modified ...</span>
        </div>
        <textarea 
          v-else 
          v-model="rightText" 
          placeholder="Modified ..."
        ></textarea>
      </div>
    </div>
  </div>
</template>