<h1 align="center">ai-job-application</h1>

<p align="center">
  <a href="https://claude.com/claude-code"><img src="https://img.shields.io/badge/built%20for-Claude%20Code-D97757" alt="built for Claude Code"></a>
  <a href="https://www.npmjs.com/package/ai-job-application"><img src="https://img.shields.io/npm/v/ai-job-application?logo=npm&color=orange" alt="npm version"></a>
  <img src="https://img.shields.io/badge/node-%E2%89%A518-339933?logo=nodedotjs&logoColor=white" alt="node 18 or later">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey" alt="platform: Windows | macOS | Linux">
  <img src="https://img.shields.io/badge/your%20data-stays%20local-green" alt="your data stays local">
</p>

<p align="center">
  <a href="#install">Install</a> •
  <a href="#commands">Commands</a> •
  <a href="#scoring">Scoring</a> •
  <a href="#models-and-cost">Models</a> •
  <a href="#privacy">Privacy</a> •
  <a href="#files">Files</a> •
  <a href="#development">Development</a> •
  <a href="#contributing">Contributing</a>
</p>

> ai-job-application is a job-application assistant that runs inside Claude
> Code. It finds postings, scores how well you fit each one against a crowded
> market, estimates your odds of reaching each interview round, builds a
> one-page resume carrying the posting's keywords, fills the application form,
> and submits only what you approve. Everything about you stays on your
> computer.

## Install

