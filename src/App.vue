<script setup>
import { ref, onMounted, computed } from 'vue'
import { useDiffEngine } from './composables/useDiffEngine'

// Use the diff engine composable to manage state and logic related to text comparison
const { 
  leftText, 
  rightText, 
  isDiffEnabled, 
  processedDiff,
  rightUpdateKey,
  splitWhitespace, 
  handleEdit,
  handleKeyDown,
  handlePaste
} = useDiffEngine()

// State for notification
const notification = ref('')
// State for theme
const isDarkMode = ref(true)
// Computed property to determine if the diff view should be shown
const showDiff = computed(() => isDiffEnabled.value && leftText.value && rightText.value)

// Toggle theme
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  const newTheme = isDarkMode.value ? 'dark' : 'light'
  
  // Apply to HTML tag
  document.documentElement.setAttribute('data-theme', newTheme)
  // Save the user's choice to their browser
  localStorage.setItem('theme', newTheme)
}

// Initialize theme based on saved preference or default to dark mode
onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  isDarkMode.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
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

// Clear function
const clearText = (targetPanel) => {
  if (targetPanel === 'left') leftText.value = ''
  if (targetPanel === 'right') rightText.value = ''
}

// Reactive state for the floating tooltip
const tooltip = ref({
  visible: false,
  text: '',
  panel: '',
  targetIndex: null,
  top: '0px',
  left: '0px'
})

let hideTimeout = null

// Helper to extract exactly what the left side should look like
const getLeftText = (block) => {
  if (block.isReplacement) return block.removed.value
  if (block.removed) return block.value
  if (block.added) return ''
  return block.value
}

// Helper to extract exactly what the right side should look like
const getRightText = (block) => {
  if (block.isReplacement) return block.added.value
  if (block.removed) return ''
  if (block.added) return block.value
  return block.value
}

const revertChange = () => {
  const targetIndex = tooltip.value.targetIndex
  const panel = tooltip.value.panel
  if (targetIndex === null) return

  const block = processedDiff.value[targetIndex]
  if (!block.isReplacement && !block.added && !block.removed) return

  // Update the left or right text based on which panel was clicked
  if (panel === 'left') {
    const newLeftText = processedDiff.value.map((b, i) => 
      i === targetIndex ? getRightText(b) : getLeftText(b)
    ).join('')
    leftText.value = newLeftText
  } 
  else if (panel === 'right') {
    const newRightText = processedDiff.value.map((b, i) => 
      i === targetIndex ? getLeftText(b) : getRightText(b)
    ).join('')
    rightText.value = newRightText
    rightUpdateKey.value++ 
  }
 
  // Hide the tooltip after reverting the change
  hideTooltip(true)
}

// Triggered when hovering over a highlighted word
const showTooltip = (event, block, panel, index) => {
  if (!block.isReplacement && !block.added && !block.removed) return

  clearTimeout(hideTimeout)

  tooltip.value.panel = panel
  tooltip.value.targetIndex = index
  
  // Set the text to show what you are changing it to
  if (block.isReplacement) {
    tooltip.value.text = panel === 'left' ? block.added.value : block.removed.value
  } else if (block.removed && panel === 'left') {
    tooltip.value.text = '(Remove)'
  } else if (block.added && panel === 'right') {
    tooltip.value.text = '(Remove)'
  } else {
    return
  }

  const rect = event.currentTarget.getBoundingClientRect()
  tooltip.value.left = `${rect.left + (rect.width / 2) + window.scrollX}px`
  tooltip.value.top = `${rect.top + window.scrollY - 6}px`
  tooltip.value.visible = true
}

// Adds a small delay before hiding, allowing the mouse to reach the tooltip
const hideTooltip = (immediate = false) => {
  clearTimeout(hideTimeout)
  if (immediate) {
    tooltip.value.visible = false
  } else {
    hideTimeout = setTimeout(() => {
      tooltip.value.visible = false
    }, 500) // 500ms grace period
  }
}

// Triggered when hovering the tooltip itself to keep it open
const cancelHideTooltip = () => {
  clearTimeout(hideTimeout)
}

</script>

