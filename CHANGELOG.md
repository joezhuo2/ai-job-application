# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/joezhuo2/ai-job-application/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/joezhuo2/ai-job-application/releases/tag/v0.1.1
