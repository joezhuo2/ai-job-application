---
description: Build your full profile - pulls GitHub and LinkedIn, then interviews you until every experience and your job targets are captured
argument-hint: [github | linkedin | interview; empty = all three]
---

Source: $ARGUMENTS

The profile links are in `me/preferences.md`. The date of the last sync is on the "Last synced" line of `me/profile.md`.

## GitHub

1. `gh api "users/<handle>/repos?per_page=100&sort=pushed"`. Keep repositories that are not forks.
2. For each one pushed since the last sync, or missing from the profile, read its description, languages and README.
3. From each, take what a resume could use: what it does, the stack, measured results, releases, tests, users or stars. Use only what the repository states.

## LinkedIn

1. Open the profile URL in the browser. If it shows a sign-in page, ask the user to sign in there and continue when they say so.
2. Read the main profile and its detail pages for experience, education, projects, honors, certifications and skills. Read only; click nothing that changes the account. Open at most one page every few seconds.

## Merge

1. Compare with `me/profile.md`. Add new entries and new facts under the right entry, each tagged with its source (`github` or `linkedin`).
2. Where a source disagrees with the profile (a date, a number, a title), change nothing and list the conflict for the user to settle.
3. Never delete. Never touch `me/resume.tex`.

## Interview

Ask the user questions until the profile holds everything they have done. Ask at most four questions per message and save each answer to `me/profile.md` (tagged `told`) before asking more.

1. **Coverage.** Go through every area and ask what is missing from the profile: paid jobs, internships, volunteering, clubs and teams, competitions and awards, hackathons, course projects, personal projects that are not on GitHub, research, certifications, leadership roles, spoken languages. An area is finished only when the user says there is nothing more in it.
2. **Depth.** For every entry, old or new, that lacks one of these, ask for it: the user's own role, dates, team size, tools used, and one measured result (a number, a ranking, a before and after). If the user has no number, record the entry without one; never estimate one for them.
3. **Conflicts.** Ask the user to settle each conflict listed during the merge.
4. **Targets.** If any of these is not set in `me/preferences.md`, ask and save it: target roles, target locations, work terms wanted, work authorization, deal-breakers. Then write the title and location regexes for `tools/fetch-jobs.mjs` from the answers.

Stop when every area is finished, no entry is missing a field the user can supply, and every target is set.

## Finish

Update the "Last synced" line and reply with what was added from each source, how many entries the profile now holds, and which entries look resume-worthy but are not on the master resume.
