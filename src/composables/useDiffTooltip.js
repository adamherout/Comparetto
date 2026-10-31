import { ref, watch } from 'vue'

export function useDiffTooltip(processedDiff, panels) {
  const { leftText, rightText, leftUpdateKey, rightUpdateKey } = panels

  // State to enable or disable the hover feature
  const isHoverEnabled = ref(localStorage.getItem('hoverFeature') !== 'false')
  
  // Watch for changes to the hover feature state and persist it in localStorage
  watch(isHoverEnabled, (val) => {
    localStorage.setItem('hoverFeature', val)
    if (!val) endPreview()
  })

  // Whether the original panel can be typed in and written to. On by default.
  const isLeftEditable = ref(localStorage.getItem('leftEditable') !== 'false')

  watch(isLeftEditable, (val) => {
    localStorage.setItem('leftEditable', val)
    // The interaction model changes, so drop anything mid-flight
    endPreview()
  })

  // The block being offered, and which panel will render the pending result
  const preview = ref({ index: null, target: null })

  const isPreviewTarget = (panel, index) =>
    preview.value.index === index && preview.value.target === panel

  // Where the result of acting on a hovered block should appear. Normally the
  // opposite panel, but when the original is locked the modified panel
  // previews on itself, since it is the only panel that can take the change.
  const previewTarget = (sourcePanel) => {
    if (sourcePanel === 'left') return 'right'
    return isLeftEditable.value ? 'left' : 'right'
  }

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

  // Apply one block in whichever direction the preview indicated
  const applyChange = (index, sourcePanel = 'left') => {
    console.log('applyChange', index, sourcePanel, previewTarget(sourcePanel))
    if (index === null || index === undefined) return

    const block = processedDiff.value[index]
    if (!isChange(block)) return

    if (previewTarget(sourcePanel) === 'right') {
      rightText.value = processedDiff.value
        .map((b, i) => (i === index ? getLeftText(b) : getRightText(b)))
        .join('')
      rightUpdateKey.value++
    } else {
      leftText.value = processedDiff.value
        .map((b, i) => (i === index ? getRightText(b) : getLeftText(b)))
        .join('')
      leftUpdateKey.value++
    }

    endPreview()
  }

  // Preview the result of reverting a change
    const startPreview = (block, index, sourcePanel) => {
    if (!isHoverEnabled.value) return
    if (!isChange(block)) return

    preview.value = { index, target: previewTarget(sourcePanel) }
  }

  const endPreview = () => {
    preview.value = { index: null, target: null }
  }

  return {
    isHoverEnabled,
    isLeftEditable,
    preview,
    isPreviewTarget,
    startPreview,
    endPreview,
    applyChange
  }
}