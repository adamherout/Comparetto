import { ref, watch } from 'vue'

export function useDiffTooltip(processedDiff, rightText, rightUpdateKey) {

  // State to enable or disable the hover feature
  const isHoverEnabled = ref(localStorage.getItem('hoverFeature') !== 'false')

  // Watch for changes to the hover feature state and persist it in localStorage
  watch(isHoverEnabled, (val) => {
    localStorage.setItem('hoverFeature', val)
    if (!val) {
      hideTooltip(true)
      previewIndex.value = null
    }
  })

  // State for the tooltip. Only ever raised by the modified panel.
  const tooltip = ref({
    visible: false,
    text: '',
    targetIndex: null,
    top: '0px',
    left: '0px'
  })

  // Index of the block the original panel is currently offering. The modified
  // panel renders that block as the result instead of raising a tooltip.
  const previewIndex = ref(null)

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

  // True for any block the user can act on
  const isChange = (block) =>
    !!block && (block.isReplacement || block.added || block.removed)

  // Apply the original's version of one block to the modified panel. This is
  // the only mutation in the app, and it always targets the right panel.
  const applyChange = (index) => {
    if (index === null || index === undefined) return

    const block = processedDiff.value[index]
    if (!isChange(block)) return

    rightText.value = processedDiff.value
      .map((b, i) => (i === index ? getLeftText(b) : getRightText(b)))
      .join('')

    rightUpdateKey.value++

    // The diff has been rebuilt, so the old index means nothing now
    previewIndex.value = null
    hideTooltip(true)
  }

  // Hovering the original panel: show the result on the right instead of
  // floating a tooltip over the text being hovered
  const startPreview = (block, index) => {
    if (!isHoverEnabled.value) return
    if (!isChange(block)) return
    previewIndex.value = index
  }

  const endPreview = () => {
    previewIndex.value = null
  }

  // What the tooltip should say. Only the modified panel raises it, and it
  // always reveals the original.
  const getTooltipText = (block) => {
    if (block.isReplacement) return block.removed.value
    if (block.removed) return block.value   // hidden behind the dots
    return '(Remove)'                       // the original never had this
  }

  // Show the tooltip above the hovered element in the modified panel
  const showTooltip = (event, block, index) => {
    if (!isHoverEnabled.value) return
    if (!isChange(block)) return

    clearTimeout(hideTimeout)

    tooltip.value.targetIndex = index
    tooltip.value.text = getTooltipText(block)

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

  // Clicking the tooltip applies the change it is describing
  const revertChange = () => applyChange(tooltip.value.targetIndex)

  return {
    isHoverEnabled,
    tooltip,
    showTooltip,
    hideTooltip,
    cancelHideTooltip,
    revertChange,
    previewIndex,
    startPreview,
    endPreview,
    applyChange
  }
}