<template>
  <Transition name="fade">
    <div v-if="notification" class="toast">
      {{ notification }}
    </div>
  </Transition>

  <div 
    class="diff-tooltip" 
    :class="[
      tooltip.panel === 'left' ? 'tooltip-added' : 'tooltip-removed',
      { 'is-visible': tooltip.visible }
    ]"
    :style="{ top: tooltip.top, left: tooltip.left }"
    @mouseenter="cancelHideTooltip"
    @mouseleave="hideTooltip()"
    @click="revertChange"
  >
    {{ splitWhitespace(tooltip.text).word }}
  </div>

  <div class="workspace">
    <header class="header">
      <h1>Comparetto</h1>
      <div class="toggle-container">
        <span class="toggle-label">Toggle Diff</span>
        <label class="switch">
          <input type="checkbox" v-model="isDiffEnabled">
          <span class="slider"></span>
        </label>
        <button class="icon-btn theme-toggle" title="Toggle Theme" @click="toggleTheme">
          <img src="./assets/light-dark-mode.svg" alt="Theme Icon" />
        </button>
      </div>
    </header>
    <div class="panels-container">
      <div class="panel">
        <div class="toolbar">
          <span class="label">Original Text</span>
          <div class="actions">
            <button class="icon-btn" title="Copy Text" @click="copyText(leftText)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="icon-btn" title="Paste Text" @click="pasteText('left')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
            </button>
            <button class="icon-btn" title="Clear Text" @click="clearText('left')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div 
          v-if="showDiff" 
          class="content-display"
          :contenteditable="!leftText"
          spellcheck="false"
          @input="handleEdit($event, 'left')"
          @keydown="handleKeyDown($event, 'left')"
          @paste="handlePaste($event, 'left')"
        >
          <template v-for="(block, index) in processedDiff" :key="'left-' + index">
            <span v-if="block.isReplacement" class="replacement-grid">
              <span class="ghost-layer">
                <span>{{ splitWhitespace(block.added.value).word }}</span>
                <span>{{ splitWhitespace(block.added.value).space }}</span>
              </span>
              <span class="visible-layer">
                <span 
                  class="highlight-removed"
                  @mouseenter="showTooltip($event, block, 'left', index)"
                  @mouseleave="hideTooltip()"
                >{{ splitWhitespace(block.removed.value).word }}</span>
              </span>
              <span class="filler-layer dotted-bg"></span>
            </span>
            <span v-else-if="block.added">
              <span class="dotted-bg">{{ splitWhitespace(block.value).word }}</span>
              <span class="unselectable-space">{{ splitWhitespace(block.value).space }}</span>
            </span>
            <span v-else-if="block.removed">
              <span 
                class="highlight-removed"
                @mouseenter="showTooltip($event, block, 'left', index)"
                @mouseleave="hideTooltip()"
              >{{ splitWhitespace(block.value).word }}</span>
              <span>{{ splitWhitespace(block.value).space }}</span>
            </span>
            <span v-else>
              <span>{{ splitWhitespace(block.value).word }}</span>
              <span>{{ splitWhitespace(block.value).space }}</span>
            </span>
          </template>
        </div>
        <textarea 
          v-else 
          v-model="leftText"
        ></textarea>
        <div v-if="!leftText" class="empty-overlay">
        <button class="big-paste-btn" @click="pasteText('left')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        </button>
      </div>
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
            <button class="icon-btn" title="Clear Text" @click="clearText('right')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        <div 
          v-if="showDiff" 
          class="content-display"
          contenteditable="true"
          spellcheck="false"
          @input="handleEdit($event, 'right')"
          @keydown="handleKeyDown($event, 'right')"
          @paste="handlePaste($event, 'right')"
        >
          <span :key="rightUpdateKey">
            <template v-for="(block, index) in processedDiff" :key="'right-' + index">
              <span v-if="block.isReplacement" class="replacement-grid">
                <span class="ghost-layer" contenteditable="false">
                  <span>{{ splitWhitespace(block.removed.value).word }}</span>
                  <span>{{ splitWhitespace(block.removed.value).space }}</span>
                </span>
                <span class="visible-layer">
                  <span 
                    class="highlight-added"
                    @mouseenter="showTooltip($event, block, 'right', index)"
                    @mouseleave="hideTooltip()"
                  >{{ splitWhitespace(block.added.value).word }}</span>
                  <span>{{ splitWhitespace(block.added.value).space }}</span>
                </span>
                <span class="filler-layer dotted-bg" contenteditable="false"></span>
              </span>
              <span v-else-if="block.removed" contenteditable="false">
                <span class="dotted-bg">{{ splitWhitespace(block.value).word }}</span>
                <span class="unselectable-space">{{ splitWhitespace(block.value).space }}</span>
              </span>
              <span v-else-if="block.added">
                <span 
                  class="highlight-added"
                  @mouseenter="showTooltip($event, block, 'right', index)"
                  @mouseleave="hideTooltip()"
                >{{ splitWhitespace(block.value).word }}</span>
                <span>{{ splitWhitespace(block.value).space }}</span>
              </span>
              <span v-else>
                <span>{{ splitWhitespace(block.value).word }}</span>
                <span>{{ splitWhitespace(block.value).space }}</span>
              </span>
            </template>
          </span>
        </div>
        <textarea 
          v-else 
          v-model="rightText"
        ></textarea>
        <div v-if="!rightText" class="empty-overlay">
          <button class="big-paste-btn" @click="pasteText('right')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>