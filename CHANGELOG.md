# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `/search` reads Workday, SmartRecruiters and Workable job feeds as well as
  Greenhouse, Lever and Ashby. Add companies under `workday` (the careers
  page URL), `smartrecruiters` and `workable` in `me/companies.json`.

## [0.1.3] - 2026-11-12

### Changed

- `/apply` splits its work by model: your session (Sonnet recommended)
  orchestrates and submits, a Haiku subagent fills the factual form fields,
  and an Opus subagent writes free-text answers and the cover letter.
- `/apply` keeps browser reads small: `find` and `form_input` for fields,
  `browser_batch` for runs of clicks, and half-size screenshots only to
  check a result.
- Cached postings are forgotten after 30 days by default, down from 90.

## [0.1.2] - 2026-11-12

### Added

- `/apply` drafts an answer to each free-text question ("Why this
  company?") from your profile and the posting, and shows every answer in
  full for you to check or change before anything is submitted.
- `/cover-letter [on|off]` turns tailored cover letters on or off. It is off
  by default. When on, `/apply` writes a one-page letter for forms that have
  a cover letter field or upload.
- A cover letter layout, `me/cover-letter.tex`.
- A Claude Code plugin: `/plugin install ai-job-application --marketplace
  joezhuo2/ai-job-application`, then `/ai-job-application:setup` creates the
  project folder.
- A "Models and cost" section in the README with a recommended model for
  each command.

### Changed

- Anything `/apply` writes about the role or company must come from the
  posting text.

## [0.1.1] - 2026-11-12

### Added

- `/scoring [dimension] [weight]` changes how much each fit-score dimension
  counts. The weights do not have to add up to 100.
- `/clear-cache [days]` forgets cached postings not seen for that many days
  and saves the number (90 by default).
- `/linkedin-search [on|off]` turns LinkedIn Jobs on or off as a source for
  `/search`. It is off by default.
- A posting cache (`me/cache.json`, `tools/cache.mjs`). Every posting
  `/search` comes across is remembered and matched on company, title and
  location, so the same job under another URL is not scored twice.
- The same job posted again more than 30 days later under a new URL is
  treated as a new hiring round and scored again.

### Changed

- `/search` now scores in rounds of 15 and keeps going until `batch-size`
  postings clear your score cutoff, it runs out of postings, or five rounds
  have run.
- The fit score is now the points earned as a percentage of the total
  weight, and the score cutoff is a percentage of that total.
- `/search` checks the posted date and the term in each posting; a posting
  for a term that has passed scores 0.
- `/apply` relies on `/search` to fill a short batch.
- The README install commands use the npm package.

## [0.1.0] - 2026-11-12

### Added

- First release: `/sync-profile`, `/search`, `/score`, `/tailor`, `/apply`,
  `/batch-size`, `/score-cutoff` and `/outcome`.
- A job-feed reader for Greenhouse, Lever and Ashby.
- An npx and npm installer that creates the project with a blank `me/`.

[Unreleased]: https://github.com/joezhuo2/ai-job-application/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/joezhuo2/ai-job-application/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/joezhuo2/ai-job-application/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/joezhuo2/ai-job-application/releases/tag/v0.1.1