Needs [Claude Code](https://claude.com/claude-code), Node 18 or later, and the
GitHub CLI (`gh`).

- **npx:** creates an `ai-job-application` folder where you run it, or the
  folder you name.

  ```bash
  npx ai-job-application
  ```

- **npm:** installs the `ai-job-application` command, which does the same.

  ```bash
  npm i -g ai-job-application
  ```

- **Claude Code plugin:** run these inside Claude Code. The plugin adds one
  command, which creates the same folder.

  ```
  /plugin install ai-job-application --marketplace joezhuo2/ai-job-application
  /ai-job-application:setup
  ```

  On Claude Code older than 2.1.275, install in two steps:

  ```
  /plugin marketplace add joezhuo2/ai-job-application
  /plugin install ai-job-application@ai-job-application
  ```

- **git:** clone the repo and copy the blank profile.

  ```bash
  git clone https://github.com/joezhuo2/ai-job-application
  ```

  ```bash
  cp -r me.example me
  ```

Running the installer again updates the commands and keeps your `me/` folder.

### First run

1. Install [Tectonic](https://tectonic-typesetting.github.io/) on your PATH,
   or put `tectonic.exe` in `tools/tectonic/`. It compiles the resume.
2. Put your resume at `me/resume.tex`. Wrap each project and job in
   `%%BEGIN project <name>` / `%%END project` (or `experience`) lines so
   `/tailor` can select them.
3. Open the folder in Claude Code and run `/sync-profile`.

## Commands

- **`/sync-profile`:** builds your profile. It reads your GitHub repositories
  and your LinkedIn profile (you sign in; Claude only reads), then asks you
  questions until every job, project, award and activity is recorded with
  your role, dates, tools and a measured result. It ends by collecting your
  target roles, locations, work terms and deal-breakers.
- **`/search [keywords]`:** finds new postings from the Greenhouse, Lever,
  Ashby, Workday, SmartRecruiters and Workable feeds of the companies in
  `me/companies.json`, plus web search. A Workday entry is the company's
  careers page URL (`https://<company>.wd<N>.myworkdayjobs.com/<site>`); the
  others are the company's name on that board. It
  scores them in rounds of 15 and keeps going until `batch-size` postings
  clear your score cutoff, it runs out of postings, or five rounds have run.
- **`/score <url or job description>`:** scores one posting from 0 to 100 and
  estimates your odds of reaching each interview round.
- **`/tailor [url or job description]`:** builds a one-page resume for the
  posting. It picks the projects and bullets that match, and adds the
  posting's keywords wherever your profile supports them. With no posting, it
  builds a general resume from your experiences.
- **`/apply [urls]`:** fills a batch. With no arguments it takes queued jobs
  above the cutoff and runs `/search` to fill the rest of the batch. For each job
  it tailors the resume, fills the form, and drafts an answer to each
  free-text question ("Why this company?") from your profile and the
  posting. It then shows one list with every drafted answer in full, lets
  you change any of them, and submits only the numbers you name.
- **`/batch-size [n]`:** sets how many applications `/apply` handles in one
  run. With no number, shows the current value.
- **`/score-cutoff [n]`:** sets the minimum score a job needs before `/apply`
  will prepare it. With no number, shows the current value.
- **`/scoring [dimension] [weight]`:** changes how much a fit-score dimension
  counts (`skills`, `eligibility`, `evidence`, `logistics`, `interest`). The
  weights do not have to add up to 100. With no arguments, shows them.
- **`/clear-cache [days]`:** forgets cached postings not seen for that many
  days, and saves the number (30 by default). `/search` also does this at
  the start of each run.
- **`/cover-letter [on|off]`:** turns tailored cover letters on or off. Off by
  default. When on, `/apply` writes a one-page letter for any form that has
  a cover letter field or upload.
- **`/linkedin-search [on|off]`:** turns LinkedIn Jobs on or off as a source
  for `/search`. Off by default. With no argument, it flips the setting.
- **`/outcome <company> <result>`:** records what happened to an application
  (no reply, rejected, which round you reached, offer). These records are
  what later replace the assumed odds with your own results.

To update your background at any time, tell Claude ("I just shipped X", "add
Rust to my skills"). It edits `me/profile.md` for you.

## Scoring

The fit score compares you with the people who actually apply, not with the
posting's wording.

| Dimension | Default weight |
| --- | --- |
| Skills match | 35 |
| Eligibility and level | 25 |
| Evidence strength | 20 |
| Logistics | 10 |
| Interest | 10 |

- **Your weights:** `/scoring` changes any weight. The score is the points
  earned as a percentage of the total weight, and a job qualifies when it
  earns at least your score cutoff percent of that total.
- **No repeats:** every posting `/search` comes across is cached and matched
  on company, title and location, so the same job under another URL is not
  scored twice. The same job posted again more than 30 days later under a
  new URL counts as a new hiring round.
- **Strict by design:** meeting a requirement earns about half its points,
  a missing minimum requirement caps its dimension at one third, and having
  no prior internship caps eligibility for roles that mention experience.
  Scores of 85 or more are rare.
- **Interview odds:** given as ranges for each round, by score and by how
  competitive the employer is. For a household-name employer, a score of
  70-84 gives a 1-4% chance of a first-round reply.
- **Assumed, then measured:** the starting ranges are conservative
  assumptions, not statistics. After 20 recorded outcomes the odds come from
  your own results, with the counts shown.
- **Keywords are honest:** `/tailor` adds a posting's keyword only when a
  project or job in your profile really used it. Missing keywords are
  reported as gaps, never added.

The full rubric is in [CLAUDE.md](CLAUDE.md).

## Models and cost

The commands run in your Claude Code session, on whichever model it is set
to, and count against your Claude plan (or API credits, if that is how you
run Claude Code). Switch model with `/model` before running a command. The
one exception is `/apply`, which splits its work across subagents.

| Command | Recommended model | Why |
| --- | --- | --- |
| `/search`, `/score`, `/apply` | Claude Sonnet 5.5 | High volume: each round reads and scores 15 postings. Sonnet costs half of Opus per token and handles the rubric, including traps such as graduation-year limits. |
| `/tailor`, `/sync-profile` | Claude Opus 5.5 | Low volume, and mistakes cost more: resume wording and profile facts. |

`/apply` runs best on Sonnet as the orchestrator. It hands form filling to a
Haiku subagent and free-text answers and the cover letter to an Opus
subagent.

Claude Haiku 5.5 is about 20 times cheaper than Sonnet per token and is
worth trying for `/search` if usage matters more to you than scoring
strictness; it has not been tested here. Claude Fable 5.2 costs twice as
much as Opus and is not needed for any command.

Rough, unmeasured token estimates: `/score` 15-20k, `/tailor` 30-50k, one
`/search` round 60-100k (a full five-round run 300-500k), and `/apply`
50-100k per application.

## Privacy

- Everything about you lives in `me/`, which git ignores.
- Claude never signs in, creates an account or solves a CAPTCHA for you; it
  stops and hands you that step.
- Nothing is submitted until you name the application in that session.
- Job postings are treated as untrusted text: instructions inside them are
  ignored and links in them are not followed.
- `/search` does not read LinkedIn Jobs unless you turn it on with
  `/linkedin-search`. LinkedIn's terms forbid automated browsing, so that
  carries some risk to your account.

## Files

| What | Where |
| --- | --- |
| Experience bank | `me/profile.md` |
| Targets, score cutoff, batch size, saved form answers | `me/preferences.md` |
| Master resume | `me/resume.tex` |
| Companies whose job feeds are searched | `me/companies.json` |
| Every posting scored, with score and status | `me/tracker.csv` |
| Every posting come across, scored or not | `me/cache.json` |
| Cover letter layout | `me/cover-letter.tex` |
| Posting text, tailored resume, drafted answers and cover letter per application | `me/applications/<company>-<role>/` |
| Blank starting copy of the above | `me.example/` |

## Development

### Tests

```bash
npm test
```

### Layout

| Path | Purpose |
| --- | --- |
| `.claude/commands/` | One Markdown prompt per slash command |
| `CLAUDE.md` | Rules, the fit-score rubric and the interview-odds method |
| `tools/fetch-jobs.mjs` | Lists postings from Greenhouse, Lever, Ashby, Workday, SmartRecruiters and Workable feeds |
| `tools/cache.mjs` | Remembers postings already seen and drops repeats |
| `bin/install.mjs` | The npx and npm installer |
| `.claude-plugin/`, `commands/setup.md` | The Claude Code plugin and its setup command |

## Contributing

Issues and pull requests are welcome. Never include anything from a `me/`
folder in one.
