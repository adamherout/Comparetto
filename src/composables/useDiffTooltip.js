import { ref } from 'vue'

export function useDiffTooltip(processedDiff, leftText, rightText, rightUpdateKey) {
  const tooltip = ref({
    visible: false,
    text: '',
    panel: '',
    targetIndex: null,
    top: '0px',
    left: '0px'
  })

  let hideTimeout = null

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

  const revertChange = () => {
    const targetIndex = tooltip.value.targetIndex
    const panel = tooltip.value.panel
    if (targetIndex === null) return

    const block = processedDiff.value[targetIndex]
    if (!block.isReplacement && !block.added && !block.removed) return

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

  const showTooltip = (event, block, panel, index) => {
    if (!block.isReplacement && !block.added && !block.removed) return

    clearTimeout(hideTimeout)

    tooltip.value.panel = panel
    tooltip.value.targetIndex = index
    
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
    tooltip.value.top = `${rect.top + window.scrollY - 10}px`
    tooltip.value.visible = true
  }

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

  const cancelHideTooltip = () => {
    clearTimeout(hideTimeout)
  }

  return {
    tooltip,
    showTooltip,
    hideTooltip,
    cancelHideTooltip,
    revertChange
  }
}