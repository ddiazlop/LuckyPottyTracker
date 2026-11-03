---
name: next-iter
description: >-
  Resumes spec-driven work from the SPEC.md at the repo root by picking up the current in-progress iteration or starting the next pending one, then stopping for review. Use when the user says to continue the spec, do the next iteration, or resume the plan.
---

# Next Iteration

This skill is the entry point for the global `agile-spec` skill. Load `agile-spec` first and obey its rules; this file only decides which row to work on and when to stop.

Invoking this skill is the explicit instruction `agile-spec` rule 4 requires, so the picked row may be set to 🔄 without a second confirmation.

## Procedure

1. **Read `SPEC.md` at the repo root.** If it does not exist, stop and report that there is no active spec, offering to start one with `agile-spec`.
2. **Pick exactly one row**, in this priority order:
   - The row already at 🔄 — resume it, do not restart or re-scope it.
   - Otherwise the lowest-numbered row at ⬜ — this is the next iteration.
   - If neither exists, every row is ✅ or ❌: delete `SPEC.md` (rule 9), then report the effort as finished.
3. **State the row back to the user** in one or two lines: number, iteration, and `Done when`. Then set that row to 🔄 and set the file header to `State: 🔄 in progress`.
4. **Do the work for that row only.** Read the surrounding code first, keep changes inside the row's scope, and rewrite the row in place if the plan changes. Anything not covered by the row becomes a proposed new row at the end of the table — never a silent scope expansion.
5. **Prove `Done when` before closing.** Run the commands the row names (`npm run lint`, `npm run build`, tests, a device check). If a criterion can only be verified on hardware or by the user, stop and ask instead of guessing.
6. **Close or report:**
   - Criteria met → set the row to ✅, then stop. Do not start the following row.
   - Criteria not met → leave the row at 🔄, describe the exact gap and what is left, then stop.
   - Row became unnecessary → set it to ❌ with a one-line reason, then stop.

## Boundaries

- One iteration per invocation.
- Never edit ✅ or ❌ rows, never renumber, never delete a row.
- Never mark a row ✅ without evidence from step 5.
- Never commit; follow the repository commit policy and only commit when asked, using the `commit` skill.
- Keep `SPEC.md` as the only artifact: no changelogs, checklists, or progress notes elsewhere.
