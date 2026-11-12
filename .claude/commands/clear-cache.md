---
description: Forget cached postings not seen for a set number of days, and set that number
argument-hint: [days]
---

Days: $ARGUMENTS

The setting is the "Forget seen postings after (days)" line in `me/preferences.md`. The cache is `me/cache.json`; it remembers every posting `/search` has come across so the same job is not scored twice.

1. With a number: it must be a whole number from 1 to 365, otherwise say so and change nothing. Save it as the new setting.
2. With no number: use the saved setting.
3. Run `node tools/cache.mjs purge <days>`.
4. Reply with the setting (old and new, if it changed) and how many postings were removed and kept.

This never touches `me/tracker.csv`. A forgotten posting that is still open can be found and scored again, unless its URL is still in the tracker.
