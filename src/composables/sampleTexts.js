// TEMPORARY test fixtures for the admin panel.

export const SAMPLE_TEXTS = [
  {
    id: 'robot',
    name: 'Prose — heavy rewrite',
    left: `In the heart of a bustling, neon-lit city lived a small, silver robot named Byte. Byte was specifically programmed to organize the massive, labyrinthine library of the Grand Archivist. Every morning, precisely at dawn, Byte would roll through the towering aisles. It scanned dusty spines, aligned the ancient leather tomes, and ensured every single book was in its perfect, mathematically calculated place. The library was always silent, save for the gentle whir of Byte's internal cooling fan and the soft clicking of its metallic treads.

One Tuesday, while cataloging a forgotten section on celestial mechanics, Byte discovered a book that did not possess a barcode. This was highly unusual. The book was bound in deep crimson velvet and smelled faintly of ozone. Byte's optical sensors flared blue as it attempted to scan the cover, but the system returned a glaring "Error 404: Entity Not Found" message. It was a simple life before this moment, but Byte suddenly felt a strange sensation in its logic circuits. It carefully placed the anomaly into its secure storage compartment and decided to investigate further after the daily maintenance cycle.

That night, when the lanterns had dimmed and the Archivist had retired to the upper floors, Byte opened the book for the first time. The pages were blank. Byte turned them one by one, slowly at first and then rapidly, searching for a single mark, a watermark, a printer's signature, anything at all. There was nothing. The paper was heavy and slightly warm, as though it had recently been held. Byte ran a spectral analysis and found traces of an ink that had no entry in any database it could reach.

By the fourth hour of the night cycle, Byte had filled seventeen diagnostic logs with observations and had reached no conclusion whatsoever. It considered reporting the object to the Archivist in the morning, as protocol clearly required. Instead, for reasons it could not name and did not attempt to justify, it returned the book to its compartment, closed the panel, and resumed its rounds as though nothing had happened at all.`,
    right: `In the center of a very bustling, neon-lit metropolis lived a tiny, silver robot named Byte. Byte was explicitly programmed to carefully organize the infinite, labyrinthine library of the Grand Archivist. Every morning, right at sunrise, Byte would roll through the long, towering aisles. It scanned old spines, aligned the fragile leather tomes, and made sure every book was in its proper place. The library was completely peaceful, save for the soft hum of Byte's motor and the clicking of its treads.

One Thursday, while cataloging a restricted section on quantum mechanics, Byte discovered a strange volume that did not have a standard barcode. This was unprecedented. The book was bound in dark purple velvet and smelled strongly of ozone and old paper. Byte's optical sensors flashed red as it tried to analyze the cover, but the main database returned a blinking "Error: Unregistered Artifact" warning. It was a predictable existence before this incident, but Byte suddenly experienced an unexpected anomaly in its processing core. It securely locked the strange book into its hidden compartment and resolved to analyze it in secret before the nightly reboot.

That night, once the lanterns had gone out and the Archivist had withdrawn to the upper floors, Byte opened the volume for the first time. Every page was empty. Byte turned them one after another, carefully at first and then frantically, hunting for a single mark, a watermark, a binder's signature, anything whatsoever. There was nothing there. The paper felt heavy and faintly warm, as if someone had been holding it moments earlier. Byte performed a spectral analysis and detected traces of an ink with no entry in any archive it could query.

By the fourth hour of the night cycle, Byte had filled twenty-three diagnostic logs with observations and had arrived at no conclusion at all. It weighed reporting the object to the Archivist at sunrise, exactly as protocol demanded. Instead, for reasons it could not articulate and made no attempt to justify, it slid the volume back into its compartment, sealed the panel, and continued its rounds as though nothing whatsoever had occurred.`
  },
  {
    id: 'grouping',
    name: 'Grouping — one word to many',
    left: `The solution was clever and the team was happy.
She ran quickly to the door and knocked twice.
The colour of the config file was wrong.
He was sad about the result of the vote.
The meeting was short but the agenda was long.
They finished the work early on Friday afternoon.
The new feature is fast and the users like it.
We should buy a car before the winter arrives.
The report was unclear about the second finding.
It began to rain so we went inside the cafe.
The old bridge was closed for repairs last year.
Her answer surprised everyone in the room.`,
    right: `The solution was very smart indeed and the team was happy.
She sprinted to the door and knocked twice.
The colour of the configuration file was wrong.
He was deeply disappointed about the outcome of the vote.
The meeting was brief but the agenda was extremely long.
They completed the work ahead of schedule on Friday afternoon.
The new feature is remarkably quick and the users like it.
We should purchase a vehicle before the winter arrives.
The report was ambiguous about the second finding.
It started to pour so we retreated inside the cafe.
The ancient stone bridge was shut for repairs last year.
Her response astonished absolutely everyone in the room.`
  },
  {
    id: 'typos',
    name: 'Typos — single characters',
    left: `Recieve the paramter and seperate the vaules.
The algorithm is defintely correct.
Please chekc the lenght of the recieved array.
This functoin returns an inteter, not a sting.
The databse connection was not sucessful.
We need to seperate the enviroment variables.
The occurence of this error is intermitent.
Make sure the indentaion is consistant.
The documnetation mentions a diferent default.
Accomodate the aditional paramters in the schema.`,
    right: `Receive the parameter and separate the values.
The algorithm is definitely correct.
Please check the length of the received array.
This function returns an integer, not a string.
The database connection was not successful.
We need to separate the environment variables.
The occurrence of this error is intermittent.
Make sure the indentation is consistent.
The documentation mentions a different default.
Accommodate the additional parameters in the schema.`
  },
  {
    id: 'insert-delete',
    name: 'Pure insertions and deletions',
    left: `First line stays exactly as it is.
This whole line disappears without a trace.
This one also disappears, right after it.
A line in the middle that stays put.
Another paragraph that survives the edit unchanged.

This entire block is removed from the document.
It spans two lines and neither one survives.

The closing section remains identical.
Last line stays.`,
    right: `First line stays exactly as it is.
A line in the middle that stays put.
A brand new line arrives here, in the middle.
Another paragraph that survives the edit unchanged.

The closing section remains identical.
Last line stays.
A brand new line arrives at the end.
And then a second new line after that one.`
  },
  {
    id: 'identical',
    name: 'Identical — no changes',
    left: `Nothing has changed between these two panels.
Both sides are exactly the same, word for word.

This fixture exists to confirm that a document with no
differences renders as plain text, that the patch export
reports nothing to export, and that hovering does not
offer a change where none exists.

The final line is also identical.`,
    right: `Nothing has changed between these two panels.
Both sides are exactly the same, word for word.

This fixture exists to confirm that a document with no
differences renders as plain text, that the patch export
reports nothing to export, and that hovering does not
offer a change where none exists.

The final line is also identical.`
  },
  {
    id: 'latex',
    name: 'LaTeX — paper review',
    left: `\\section{Overall Response} All three reviewers independently describe the central idea as novel, fresh, interesting, or clever. We consider this convergence particularly important because the primary goal of this paper is not to report a marginal gain.

\\subsection{On the Evaluation} Reviewer 2 notes that our evaluation covers only three datasets. We agree that this is a limitation. However, we would point out that each dataset was selected to represent a distinct regime, and that adding a fourth similar dataset would not meaningfully strengthen the argument.

\\subsection{On Reproducibility} We have released the full source code, the preprocessing scripts, and the exact random seeds used for every reported run. The supplementary material contains a single command that reproduces every table in the paper.

\\paragraph{Minor corrections.} We have fixed the inconsistent notation in Section 3, corrected the typo in Equation 7, and added the missing citation noted by Reviewer 1.`,
    right: `\\section{Overall Response} All three reviewers independently describe the central idea as novel, fresh, interesting, or very smart. We consider this convergence especially important because the main goal of this paper is not to report a marginal improvement.

\\subsection{On the Evaluation} Reviewer 2 observes that our evaluation spans only three datasets. We concede that this is a genuine limitation. We would note, however, that every dataset was chosen to represent a distinct regime, and that including a fourth comparable dataset would not substantially strengthen the argument.

\\subsection{On Reproducibility} We have published the complete source code, the preprocessing scripts, and the precise random seeds used for each reported run. The supplementary material now includes a single command that regenerates every table and figure in the paper.

\\paragraph{Minor corrections.} We have corrected the inconsistent notation in Section 3, fixed the typo in Equation 7, and added the missing citation identified by Reviewer 1.`
  },
  {
    id: 'long',
    name: 'Long document — over a page',
    left: `Remote Work Policy

1. Purpose

This document sets out the conditions under which employees of Northwind Analytics may carry out their duties from a location other than a company office. It replaces the interim guidance circulated in March and applies to all permanent staff, regardless of department or seniority.

2. Eligibility

Any employee who has completed their probationary period is eligible to request remote work. Requests should be made to the employee's direct manager, who will consider the nature of the role, the employee's recent performance, and the needs of the wider team. A decision will normally be given within ten working days.

Employees still within their probationary period may work remotely on an occasional basis, but should expect to spend the majority of their time in the office so that they can be properly supported during the early weeks.

3. Working Hours

Core hours are from 10:00 to 16:00 in the employee's local time zone. Staff are expected to be reachable during this window. Outside of core hours, employees may arrange their working day as they see fit, provided their contracted hours are met and their commitments to colleagues are honoured.

Managers should avoid scheduling meetings outside core hours unless there is a clear reason to do so. Where a team spans several time zones, the burden of inconvenient meeting times should be shared fairly rather than always falling on the same people.

4. Equipment and Expenses

The company will supply a laptop and, on request, a monitor, keyboard and mouse for home use. Employees are responsible for providing a suitable desk and chair, although a one-off contribution towards furniture may be claimed in the first year of remote working.

Internet costs are not reimbursed. Mobile phone costs are reimbursed only where a company number is in use. All equipment remains the property of the company and must be returned when employment ends.

5. Information Security

Company data must not be stored on personal devices. Employees working remotely must use the company VPN when accessing internal systems, and must ensure that their home network is protected by a password. Screens should be locked whenever the employee steps away, including at home.

Working from public spaces such as cafes, libraries and airports is permitted, but employees should take reasonable care that confidential material is not visible to others, and should avoid joining calls where sensitive matters will be discussed.

6. Working from Abroad

Employees may work from another country for up to twenty working days per calendar year. Longer arrangements require approval from both the employee's manager and the people team, as they may carry tax and immigration consequences for the company as well as the individual.

Notice of at least three weeks should be given before any period of work abroad, together with the dates and the country concerned.

7. Review

This policy will be reviewed annually. Suggestions for amendment may be sent to the people team at any time and will be considered at the next review.`,
    right: `Remote Work Policy

1. Purpose

This document establishes the conditions under which employees of Northwind Analytics may perform their duties from a location other than a company office. It supersedes the interim guidance circulated in March and applies to all permanent staff, irrespective of department or seniority.

2. Eligibility

Any employee who has finished their probationary period may request remote work. Requests should be submitted to the employee's direct manager, who will take into account the nature of the role, the employee's recent performance, and the needs of the wider team. A decision will ordinarily be provided within five working days.

Employees still within their probationary period may work remotely on an occasional basis, but should expect to spend most of their time in the office so that they can be properly supported during the early weeks.

3. Working Hours

Core hours run from 10:00 to 15:00 in the employee's local time zone. Staff are expected to be contactable during this window. Outside core hours, employees may organise their working day as they prefer, provided their contracted hours are met and their commitments to colleagues are honoured.

Managers should refrain from scheduling meetings outside core hours unless there is a compelling reason to do so. Where a team spans several time zones, the burden of awkward meeting times should be distributed fairly rather than falling repeatedly on the same people.

4. Equipment and Expenses

The company will provide a laptop and, on request, a monitor, keyboard and mouse for home use. Employees are responsible for supplying a suitable desk and chair, although a one-off contribution towards furniture may be claimed in the first year of remote working.

Internet costs are not reimbursed. Mobile phone costs are reimbursed only where a company number is in use. All equipment remains company property and must be returned when employment ends.

5. Information Security

Company data must never be stored on personal devices. Employees working remotely must use the company VPN when accessing internal systems, and must ensure that their home network is secured with a strong password. Screens should be locked whenever the employee steps away, including at home.

Working from public spaces such as cafes, libraries and airports is permitted, but employees should take reasonable care that confidential material is not visible to others, and should avoid joining calls on which sensitive matters will be discussed.

6. Working from Abroad

Employees may work from another country for up to thirty working days per calendar year. Longer arrangements need approval from both the employee's manager and the people team, since they may carry tax and immigration consequences for the company as well as the individual.

Notice of at least four weeks should be given before any period of work abroad, together with the dates and the country concerned.

7. Review

This policy will be reviewed annually. Proposals for amendment may be sent to the people team at any time and will be considered at the next review.`
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