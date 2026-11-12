# ai-job-application

A job-application assistant that runs inside [Claude Code](https://claude.com/claude-code). It finds postings, scores how well you fit each one, estimates your interview odds, builds a one-page resume tailored to the posting, fills the application form, and submits only what you approve.

Everything about you stays in `me/`, which git ignores.

## Setup

1. Clone the repo and copy the blank profile:

   ```bash
   cp -r me.example me
   ```

2. Put your resume at `me/resume.tex`. Wrap each project and job in `%%BEGIN project <name>` / `%%END project` (or `experience`) lines so `/tailor` can select them.
3. Install [Tectonic](https://tectonic-typesetting.github.io/) on your PATH, or put `tectonic.exe` in `tools/tectonic/`.
4. Open the folder in Claude Code and fill in `me/preferences.md`, or just tell Claude your target roles, locations and threshold.
5. Run `/sync-profile`.

Needs Node 18 or later and the GitHub CLI (`gh`).

## Commands

| Command | What it does |
|---|---|
| `/sync-profile` | Pulls project and experience details from your GitHub and LinkedIn into `me/profile.md` |
| `/search` | Finds new postings from company job feeds and web search, scores each, queues those above your threshold |
| `/score <url>` | Scores one posting 0-100 and estimates your odds of reaching each interview round |
| `/tailor <url>` | Picks the most relevant projects and bullets and compiles a one-page resume |
| `/apply` | Tailors and fills the form for every queued job, then submits the ones you name |
| `/batch-size <n>` | Sets how many applications `/apply` tailors and sends in one run |
| `/outcome <company> <result>` | Records what happened, which is what later makes the odds reflect your own results |

To update your background, tell Claude ("I just shipped X", "add Rust to my skills"). It edits `me/profile.md` for you.

## Limits

- Claude never signs in, creates accounts or solves CAPTCHAs for you; it stops and hands you that step.
- Interview odds are rough ranges until `me/tracker.csv` holds 20 resolved applications.
- `/search` reads Greenhouse, Lever and Ashby feeds for the companies in `me/companies.json`, plus web search. It does not scrape LinkedIn Jobs.

## Tests

```bash
node --test tools/*.test.mjs
```
