# PromptCurtain roadmap checklist

Proposed work; see [plan.md](plan.md) for acceptance criteria, dependencies and verification.

## Reliability release

- [x] Task 1 implementation: Synthetic evaluation corpus, per-category baseline and unit-test CI. CI/baseline has not yet been run.
- [ ] Task 1 decision: Choose the project's license and add LICENSE.
- [x] Task 2 implementation: Protect a selected span with review, removal and stale-selection handling. Verification pending.
- [x] Task 3 implementation: Detect and fully mask supported credentials; exclude secrets from restoration. Verification pending.
- [ ] Checkpoint: Unit/browser checks pass; detection metrics and limitations are published.

## Detection release

- [ ] Task 4: Recognize formatted labels and supported structured context while preserving Markdown source offsets.
- [ ] Task 5: Add workday profiles with validated configuration import/export.
- [ ] Checkpoint: Review IT, education and payroll workflows and update the evaluation baseline.

## Workflow release

- [ ] Task 6: Isolate multiple opt-in, memory-only sessions and copied mapping versions.
- [ ] Task 7: Import/export local text and Markdown with neutral filenames and explicit output labels.
- [ ] Checkpoint: Verify session isolation, downloaded bytes, responsive layouts and zero external requests.

## Later decisions

- [ ] Gather user feedback to choose locale/language coverage.
- [ ] Evaluate an optional local entity model against the published baseline.
- [ ] Validate demand before browser-extension or document-format work.
- [ ] Design mapping backup separately from default memory-only sessions.
