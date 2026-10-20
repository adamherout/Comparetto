import { ref, watch } from 'vue'

export function useDiffTooltip(processedDiff, panels) {
  const { leftText, rightText, leftUpdateKey, rightUpdateKey } = panels

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

  // Whether the original panel can be typed in and written to. On by default.
  const isLeftEditable = ref(localStorage.getItem('leftEditable') !== 'false')

  watch(isLeftEditable, (val) => {
    localStorage.setItem('leftEditable', val)
    // The interaction model changes, so drop anything mid-flight
    endPreview()
    hideTooltip(true)
  })

  // State for the tooltip. Only ever raised by the modified panel.
  const tooltip = ref({
    visible: false,
    text: '',
    targetIndex: null,
    top: '0px',
    left: '0px'
  })

    // The block being offered, and which panel is offering it. The *other*
  // panel renders it as the pending result.
  const preview = ref({ index: null, source: null })

  // True when this panel should render block `index` as the pending result
  const isPreviewTarget = (panel, index) =>
    preview.value.index === index &&
    preview.value.source !== null &&
    preview.value.source !== panel

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

    // Copy one block from the hovered panel into the other one. Writing to the
  // original is refused while it is locked.
  const applyChange = (index, fromPanel = 'left') => {
    if (index === null || index === undefined) return

    const block = processedDiff.value[index]
    if (!isChange(block)) return

    if (fromPanel === 'left') {
      rightText.value = processedDiff.value
        .map((b, i) => (i === index ? getLeftText(b) : getRightText(b)))
        .join('')
      rightUpdateKey.value++
    } else {
      if (!isLeftEditable.value) return
      leftText.value = processedDiff.value
        .map((b, i) => (i === index ? getRightText(b) : getLeftText(b)))
        .join('')
      leftUpdateKey.value++
    }

    // The diff has been rebuilt, so the old index means nothing now
    endPreview()
    hideTooltip(true)
  }

  // Hovering a panel shows the result on the opposite side instead of
  // floating a tooltip over the text being hovered
  const startPreview = (block, index, sourcePanel) => {
    if (!isHoverEnabled.value) return
    if (!isChange(block)) return
    // Hovering the modified panel only means something if the original can take it
    if (sourcePanel === 'right' && !isLeftEditable.value) return

    preview.value = { index, source: sourcePanel }
  }

  const endPreview = () => {
    preview.value = { index: null, source: null }
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
    if (isLeftEditable.value) return
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

  // The modified panel either previews onto the original or raises the
  // tooltip, depending on the lock, but never both at once
  const handleRightEnter = (event, block, index) => {
    if (isLeftEditable.value) startPreview(block, index, 'right')
    else showTooltip(event, block, index)
  }

  const handleRightLeave = () => {
    endPreview()
    hideTooltip()
  }

  // Clicking the tooltip applies the change it is describing
    const revertChange = () => applyChange(tooltip.value.targetIndex, 'left')

    return {
    isHoverEnabled,
    isLeftEditable,
    tooltip,
    showTooltip,
    hideTooltip,
    cancelHideTooltip,
    revertChange,
    preview,
    isPreviewTarget,
    startPreview,
    endPreview,
    applyChange,
    handleRightEnter,
    handleRightLeave
  }
}