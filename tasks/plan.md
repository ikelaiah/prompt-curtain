# PromptCurtain feature roadmap

Date: 2026-10-03
Status: Reliability release tasks 1-3 implemented locally; automated checks and benchmark have not yet been run. Project license remains undecided.

## Direction

Make PromptCurtain a dependable, inspectable tool for preparing private AI prompts and restoring matching details in replies. Focus first on IT support, education and payroll workflows already represented by the examples. Preserve the downloadable, offline HTML app and its Markdown workflow.

Local detection and reversible placeholders are established approaches, not sufficient differentiation by themselves. Emphasize explicit user control, understandable review, predictable restoration, and published evidence of limitations.

## Architecture and product constraints

- Keep processing local with no runtime external scripts, telemetry or model downloads in the default app.
- Keep prompts and mappings in memory by default. Do not introduce automatic browser persistence.
- Keep Markdown source authoritative for transformation and copying; previews are presentation only.
- Never describe successful detection as proof that a prompt is safe or fully anonymous.
- Treat credentials separately from reversible personal details: block restoration of detected secrets by default.
- Keep the single-file release. If maintainability requires source modules later, generate and test a downloadable HTML release before changing the development structure.

## Phase 1: Trustworthy protection

### Task 1: Publish a reproducible baseline

Description: Add a synthetic evaluation corpus covering existing entity categories, false positives, Markdown and restoration. Run the existing tests in CI and publish coverage, measured detection results and known misses. Add an explicit project license after the maintainer chooses one; the bundled parser's MIT license does not license the whole project.

Acceptance criteria:
- Each fixture labels expected sensitive spans; evaluation reports precision and recall per category separately from restoration correctness.
- CI runs `node --test tests/*.test.cjs` and reports failures; fixtures contain fictional details only.
- README explains the threat boundary, limitations and how to reproduce the results; project licensing is explicit before a public release.

Verification: Run the corpus evaluator and existing tests; compare summary counts to a hand-checked fixture subset. Add the existing browser test to CI as a follow-up once portable Chrome startup is available.

Dependencies: None. Maintainer license choice is needed only for the license portion.

Likely files: synthetic fixtures, evaluation script, CI workflow, README; LICENSE after a decision.

Scope: Medium. Checkpoint: Record the baseline before adding detectors.

### Task 2: Manually protect a selected span

Description: Let users select text in the source editor and choose Protect selection. Assign a category or custom label and show it in detection review. Preserve exact source positions rather than relying on repeated phrase matching. Keep the existing custom phrase mechanism for protecting all occurrences.

Acceptance criteria:
- Users can mask a missed name, organization or identifier without changing surrounding Markdown.
- Manual selections appear in review and can be removed; overlapping detections produce one replacement with a documented precedence rule.
- Edits invalidate stale span selections visibly, and copying/restoration use only valid current selections.

Verification: Unit cases for overlaps, repeated phrases, Unicode positions and edits; browser test selecting text through keyboard interaction, copying and restoring it.

Dependencies: Task 1 baseline.

Likely files: index.html, tests/redaction.test.cjs, tests/browser.cjs, README.

Scope: Medium.

### Task 3: Protect credentials and secrets

Description: Add detectors for private-key blocks, Bearer authorization values and credentials assigned to explicit password/token/API-key fields. Expand to vendor token formats only with documented patterns and synthetic tests. Show detection reasons and offer explicit false-positive review.

Acceptance criteria:
- Known-shaped credentials and multiline private keys are fully masked, including in code blocks and URLs where supported.
- Secret values are excluded from reply restoration mappings and stay masked in both Mask and Redact modes.
- Ordinary identifiers and code examples have negative fixtures; no entropy-only detector silently labels every long string as a secret.

Verification: Unit tests for positives, negatives, overlaps and non-restoration; browser round trip with a fictional credential.

Dependencies: Task 1; integrate with Task 2 review controls.

Likely files: index.html, tests/redaction.test.cjs, synthetic fixtures, README.

Scope: Medium. Checkpoint: Rerun baseline and review false positives before release.

## Phase 2: Better real-world detection

### Task 4: Handle Markdown and structured context in detection

Description: Recognize names and identifiers after formatted field labels such as `**Name:** Alex Morgan`, Markdown table headers and supported JSON keys. Add targeted handling for email addresses inside link destinations and paths containing spaces. Detection must retain source offsets so rendering never becomes the transformation input.

Acceptance criteria:
- Formatted labels and representative Markdown tables detect the same fictional personal details as equivalent plain text.
- Link labels and destinations are reviewed separately; Markdown syntax outside sensitive spans is retained in copied source.
- Code fences, escaped placeholders, quoted paths and restoration have regression fixtures; unsupported formats remain documented.

Verification: Unit tests asserting exact protected and restored Markdown; browser preview and clipboard tests.

