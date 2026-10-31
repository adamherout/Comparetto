import { ref, watch } from 'vue'

// Dots stand for "nothing here", so they stay neutral in every candidate
// except the current one, where they are already indigo
const neutralDotsLight = {
  dotBg: 'rgba(120, 120, 120, 0.1)',
  dot: 'rgba(0, 0, 0, 0.25)',
  dotHoverBg: 'rgba(120, 120, 120, 0.2)',
  dotHover: 'rgba(0, 0, 0, 0.5)'
}

const neutralDotsDark = {
  dotBg: 'rgba(160, 160, 160, 0.1)',
  dot: 'rgba(255, 255, 255, 0.2)',
  dotHoverBg: 'rgba(160, 160, 160, 0.2)',
  dotHover: 'rgba(255, 255, 255, 0.5)'
}

export const PALETTES = [
  {
    id: 'classic',
    name: 'Red / green — current',
    note: 'Familiar, but encodes a value judgment and is the worst pair for colour blindness.',
    light: {
      removedBg: 'rgba(255, 74, 74, 0.2)', removedText: '#cc0000',
      addedBg: 'rgba(66, 184, 131, 0.2)', addedText: '#006b3c',
      dotBg: 'rgba(100, 108, 255, 0.1)', dot: 'rgba(0, 0, 0, 0.25)',
      dotHoverBg: 'rgba(100, 108, 255, 0.22)', dotHover: 'rgba(0, 0, 0, 0.5)'
    },
    dark: {
      removedBg: 'rgba(255, 74, 74, 0.3)', removedText: '#ffb3b3',
      addedBg: 'rgba(66, 184, 131, 0.3)', addedText: '#a2f5c9',
      dotBg: 'rgba(100, 108, 255, 0.1)', dot: 'rgba(255, 255, 255, 0.2)',
      dotHoverBg: 'rgba(100, 108, 255, 0.28)', dotHover: 'rgba(255, 255, 255, 0.5)'
    }
  },
  {
    id: 'amber-blue',
    name: 'Amber / blue',
    note: 'The colour-blind-safe standard. Competes with the indigo in the logo.',
    light: {
      removedBg: 'rgba(186, 117, 23, 0.2)', removedText: '#854f0b',
      addedBg: 'rgba(55, 138, 221, 0.18)', addedText: '#185fa5',
      ...neutralDotsLight
    },
    dark: {
      removedBg: 'rgba(239, 159, 39, 0.26)', removedText: '#fac775',
      addedBg: 'rgba(133, 183, 235, 0.26)', addedText: '#b5d4f4',
      ...neutralDotsDark
    }
  },
  {
    id: 'purple-teal',
    name: 'Purple / teal',
    note: 'No cultural valence either way, and no clash with the existing blues.',
    light: {
      removedBg: 'rgba(127, 119, 221, 0.2)', removedText: '#534ab7',
      addedBg: 'rgba(29, 158, 117, 0.18)', addedText: '#0f6e56',
      ...neutralDotsLight
    },
    dark: {
      removedBg: 'rgba(175, 169, 236, 0.26)', removedText: '#cecbf6',
      addedBg: 'rgba(93, 202, 165, 0.26)', addedText: '#9fe1cb',
      ...neutralDotsDark
    }
  },
  {
    id: 'grey-indigo',
    name: 'Grey / indigo',
    note: 'Only the modified side is coloured. Quietest, but implies one panel matters more.',
    light: {
      removedBg: 'rgba(136, 135, 128, 0.22)', removedText: '#5f5e5a',
      addedBg: 'rgba(127, 119, 221, 0.2)', addedText: '#534ab7',
      ...neutralDotsLight
    },
    dark: {
      removedBg: 'rgba(180, 178, 169, 0.2)', removedText: '#d3d1c7',
      addedBg: 'rgba(175, 169, 236, 0.26)', addedText: '#cecbf6',
      ...neutralDotsDark
    }
  },
  {
    id: 'mono',
    name: 'Monochrome',
    note: 'Strikethrough and underline carry the meaning. Survives greyscale printing.',
    light: {
      removedBg: 'rgba(136, 135, 128, 0.16)', removedText: '#5f5e5a',
      addedBg: 'rgba(136, 135, 128, 0.26)', addedText: '#2c2c2a',
      ...neutralDotsLight
    },
    dark: {
      removedBg: 'rgba(180, 178, 169, 0.14)', removedText: '#b4b2a9',
      addedBg: 'rgba(180, 178, 169, 0.24)', addedText: '#f1efe8',
      ...neutralDotsDark
    }
  }
]

const VAR_NAMES = {
  removedBg: '--diff-removed-bg',
  removedText: '--diff-removed-text',
  addedBg: '--diff-added-bg',
  addedText: '--diff-added-text',
  dotBg: '--diff-dotted-bg',
  dot: '--diff-dotted-dot',
  dotHoverBg: '--diff-dotted-hover-bg',
  dotHover: '--diff-dotted-hover-dot'
}

const block = (selector, values) =>
  selector + '{' +
  Object.entries(values).map(([key, value]) => `${VAR_NAMES[key]}:${value}`).join(';') +
  '}'

export function useAdminPanel() {
  const isAdminOpen = ref(false)
  const paletteId = ref(localStorage.getItem('palette') || 'classic')

  // A style tag appended to head beats style.css on document order alone, so
  // both themes can be redefined without knowing which one is active
  const applyPalette = (id) => {
    const palette = PALETTES.find((p) => p.id === id) || PALETTES[0]

    let tag = document.getElementById('palette-override')
    if (!tag) {
      tag = document.createElement('style')
      tag.id = 'palette-override'
      document.head.appendChild(tag)
    }

    tag.textContent =
      block(':root', palette.light) +
      block(':root[data-theme="dark"]', palette.dark)

    // Monochrome needs rules, not just values
    document.documentElement.setAttribute('data-palette', palette.id)
  }

  watch(paletteId, (id) => {
    localStorage.setItem('palette', id)
    applyPalette(id)
  })

  // Applied during setup rather than on mount, so there is no flash of red
  applyPalette(paletteId.value)

  return { isAdminOpen, paletteId, applyPalette }
}