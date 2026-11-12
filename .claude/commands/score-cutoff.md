---
description: Set or show the minimum fit score a job needs before /apply will prepare it
argument-hint: [number 0-100]
---

New score cutoff: $ARGUMENTS

1. With no number, reply with the current "Score cutoff" from `me/preferences.md` and stop.
2. The number must be a whole number from 0 to 100. Otherwise say so and change nothing.
3. Set the "Score cutoff" line in `me/preferences.md` to it.
4. Re-mark rows in `me/tracker.csv`: `skipped` rows now at or above the cutoff become `found`, and `found` rows now below it become `skipped`. Leave every other status alone.
5. Reply with the old and new values and how many rows changed.
