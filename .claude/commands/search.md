---
description: Search and score postings until a full batch clears your score cutoff
argument-hint: [extra keywords]
---

Extra keywords: $ARGUMENTS

"Batch size", "Score cutoff" and "Forget seen postings after (days)" come from `me/preferences.md`. The goal is "Batch size" qualified postings: rows in `me/tracker.csv` with status `found` and a score at or above the cutoff. Rows already `found` before this run count toward it.

## Setup

1. Read `me/preferences.md`. If target roles or locations are empty, ask the user for them, save the answer there, then continue.
2. Run `node tools/cache.mjs purge <days>` with the saved number of days.
3. If the tracker already holds a full batch of qualified postings, show them and stop.

## Each round

1. Collect postings as a JSON array of `{company, title, location, url, posted}`. `posted` is the date the posting went up, or `null` when the source does not say.
   - `node tools/fetch-jobs.mjs --title "<title regex>" --location "<location regex>"`, using the regexes in `me/preferences.md`. Run this once per run and reuse the result.
   - Web search: three to five queries built from the target roles, locations and any extra keywords. Use different queries each round (another target role, another city, another company type). Keep only results that are a single job posting on an employer or applicant-tracking site; list aggregator pages as leads for the user instead.
   - LinkedIn Jobs, only when "LinkedIn Jobs search" in `me/preferences.md` is on: open LinkedIn's job search in the browser for one target role and location per round. If it shows a sign-in page, ask the user to sign in and skip this source for the round. Read the results list and at most 10 postings per round, one page every few seconds. Read only: never click Apply, Easy Apply, Save, Follow or Message. Prefer the employer's own posting URL when the listing links to one.
2. Pipe the whole array through `node tools/cache.mjs filter`. It records every posting in `me/cache.json` and returns only the ones not yet scored. It matches on company, title and location, so the same job under another URL is dropped. A returned posting marked `reposted` has the same company, title and location as an earlier one but went up more than 30 days later under a new URL: treat it as a new hiring round and score it again.
3. Drop every returned posting whose URL is already in `me/tracker.csv`.
4. Take up to 15 of the rest: those matching the highest-ranked target roles first, then newest `posted` first.
5. Fetch each posting's text and score it with the "Fit score" rubric in `CLAUDE.md`. Check the term and dates in the text: a posting for a term that has passed scores 0. A posting that cannot be fetched is listed as "could not read" and gets no row.
6. Append one row per scored posting to `me/tracker.csv`: status `found` at or above the cutoff, `skipped` below it. Start the `notes` with the posted date, and for a reposted one add "new round; earlier posting <date>".
7. Run `node tools/cache.mjs mark <url> <url> ...` with the URLs just scored. Leave "could not read" postings unmarked so a later run retries them.
8. Tell the user in one line how the round went (for example "Round 2: 15 scored, 1 qualified, 2 of 5 so far").

## When to stop

Repeat rounds until one of these is true:

- The batch is full.
- No unscored postings are left from the feeds and a round of web search adds none.
- Five rounds have run in this command (75 postings scored).

Never lower the cutoff, raise a score or count a `skipped` posting to fill the batch.

## Report

Show one table of everything scored in this run, sorted by score: score, company, role, location, posted date, competition tier, round-1 odds, biggest gap, URL. Then say:

- how many qualified postings there are against the batch size, and which stop condition ended the run;
- the most common reason postings scored low or zero, when one reason accounts for a third or more of them;
- how many cached postings are still unscored, and any aggregator leads;
- if at least one posting qualified, offer to run `/apply`.
