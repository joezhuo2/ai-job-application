---
description: Find new job postings, score them, and queue the ones above your score cutoff
argument-hint: [extra keywords]
---

Extra keywords: $ARGUMENTS

1. Read `me/preferences.md`. If target roles or locations are empty, ask the user for them, save the answer there, then continue.
2. Collect postings from both sources:
   - `node tools/fetch-jobs.mjs --title "<title regex>" --location "<location regex>"`, using the regexes in `me/preferences.md`.
   - Web search: three to five queries built from the target roles, locations and any extra keywords. Keep only results that are a single job posting on an employer or applicant-tracking site.
3. Drop every posting whose URL is already in `me/tracker.csv`.
4. Take at most 15 of the rest, newest first. Fetch each posting's text and score it with the "Fit score" rubric in `CLAUDE.md`. A posting that cannot be fetched is listed as "could not read" and gets no row.
5. Append one row per scored posting to `me/tracker.csv`: status `found` at or above the score cutoff, `skipped` below it.
6. Show one table sorted by score: score, company, role, location, round-1 odds, biggest gap, URL. Say how many postings were left unscored.
7. If any are at or above the score cutoff, offer to run `/apply` on them.
