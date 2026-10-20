import { ref, computed, watch } from 'vue'
import { createTwoFilesPatch } from 'diff'

export function usePatchExport(leftText, rightText) {
  // Name of the file the patch will be applied to, remembered between sessions
  const fileName = ref(localStorage.getItem('patchFileName') || 'document.txt')
  const isPatchOpen = ref(false)

  watch(fileName, (val) => localStorage.setItem('patchFileName', val))

  // Normalise line endings to Unix style, and ensure the file ends with a newline.
  const normalise = (text) => {
    const unixEndings = text.replace(/\r\n?/g, '\n')
    if (!unixEndings || unixEndings.endsWith('\n')) return unixEndings
    return unixEndings + '\n'
  }

  // Keep the name from breaking out of the a/ and b/ prefixes or the shell
  const safeName = computed(() => {
    const cleaned = fileName.value
      .trim()
      .replace(/[^\w.\-/]/g, '_')
      .replace(/^[/.]+/, '')
    return cleaned || 'document.txt'
  })

  // a/ and b/ prefixes are the git convention, which is why the command below is -p1
  const patchText = computed(() => {
    if (!leftText.value && !rightText.value) return ''

    const raw = createTwoFilesPatch(
      `a/${safeName.value}`,
      `b/${safeName.value}`,
      normalise(leftText.value),
      normalise(rightText.value),
      undefined,
      undefined,
      { context: 3 }
    )

    // jsdiff emits a Subversion-style separator line above the header. GNU
    // patch skips it, git apply does not, so the file starts at the --- line.
    const headerStart = raw.indexOf('--- ')
    return headerStart > 0 ? raw.slice(headerStart) : raw
  })

  // The header is always returned, so a hunk marker is what tells us there is
  // actually something to export
  const hasChanges = computed(() => /^@@/m.test(patchText.value))

  const patchName = computed(() => {
    const base = safeName.value.split('/').pop().replace(/\.[^.]*$/, '')
    return `${base || 'document'}.patch`
  })

  const patchCommand = computed(() => `patch -p1 < ${patchName.value}`)

  // Download the patch as a file, if there are any changes to export
  const downloadPatch = () => {
    if (!hasChanges.value) return

    const blob = new Blob([patchText.value], { type: 'text/x-patch' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = patchName.value
    link.click()

    URL.revokeObjectURL(url)
  }

  return {
    fileName,
    isPatchOpen,
    patchText,
    hasChanges,
    patchName,
    patchCommand,
    downloadPatch
  }
}