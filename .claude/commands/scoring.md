---
description: Show or change how much each fit-score dimension counts
argument-hint: [dimension] [weight]
---

Requested: $ARGUMENTS

The weights are the "Scoring weights" lines in `me/preferences.md`. The dimensions are `skills`, `eligibility`, `evidence`, `logistics` and `interest`; accept any clear short form of those names. A missing line means the default from the "Fit score" table in `CLAUDE.md` (35, 25, 20, 10, 10).

1. With no arguments, show the five weights, their total, and each one's share of the total as a percentage, then stop.
2. With a dimension and a weight: the weight must be a number from 0 to 1000. Otherwise, or if the dimension is not one of the five, say so and change nothing.
3. Save the new weight. The weights do not have to add up to 100, but at least one must be above 0.
4. Reply with the old and new weight, the new total, and each dimension's new share.
5. Say that scores already in `me/tracker.csv` were worked out under the old weights and are not changed; offer to re-score the rows that are `found` or `skipped`.

`reset` as the only argument restores the five defaults.
