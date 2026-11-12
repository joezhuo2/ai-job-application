---
description: Pull new project and experience details from your GitHub and LinkedIn into your profile
argument-hint: [github | linkedin; empty = both]
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
4. Update the "Last synced" line and reply with what was added, what conflicts, and which repositories look resume-worthy but are not on the master resume.
