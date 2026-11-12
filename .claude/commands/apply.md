---
description: Prepare applications for queued jobs, then submit the ones you approve
argument-hint: [posting URLs or company names; empty = every job above the threshold]
---

Targets: $ARGUMENTS

With no targets, use the rows in `me/tracker.csv` with status `found` and a score at or above the threshold in `me/preferences.md`, highest score first.

Take at most "Batch size" targets (from `me/preferences.md`) in one run, whether they were named or queued. Say how many are left for the next run.

## Prepare (no approval needed)

For each target:

1. If it has no score, run the `/score` steps. If it has no tailored resume, run the `/tailor` steps.
2. Open the application form in the browser.
3. Fill each field from `me/profile.md` and the "Form answers" section of `me/preferences.md`. Attach the tailored PDF.
4. Stop and skip to the next target, noting why, when the form needs a sign-in, a new account, a CAPTCHA, or a question neither file answers. Never guess an answer about work authorization, demographics, salary or availability.
5. Do not press the final submit button. Set the row's status to `prepared`.

## Approve

Show one numbered list of the prepared applications: company, role, score, round-1 odds, resume link, and anything left blank. Under it, list the skipped ones and what each needs from the user. Then ask which numbers to submit.

When the user answers a missing question, save it under "Form answers" in `me/preferences.md` so it is never asked again.

## Submit (only what the user named)

For each application the user named in this session: reopen the form if needed, check the filled values are still there, press submit, confirm the site shows a success message, and set the row to `submitted` with today's date. Report any that failed. Applications the user did not name stay `prepared`.
