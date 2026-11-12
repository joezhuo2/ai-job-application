---
description: Record what happened to an application
argument-hint: <company> <what happened>
---

Update: $ARGUMENTS

1. Find the row in `me/tracker.csv`. If more than one row matches the company, ask which role.
2. Set `status` and `furthest_round` using the values defined in `CLAUDE.md`. `furthest_round` only ever goes up. Put the date and any detail in `notes`.
3. Reply with the updated row and the current counts: submitted, reached each round, rejected, no reply.
4. If the tracker has just reached 20 resolved rows, say that interview odds now come from the user's own results.
