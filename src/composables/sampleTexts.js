// TEMPORARY test fixtures for the admin panel.

export const SAMPLE_TEXTS = [
  {
    id: 'robot',
    name: 'Prose — heavy rewrite',
    left: `In the heart of a bustling, neon-lit city lived a small, silver robot named Byte. Byte was specifically programmed to organize the massive, labyrinthine library of the Grand Archivist. Every morning, precisely at dawn, Byte would roll through the towering aisles. It scanned dusty spines, aligned the ancient leather tomes, and ensured every single book was in its perfect, mathematically calculated place. The library was always silent, save for the gentle whir of Byte's internal cooling fan and the soft clicking of its metallic treads.

One Tuesday, while cataloging a forgotten section on celestial mechanics, Byte discovered a book that did not possess a barcode. This was highly unusual. The book was bound in deep crimson velvet and smelled faintly of ozone. Byte's optical sensors flared blue as it attempted to scan the cover, but the system returned a glaring "Error 404: Entity Not Found" message. It was a simple life before this moment, but Byte suddenly felt a strange sensation in its logic circuits. It carefully placed the anomaly into its secure storage compartment and decided to investigate further after the daily maintenance cycle.`,
    right: `In the center of a very bustling, neon-lit metropolis lived a tiny, silver robot named Byte. Byte was explicitly programmed to carefully organize the infinite, labyrinthine library of the Grand Archivist. Every morning, right at sunrise, Byte would roll through the long, towering aisles. It scanned old spines, aligned the fragile leather tomes, and made sure every book was in its proper place. The library was completely peaceful, save for the soft hum of Byte's motor and the clicking of its treads.

One Thursday, while cataloging a restricted section on quantum mechanics, Byte discovered a strange volume that did not have a standard barcode. This was unprecedented. The book was bound in dark purple velvet and smelled strongly of ozone and old paper. Byte's optical sensors flashed red as it tried to analyze the cover, but the main database returned a blinking "Error: Unregistered Artifact" warning. It was a predictable existence before this incident, but Byte suddenly experienced an unexpected anomaly in its processing core. It securely locked the strange book into its hidden compartment and resolved to analyze it in secret before the nightly reboot.`
  },
  {
    id: 'grouping',
    name: 'Grouping — one word to many',
    left: `The solution was clever and the team was happy.
She ran quickly to the door.
The colour of the config file was wrong.`,
    right: `The solution was very smart indeed and the team was happy.
She sprinted to the door.
The colour of the configuration file was wrong.`
  },
  {
    id: 'typos',
    name: 'Typos — single characters',
    left: `Recieve the paramter and seperate the vaules.
The algorithm is defintely correct.`,
    right: `Receive the parameter and separate the values.
The algorithm is definitely correct.`
  },
  {
    id: 'insert-delete',
    name: 'Pure insertions and deletions',
    left: `First line stays.
This whole line disappears.
Last line stays.`,
    right: `First line stays.
Last line stays.
A brand new line arrives at the end.`
  },
  {
    id: 'identical',
    name: 'Identical — no changes',
    left: `Nothing has changed between these two panels.
Both sides are exactly the same.`,
    right: `Nothing has changed between these two panels.
Both sides are exactly the same.`
  },
  {
    id: 'latex',
    name: 'LaTeX — paper review',
    left: `\\section{Overall Response} All three reviewers independently describe the central idea as novel, fresh, interesting, or clever. We consider this convergence particularly important because the primary goal of this paper is not to report a marginal gain.`,
    right: `\\section{Overall Response} All three reviewers independently describe the central idea as novel, fresh, interesting, or very smart. We consider this convergence especially important because the main goal of this paper is not to report a marginal improvement.`
  },
  {
    id: 'invoice',
    name: 'Invoice check',
    left: `Faktúra č. 2026218

Dodávateľ: Hladký Legal s.r.o.
advokátska kancelária
Kutlíkova 17
Bratislava - mestská časť
Petržalka 851 02
IČO: 52 484 840
DIČ: 2121052131
Bankové spojenie:
Fio banka, a.s., pobočka
zahraničnej banky, IBAN:
SK5083300000002102831541
Registrácia: Obchodný
register, vedený Mestským
súdom Bratislava III, oddiel
Sro, vložka č. 138423/B

Konštantný symbol: 0308
Variabilný symbol: 2026218
Deň vystavenia: 27.10.2026
Deň splatnosti: 10.11.2026

Nie sme platcom DPH

Odberateľ: CMP Solutions s. r. o.
Južná trieda 1555/19
Košice - mestská časť Juh
040 01
IČO: 57 968 071
Registrácia: Obchodný
register, vedený Mestským
súdom Košice, oddiel Sro,
vložka č. 67908/V

V súlade s § 24 ods. 3 zákona o advokácii Vám fakturujem zmluvnú odmenu
advokáta za poskytnuté právne služby, spočívajúce v príprave dokumentácie
k založeniu spoločnosti, komunikácii s notárskym úradom, podaní návrhu na zápis
zmien o spoločnosti do obchodného registra prostredníctvom notára a zastupovaní
v konaní,
spolu vo výške 150,- EUR

Hladký Legal s.r.o.
JUDr. Juraj Hladký
advokát a konateľ`,
    right: `Faktúra č. 2026218

Dodávateľ: Hladký Legal s.r.o.
advokátska kancelária
Kutlíkova 17
Bratislava - mestská časť
Petržalka 851 02
IČO: 52 484 850
DIČ: 2121052131
Bankové spojenie:
Fio banka, a.s., pobočka
zahraničnej banky, IBAN:
SK5083300000002102831541
Registrácia: Obchodný
register, vedený Mestským
súdom Bratislava III, oddiel
Sro, vložka č. 138423/B

Konštantný symbol: 0308
Variabilný symbol: 2026218
Deň vystavenia: 27.10.2026
Deň splatnosti: 10.11.2026

Nie sme platcom DPH

Odberateľ: CMP Solutions s. r. o.
Južná trieda 1555/29
Košice - mestská časť Juh
040 01
IČO: 57 969 071
Registrácia: Obchodný
register, vedený Mestským
súdom Košice, oddiel Sro,
vložka č. 67908/V

V súlade s § 24 ods. 3 zákona o advokácii Vám fakturujem zmluvnú odmenu
advokáta za poskytnuté právne služby, spočívajúce v príprave dokumentácie
k založeniu spoločnosti, komunikácii s notárskym úradom, podaní návrhu na zápis
zmien o spoločnosti do obchodného registra prostredníctvom notára a zastupovaní
v konaní,
spolu vo výške 165,- EUR

Hladký Legal s.r.o.
JUDr. Juraj Hladký
advokát a konateľ`
  }
]