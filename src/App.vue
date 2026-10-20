<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useDiffEngine } from './composables/useDiffEngine'
import { useDiffTooltip } from './composables/useDiffTooltip'

// Use the diff engine composable to manage state and logic related to text comparison
const { 
  leftText, 
  rightText, 
  isDiffEnabled, 
  processedDiff,
  rightUpdateKey,
  leftUpdateKey,
  splitWhitespace, 
  handleEdit,
  handleKeyDown,
  handlePaste,
  rightContainer,
  leftContainer
} = useDiffEngine()

// Use the diff tooltip composable to manage state and logic related to the floating tooltip
const {
  isHoverEnabled,
  isLeftEditable,
  tooltip,
  hideTooltip,
  cancelHideTooltip,
  revertChange,
  isPreviewTarget,
  startPreview,
  endPreview,
  applyChange,
  handleRightEnter,
  handleRightLeave
} = useDiffTooltip(processedDiff, { leftText, rightText, leftUpdateKey, rightUpdateKey })

// While a change is being previewed, the receiving panel shows the other
// panel's wording and the hidden sizing layer holds its own, so the two swap
// places and the block keeps its width either way
const incomingText = (panel, block) =>
  panel === 'left' ? block.added.value : block.removed.value

const ownText = (panel, block) =>
  panel === 'left' ? block.removed.value : block.added.value

const shownText = (panel, block, index) =>
  isPreviewTarget(panel, index) ? incomingText(panel, block) : ownText(panel, block)

const ghostText = (panel, block, index) =>
  isPreviewTarget(panel, index) ? ownText(panel, block) : incomingText(panel, block)

// State for menu expansion, initialized from local storage
const isMenuExpanded = ref(localStorage.getItem('menuExpanded') !== 'false')

// Watcher to persist menu expansion state to local storage whenever it changes
watch(isMenuExpanded, (val) => {
  localStorage.setItem('menuExpanded', val)
})

// Toggle menu
const toggleMenu = () => {
  isMenuExpanded.value = !isMenuExpanded.value
}

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
</script>

<template>
  <Transition name="fade">
    <div v-if="notification" class="toast">
      {{ notification }}
    </div>
  </Transition>

  <div 
    class="diff-tooltip tooltip-removed" 
    :class="{ 'is-visible': tooltip.visible }"
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
      
      <div class="header-controls">
        <!-- The sliding container for the tools -->
        <div class="menu-items" :class="{ 'is-expanded': isMenuExpanded }">
          
          <span class="toggle-label">Edit original</span>
          <label class="switch">
            <input type="checkbox" v-model="isLeftEditable">
            <span class="slider"></span>
          </label>

          <span class="toggle-label">Hover</span>
          <label class="switch">
            <input type="checkbox" v-model="isHoverEnabled">
            <span class="slider"></span>
          </label>

          <span class="toggle-label">Diff</span>
          <label class="switch">
            <input type="checkbox" v-model="isDiffEnabled">
            <span class="slider"></span>
          </label>
          
          <button class="icon-btn theme-toggle" title="Toggle Theme" @click="toggleTheme">
            <img src="./assets/light-dark-mode.svg" alt="Theme Icon" />
          </button>

        </div>

        <!-- The Expand/Collapse Toggle Button -->
        <button 
          class="icon-btn menu-toggle" 
          @click="toggleMenu" 
          :title="isMenuExpanded ? 'Collapse Menu' : 'Expand Menu'"
        >
          <!-- Show ">" (Collapse Right) when expanded -->
          <svg v-if="isMenuExpanded" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <!-- Show "<" (Expand Left) when collapsed -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>
      
    </header>
    <div class="panels-container" :class="{ 'interactive-hovers': isHoverEnabled }">
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
            <button class="icon-btn clear-btn" title="Clear Text" @click="clearText('left')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
                <div 
          v-if="showDiff" 
          ref="leftContainer"
          class="content-display"
          :contenteditable="isLeftEditable"
          spellcheck="false"
          @input="handleEdit($event, 'left')"
          @keydown="handleKeyDown($event, 'left')"
          @paste="handlePaste($event, 'left')"
        >
          <span :key="leftUpdateKey">
            <template v-for="(block, index) in processedDiff" :key="'left-' + index">
              <span v-if="block.isReplacement" class="replacement-grid">
                <span class="ghost-layer" contenteditable="false">
                  <span>{{ splitWhitespace(ghostText('left', block, index)).word }}</span>
                  <span>{{ splitWhitespace(ghostText('left', block, index)).space }}</span>
                </span>
                <span class="visible-layer">
                  <span 
                    :class="isPreviewTarget('left', index) ? 'preview-incoming-added' : 'highlight-removed'"
                    @mouseenter="startPreview(block, index, 'left')"
                    @mouseleave="endPreview()"
                    @click="applyChange(index, 'left')"
                  >{{ splitWhitespace(shownText('left', block, index)).word }}</span>
                  <span>{{ splitWhitespace(shownText('left', block, index)).space }}</span>
                </span>
                <span class="filler-layer dotted-bg" contenteditable="false"></span>
              </span>
              <span v-else-if="block.added" contenteditable="false">
                <span 
                  class="dotted-bg ghost-text"
                  :class="{ 'preview-restore-added': isPreviewTarget('left', index) }"
                  @mouseenter="startPreview(block, index, 'left')"
                  @mouseleave="endPreview()"
                  @click="applyChange(index, 'left')"
                >{{ splitWhitespace(block.value).word }}</span>
                <span class="unselectable-space">{{ splitWhitespace(block.value).space }}</span>
              </span>
              <span v-else-if="block.removed">
                <span 
                  class="highlight-removed"
                  :class="{ 'preview-delete': isPreviewTarget('left', index) }"
                  @mouseenter="startPreview(block, index, 'left')"
                  @mouseleave="endPreview()"
                  @click="applyChange(index, 'left')"
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
            <button class="icon-btn clear-btn" title="Clear Text" @click="clearText('right')">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div 
          v-if="showDiff" 
          ref="rightContainer"
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
                  <span>{{ splitWhitespace(ghostText('right', block, index)).word }}</span>
                  <span>{{ splitWhitespace(ghostText('right', block, index)).space }}</span>
                </span>
                <span class="visible-layer">
                  <span 
                    :class="isPreviewTarget('right', index) ? 'preview-incoming' : 'highlight-added'"
                    @mouseenter="handleRightEnter($event, block, index)"
                    @mouseleave="handleRightLeave()"
                    @click="applyChange(index, 'right')"
                  >{{ splitWhitespace(shownText('right', block, index)).word }}</span>
                  <span>{{ splitWhitespace(shownText('right', block, index)).space }}</span>
                </span>
                <span class="filler-layer dotted-bg" contenteditable="false"></span>
              </span>
              <span v-else-if="block.removed" contenteditable="false">
                <span 
                  class="dotted-bg ghost-text"
                  :class="{ 'preview-restore': isPreviewTarget('right', index) }"
                  @mouseenter="handleRightEnter($event, block, index)"
                  @mouseleave="handleRightLeave()"
                  @click="applyChange(index, 'right')"
                >{{ splitWhitespace(block.value).word }}</span>
                <span class="unselectable-space">{{ splitWhitespace(block.value).space }}</span>
              </span>
              <span v-else-if="block.added">
                <span 
                  class="highlight-added"
                  :class="{ 'preview-delete': isPreviewTarget('right', index) }"
                  @mouseenter="handleRightEnter($event, block, index)"
                  @mouseleave="handleRightLeave()"
                  @click="applyChange(index, 'right')"
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