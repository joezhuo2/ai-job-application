---
description: Create or update an ai-job-application project folder
argument-hint: [folder]
---

Folder: $ARGUMENTS

1. Pick the target folder. Use the one given. With none: if the current directory already has `me/` and `.claude/commands/search.md`, the target is `.` (an update); otherwise it is `ai-job-application` inside the current directory.
2. Run `npx --yes ai-job-application@latest "<target>"`. If the npm registry cannot be reached, run `npx --yes github:joezhuo2/ai-job-application "<target>"` instead.
3. Report what the installer printed. It replaces the commands, rules and tools, and never overwrites an existing `me/` folder.
4. For a new folder, tell the user the next steps: open that folder in Claude Code, install Tectonic (see the README), put their resume at `me/resume.tex`, and run `/sync-profile`.
