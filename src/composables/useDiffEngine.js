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

  // Grouping parameters for how we treat similar words and replacements
  const GROUPING = {
    // Minimum similarity score for two words to be considered a match
    similarityThreshold: 0.4,
    // Maximum number of tokens in a group before we stop trying to find anchors
    maxGroupTokens: 6,
    // Maximum number of token pairs to consider when searching for anchors
    maxSearchArea: 2500
  }

  // Split a chunk of diff text into individual word+trailing-space tokens
  const tokenize = (text) => text.match(/\S+\s*|\s+/g) || []

  // How much of the two words overlaps, as character bigrams
  const diceCoefficient = (x, y) => {
    const pool = []
    for (let i = 0; i < y.length - 1; i++) pool.push(y.slice(i, i + 2))

    let hits = 0
    for (let i = 0; i < x.length - 1; i++) {
      const index = pool.indexOf(x.slice(i, i + 2))
      if (index > -1) {
        hits++
        pool.splice(index, 1)
      }
    }

    return (2 * hits) / ((x.length - 1) + (y.length - 1))
  }

  // How much of the two words overlaps, as a prefix
  const prefixRatio = (x, y) => {
    let shared = 0
    while (shared < x.length && shared < y.length && x[shared] === y[shared]) shared++
    return shared / Math.max(x.length, y.length)
  }

  // A combined similarity score that averages the Dice coefficient and prefix ratio
  const similarity = (a, b) => {
    const x = a.trim().toLowerCase()
    const y = b.trim().toLowerCase()

    if (!x || !y) return 0
    if (x === y) return 1
    if (x.length < 2 || y.length < 2) return 0

    return (diceCoefficient(x, y) + prefixRatio(x, y)) / 2
  }

  // Find pairs of words that clearly correspond to each other. These act as
  // pins, everything between two pins is free to collapse into one group.
  const findAnchors = (removedTokens, addedTokens) => {
    if (removedTokens.length * addedTokens.length > GROUPING.maxSearchArea) return []

    const candidates = []
    for (let i = 0; i < removedTokens.length; i++) {
      for (let j = 0; j < addedTokens.length; j++) {
        const score = similarity(removedTokens[i], addedTokens[j])
        if (score >= GROUPING.similarityThreshold) candidates.push({ i, j, score })
      }
    }

    // Best matches win, ties go to the pair that moved the least
    candidates.sort((a, b) =>
      b.score - a.score || (Math.abs(a.i - a.j) - Math.abs(b.i - b.j))
    )

    const anchors = []
    for (const candidate of candidates) {
      // One anchor per word, and anchors may never cross each other
      const conflicts = anchors.some(anchor =>
        anchor.i === candidate.i ||
        anchor.j === candidate.j ||
        (anchor.i - candidate.i) * (anchor.j - candidate.j) < 0
      )
      if (!conflicts) anchors.push(candidate)
    }

    return anchors.sort((a, b) => a.i - b.i)
  }

  // Carve both token lists into aligned segments using the anchors as cut points
  const buildSegments = (removedTokens, addedTokens) => {
    const anchors = findAnchors(removedTokens, addedTokens)
    const segments = []
    let removedCursor = 0
    let addedCursor = 0

    for (const anchor of anchors) {
      const gapRemoved = removedTokens.slice(removedCursor, anchor.i)
      const gapAdded = addedTokens.slice(addedCursor, anchor.j)
      if (gapRemoved.length || gapAdded.length) {
        segments.push({ removed: gapRemoved, added: gapAdded })
      }

      // The anchor itself is a single token on each side, which we treat as a replacement
      segments.push({
        removed: [removedTokens[anchor.i]],
        added: [addedTokens[anchor.j]]
      })

      removedCursor = anchor.i + 1
      addedCursor = anchor.j + 1
    }

    const tailRemoved = removedTokens.slice(removedCursor)
    const tailAdded = addedTokens.slice(addedCursor)
    if (tailRemoved.length || tailAdded.length) {
      segments.push({ removed: tailRemoved, added: tailAdded })
    }

    return segments
  }

  // A group containing a line break would break the inline grid rendering,
  // so those are always left ungrouped
  const hasInnerNewline = (value) => value.replace(/\s+$/, '').includes('\n')

  // The original word by word pairing, kept as a fallback for awkward segments
  const zipTokens = (removedTokens, addedTokens, output) => {
    const maxLength = Math.max(removedTokens.length, addedTokens.length)

    for (let i = 0; i < maxLength; i++) {
      const r = removedTokens[i]
      const a = addedTokens[i]

      if (r && a) {
        // Both removed and added words exist, render as a replacement
        output.push({
          isReplacement: true,
          removed: { value: r, removed: true },
          added: { value: a, added: true }
        })
      } else if (r) {
        // Leftover removed words, render as standard removed text
        output.push({ isReplacement: false, value: r, removed: true })
      } else if (a) {
        // Leftover added words, render as standard added text
        output.push({ isReplacement: false, value: a, added: true })
      }
    }
  }

  // Turn one aligned segment into render ready blocks
  const emitSegment = (segment, output) => {
    const removedValue = segment.removed.join('')
    const addedValue = segment.added.join('')

    // Nothing on one side means this is a plain insertion or deletion
    if (!removedValue) {
      output.push({ isReplacement: false, value: addedValue, added: true })
      return
    }
    if (!addedValue) {
      output.push({ isReplacement: false, value: removedValue, removed: true })
      return
    }

    const tooLong =
      segment.removed.length > GROUPING.maxGroupTokens ||
      segment.added.length > GROUPING.maxGroupTokens
    const wrapsLines = hasInnerNewline(removedValue) || hasInnerNewline(addedValue)

    if (tooLong || wrapsLines) {
      zipTokens(segment.removed, segment.added, output)
      return
    }

    // The whole segment reads as a single change
    output.push({
      isReplacement: true,
      removed: { value: removedValue, removed: true },
      added: { value: addedValue, added: true }
    })
  }

  // Process the raw diff output to identify replacements and maintain word/space pairs
  const processDiff = (rawDiff) => {
    const processed = []
    for (let i = 0; i < rawDiff.length; i++) {
      const current = rawDiff[i]
      const next = rawDiff[i + 1]

      // Check for a replacement pattern (removed followed by added)
      if (current.removed && next && next.added) {
        // Align the two sides and emit one block per real change
        const segments = buildSegments(tokenize(current.value), tokenize(next.value))
        for (const segment of segments) emitSegment(segment, processed)

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