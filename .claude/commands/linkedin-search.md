---
description: Turn LinkedIn Jobs on or off as a source for /search (off by default)
argument-hint: [on | off]
---

Requested: $ARGUMENTS

The setting is the "LinkedIn Jobs search" line in `me/preferences.md`. If the line is missing, treat it as off.

1. With no argument, switch it to the opposite of its current value. With `on` or `off`, set that value. Anything else: say so and change nothing.
2. Write the new value to `me/preferences.md`, adding the line under "Apply settings" if it is missing.
3. Reply with the old and new values.
4. When turning it on, add this warning once: LinkedIn's terms forbid automated browsing, so this carries some risk to the account. `/search` keeps it slow and read-only, and needs the user signed in to LinkedIn in the browser.
