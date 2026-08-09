import { ref, watch, nextTick } from 'vue'
import { diffWordsWithSpace } from 'diff'

export function useDiffEngine() {
  // State for the two text panels
  const leftText = ref('')
  const rightText = ref('')
  // State to toggle diff highlighting
  const isDiffEnabled = ref(true)
  // State to hold the processed diff with replacement info
  const processedDiff = ref([])
  // Keys to force re-rendering of contenteditable components when diff changes
  const rightUpdateKey = ref(0)

  // Helper to separate a word from its trailing spaces/newlines
  const splitWhitespace = (text) => {
    const match = text.match(/^([\s\S]*?)(\s*)$/)
    return {
      word: match[1],
      space: match[2]
    }
  }

  // Process the raw diff output to identify replacements and maintain word/space pairs
  const processDiff = (rawDiff) => {
    const processed = []
    for (let i = 0; i < rawDiff.length; i++) {
      const current = rawDiff[i]
      const next = rawDiff[i + 1]

      // Check for a replacement pattern (removed followed by added)
      if (current.removed && next && next.added) {
        
        // Split the large strings into arrays of individual words
        const removedTokens = current.value.match(/\S+\s*|\s+/g) || []
        const addedTokens = next.value.match(/\S+\s*|\s+/g) || []
        
        // Find out which string is longer so we don't leave any words behind
        const maxLength = Math.max(removedTokens.length, addedTokens.length)
        
        // Pair up the removed and added words
        for (let j = 0; j < maxLength; j++) {
          const r = removedTokens[j]
          const a = addedTokens[j]
          
          if (r && a) {
            // Both removed and added words exist, render as a replacement
            processed.push({
              isReplacement: true,
              removed: { value: r, removed: true },
              added: { value: a, added: true }
            })
          } else if (r) {
            // Leftover removed words, render as standard removed text
            processed.push({ isReplacement: false, value: r, removed: true })
          } else if (a) {
            // Leftover added words, render as standard added text
            processed.push({ isReplacement: false, value: a, added: true })
          }
        }
        
        i++ // Skip the next block
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

  // Watch for changes in either text panel and compute the diff, processing it for rendering
  watch([leftText, rightText], ([newLeft, newRight]) => {
    if (!newLeft && !newRight) {
      processedDiff.value = []
      return
    }

    const rawDifferences = diffWordsWithSpace(newLeft || '', newRight || '')
    processedDiff.value = processDiff(rawDifferences)
  }, { flush: 'sync' })

  // Utility to get selection range and text content from a contenteditable container
  const getSelectionAndText = (container) => {
    const selection = window.getSelection()
    let start = 0
    let text = ""

    if (selection.rangeCount > 0) {
      // Drop a marker exactly where the cursor is
      const range = selection.getRangeAt(0)
      const marker = document.createElement('span')
      marker.id = 'caret-marker'
      range.insertNode(marker)

      // Clone the container and instantly remove the marker from the screen
      const clone = container.cloneNode(true)
      marker.remove() 

      // Strip out the ghosts
      clone.querySelectorAll('[contenteditable="false"]').forEach(n => n.remove())

      // Walk the clean clone, grab text and record position when we hit the marker
      const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ALL, null, false)
      let currentNode
      while ((currentNode = walker.nextNode())) {
        if (currentNode.id === 'caret-marker') {
          start = text.length
        } else if (currentNode.nodeType === Node.TEXT_NODE) {
          text += currentNode.textContent
        }
      }
    } else {
      // Fallback if the user somehow loses focus
      const clone = container.cloneNode(true)
      clone.querySelectorAll('[contenteditable="false"]').forEach(n => n.remove())
      text = clone.textContent
    }

    return { text, start }
  }

  // Utility to get the absolute caret position (start and end) in a contenteditable container
  const getStartEnd = (container) => {
    const selection = window.getSelection()
    if (!selection.rangeCount) return { start: 0, end: 0 }

    const range = selection.getRangeAt(0)
    const startMarker = document.createElement('span')
    startMarker.id = 'start-marker'
    const endMarker = document.createElement('span')
    endMarker.id = 'end-marker'

    const endRange = range.cloneRange()
    endRange.collapse(false)
    endRange.insertNode(endMarker)

    const startRange = range.cloneRange()
    startRange.collapse(true)
    startRange.insertNode(startMarker)

    const clone = container.cloneNode(true)
    startMarker.remove()
    endMarker.remove()

    clone.querySelectorAll('[contenteditable="false"]').forEach(n => n.remove())

    let start = 0, end = 0, textLength = 0
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_ALL, null, false)
    let currentNode
    while ((currentNode = walker.nextNode())) {
      if (currentNode.id === 'start-marker') start = textLength
      else if (currentNode.id === 'end-marker') end = textLength
      else if (currentNode.nodeType === Node.TEXT_NODE) textLength += currentNode.textContent.length
    }
    return { start, end }
  }

  // Utility to restore the caret position after updating the text content
  const restoreCaret = (container, targetOffset) => {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false)
    let currentOffset = 0
    let currentNode

    while ((currentNode = walker.nextNode())) {
      if (currentNode.parentElement.closest('[contenteditable="false"]')) continue

      if (currentOffset + currentNode.length >= targetOffset) {
        const range = document.createRange()
        const localOffset = Math.max(0, targetOffset - currentOffset)
        range.setStart(currentNode, Math.min(localOffset, currentNode.length))
        range.collapse(true)

        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
      currentOffset += currentNode.length
    }
  }

  // Handler for keydown events in the contenteditable panels for Enter and Backspace
  const handleKeyDown = async (event, targetPanel) => {
    if (event.key !== 'Enter' && event.key !== 'Backspace') return // Ignore normal typing

    // Prevent the default behavior
    event.preventDefault()
    
    const container = event.currentTarget
    const { start, end } = getStartEnd(container)
    const textRef = targetPanel === 'left' ? leftText : rightText
    const currentText = textRef.value

    let newCursorPos = start

    if (event.key === 'Enter') {
      // Manually inject a newline where the cursor is
      textRef.value = currentText.slice(0, start) + '\n' + currentText.slice(end)
      newCursorPos = start + 1
    } 
    
    if (event.key === 'Backspace') {
      if (start === end && start > 0) {
        // Backspace without selected text, remove the character before the cursor
        textRef.value = currentText.slice(0, start - 1) + currentText.slice(start)
        newCursorPos = start - 1
      } else if (start !== end) {
        // Backspace with selected text, remove the selected range
        textRef.value = currentText.slice(0, start) + currentText.slice(end)
        newCursorPos = start
      }
    }

    // Force Vue to destroy and rebuild the grid
    if (targetPanel === 'right') rightUpdateKey.value++

    // Wait for the redraw, then put the cursor back
    await nextTick()
    restoreCaret(container, newCursorPos)
  }

  // Handler for paste events in the contenteditable panels
  const handlePaste = async (event, targetPanel) => {
    // Prevent the default behavior
    event.preventDefault()

    // Get the unformatted plain text from the clipboard
    const pastedText = (event.clipboardData || window.clipboardData).getData('text/plain')
    if (!pastedText) return

    // Find exactly where the cursor is (and if any text is highlighted)
    const container = event.currentTarget
    const { start, end } = getStartEnd(container)

    // Update the state variable for the appropriate panel with the new text
    const textRef = targetPanel === 'left' ? leftText : rightText
    const currentText = textRef.value

    textRef.value = currentText.slice(0, start) + pastedText + currentText.slice(end)

    // Force Vue to destroy and rebuild the grid
    if (targetPanel === 'right') rightUpdateKey.value++

    // Wait for the redraw, then put the cursor back
    await nextTick()
    restoreCaret(container, start + pastedText.length)
  }

  // Handler for text edits in either panel, preserving caret position
  const handleEdit = async (event, targetPanel) => {
    const container = event.currentTarget
    const { text, start } = getSelectionAndText(container)
    
    if (targetPanel === 'left') {
      leftText.value = text
    }
    if (targetPanel === 'right') {
      rightText.value = text
      rightUpdateKey.value++
    }

    await nextTick()
    restoreCaret(container, start)
  }

  // Expose state and handlers
  return {
    leftText,
    rightText,
    isDiffEnabled,
    processedDiff,
    rightUpdateKey,
    splitWhitespace,
    handleEdit,
    handleKeyDown,
    handlePaste
  }
}