---
description: Turn tailored cover letters on or off for /apply (off by default)
argument-hint: [on | off]
---

Requested: $ARGUMENTS

The setting is the "Cover letter" line in `me/preferences.md`. If the line is missing, treat it as off.

1. With no argument, switch it to the opposite of its current value. With `on` or `off`, set that value. Anything else: say so and change nothing.
2. Write the new value to `me/preferences.md`, adding the line under "Apply settings" if it is missing.
3. When turning it on, make sure `me/cover-letter.tex` exists; if not, copy `me.example/cover-letter.tex` there and fill in the header from `me/profile.md`.
4. Reply with the old and new values. When it is on, say that `/apply` writes a letter only for forms that have a cover letter field or upload, and shows the text for approval before anything is submitted.
