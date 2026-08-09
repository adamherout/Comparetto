import { ref, watch } from 'vue'

export function useDiffTooltip(processedDiff, leftText, rightText, rightUpdateKey) {

  // State to enable or disable the hover tooltip feature
  const isHoverEnabled = ref(localStorage.getItem('hoverFeature') !== 'false')

  // Watch for changes to the hover feature state and persist it in localStorage
  watch(isHoverEnabled, (val) => {
    localStorage.setItem('hoverFeature', val)
    if (!val) hideTooltip(true)
  })

  // State for the tooltip's visibility, content, and position
  const tooltip = ref({
    visible: false,
    text: '',
    panel: '',
    targetIndex: null,
    top: '0px',
    left: '0px'
  })

  let hideTimeout = null

  // Utility functions to get the left and right text for a given diff block
  const getLeftText = (block) => {
    if (block.isReplacement) return block.removed.value
    if (block.removed) return block.value
    if (block.added) return ''
    return block.value
  }

  const getRightText = (block) => {
    if (block.isReplacement) return block.added.value
    if (block.removed) return ''
    if (block.added) return block.value
    return block.value
  }

  // Function to revert a change based on the tooltip's target index and panel
  const revertChange = () => {
    const targetIndex = tooltip.value.targetIndex
    const panel = tooltip.value.panel
    if (targetIndex === null) return

    const block = processedDiff.value[targetIndex]
    if (!block.isReplacement && !block.added && !block.removed) return

    // Revert the change by replacing the text in the appropriate panel
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
   
    hideTooltip(true)
  }

  // Function to show the tooltip with appropriate content and position based on the hovered block
  const showTooltip = (event, block, panel, index) => {
    if (!isHoverEnabled.value) return
    if (!block.isReplacement && !block.added && !block.removed) return

    clearTimeout(hideTimeout)

    tooltip.value.panel = panel
    tooltip.value.targetIndex = index

    // Determine the tooltip text based on the block type and panel
    if (block.isReplacement) {
      tooltip.value.text = panel === 'left' ? block.added.value : block.removed.value
    } else if (block.removed && panel === 'left') {
      tooltip.value.text = '(Remove)'
    } else if (block.added && panel === 'right') {
      tooltip.value.text = '(Remove)'
    } else {
      return
    }

    // Position the tooltip above the hovered element
    const rect = event.currentTarget.getBoundingClientRect()
    tooltip.value.left = `${rect.left + (rect.width / 2) + window.scrollX}px`
    tooltip.value.top = `${rect.top + window.scrollY - 10}px`
    tooltip.value.visible = true
  }

  // Function to hide the tooltip, either immediately or after a short delay
  const hideTooltip = (immediate = false) => {
    clearTimeout(hideTimeout)
    
    if (immediate) {
      tooltip.value.visible = false
    } else {
      hideTimeout = setTimeout(() => {
        tooltip.value.visible = false
      }, 500)
    }
  }

  // Function to cancel the hide tooltip timeout, keeping the tooltip visible
  const cancelHideTooltip = () => {
    clearTimeout(hideTimeout)
  }

  return {
    isHoverEnabled,
    tooltip,
    showTooltip,
    hideTooltip,
    cancelHideTooltip,
    revertChange
  }
}