Dependencies: Tasks 1-3.

Likely files: index.html, tests/redaction.test.cjs, tests/markdown.test.cjs, synthetic fixtures, README.

Scope: Medium.

### Task 5: Add reusable protection profiles

Description: Promote the existing workday examples into IT support, education and payroll protection profiles. Profiles configure categories and labelled custom rules without containing prompts or original sensitive values. Support importing/exporting a versioned profile JSON file. Locale-specific identifiers are later additions, chosen from user demand and tested against authoritative format specifications.

Acceptance criteria:
- Applying a profile displays its active categories and custom rules before copying.
- Imported profiles are schema-validated with rule count and length limits; first version uses literal rules rather than arbitrary user regex.
- Profile export contains configuration only, with no source text, replies, mapping values or secrets.

Verification: Unit tests for import validation and exports; browser test switching profiles and reviewing changed detections.

Dependencies: Task 4; use the review controls from Tasks 2-3.

Likely files: index.html, profile tests, tests/browser.cjs, README.

Scope: Medium. Checkpoint: Run IT, education and payroll examples end to end and publish updated evaluation results.

## Phase 3: A dependable daily workflow

### Task 6: Separate multiple prompt/reply sessions

Description: Add an explicit, opt-in session list held in page memory so users can handle more than one prompt without mixing mappings. Each session owns its source, protected snapshot, reply and restoration map. A copied prompt identifies the session and mapping version used for restoration.

Acceptance criteria:
- Two sessions using the same placeholder label restore only their own originals.
- Editing a source after copying clearly distinguishes current content from the last copied snapshot.
- Deleting a session removes its data; Clear all removes every session; reloading retains none.

Verification: Unit tests for session isolation and version transitions; browser test copying two prompts and restoring their replies in the correct sessions.

Dependencies: Tasks 2-5; session isolation must precede any future mapping import/export.

Likely files: index.html, session tests, tests/browser.cjs, README.

Scope: Medium.

### Task 7: Import and export text and Markdown

Description: Add local `.txt` and `.md` import and download buttons for protected prompts and restored replies. Treat import as a session action. Keep original files in memory only and preserve the explicit choice between protected and restored output.

Acceptance criteria:
- Supported files import locally with a size limit, clear encoding behavior and understandable errors.
- Downloads preserve Markdown source and use a neutral filename rather than a potentially sensitive original name.
- Protected exports contain no original mapping; restored exports explicitly identify that they contain restored details.

Verification: Browser tests for file import and downloaded bytes, including Unicode and Markdown; zero external requests throughout.

Dependencies: Task 6.

Likely files: index.html, tests/browser.cjs, README.

Scope: Medium.

## Release sequence

1. Reliability release: baseline, manual span protection and credential masking.
2. Detection release: Markdown-aware context and reusable profiles.
3. Workflow release: isolated in-memory sessions and text/Markdown files.

At each checkpoint, run unit and browser tests, inspect light/dark and mobile layouts, verify clipboard source, and rerun the synthetic evaluation. Publish changed limitations with each release. Release packaging should include the standalone HTML, a short walkthrough and screenshots.

## Deferred experiments

- Optional local named-entity model: assess measured recall gains, download size, browser support and offline packaging before adoption.
- Browser extension: validate demand first; it adds permissions and maintenance across changing third-party interfaces.
- PDF/DOCX support: text extraction and actual document redaction require separate verification; exporting a visual overlay is not sufficient redaction.
- Encrypted mapping backup: useful for restoring after closing a page, but depends on session/version design, secure key handling and a clear restore workflow.
- Multilingual and locale packs: prioritize demonstrated demand, with separate per-language and per-category evaluation.

## Risks and decisions

| Risk | Response |
| --- | --- |
| False confidence from a clean preview | Describe detections and unresolved items; avoid an unsupported safety score. |
| Wrong originals restored across prompts | Isolate session maps and bind replies to explicit copied snapshots. |
| Credentials reappear in restored replies | Make secret replacements non-restorable by default. |
| More detectors create false positives | Compare category metrics and maintain negative fixtures. |
| New storage weakens privacy expectations | Keep memory-only defaults; separately design any optional backup. |
| Feature growth obscures the simple workflow | Keep four panels as the main interaction and test the downloadable artifact. |

Open decisions: project license; which locale pack users need first; whether demand justifies an extension or local model. These do not prevent starting the synthetic baseline and manual protection work.

## Research context

- Presidio documents entity detection, anonymization and customization: https://microsoft.github.io/presidio/text_anonymization/
- DocCloak describes local document anonymization and reply restoration: https://github.com/WLojek/DocCloak
- Redactkit describes local redaction and restoration plus integration options: https://github.com/pras-ops/redactkit

These references inform positioning; proposed PromptCurtain behavior above is a product recommendation, not a claim of feature uniqueness or comparative detection quality.
