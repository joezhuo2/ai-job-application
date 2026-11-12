---
description: Find, tailor and fill a batch of applications above your score cutoff, then submit the ones you approve
argument-hint: [posting URLs or company names; empty = search for a full batch]
---

Targets: $ARGUMENTS

"Batch size", "Score cutoff" and "Cover letter" come from `me/preferences.md`. One run handles at most "Batch size" applications.

## Fill the batch

- **Targets named:** use them, up to the batch size. Say how many were left out.
- **No targets:** start with the rows in `me/tracker.csv` with status `found` and a score at or above the cutoff, highest score first. If that is fewer than the batch size, run the `/search` steps once; `/search` keeps going until the batch is full or its own stop conditions end it. If the batch is still short, go on with what there is and say how many were found against how many were wanted; never lower the cutoff to fill it.

## Prepare (no approval needed)

For each target, working in `me/applications/<company>-<role>/`:

1. If it has no score, run the `/score` steps. If it has no tailored resume, run the `/tailor` steps.
2. Open the application form in the browser and read every field before filling any.
3. Fill the factual fields from `me/profile.md` and the "Form answers" section of `me/preferences.md`. Attach the tailored PDF.
4. Write the free-text answers (see below) and enter them in the form.
5. Write the cover letter (see below) only when "Cover letter" is on and the form has a cover letter field or upload.
6. Stop and skip to the next target, noting why, when the form needs a sign-in, a new account or a CAPTCHA. Leave a factual question blank, and list it, when neither file answers it. Never guess an answer about work authorization, demographics, salary or availability.
7. Do not press the final submit button. Set the row's status to `prepared`.

### Models

This session (usually Sonnet) orchestrates: it picks targets, hands out the work below, checks what comes back, runs the approval and presses submit.

- **Routine work on Haiku.** Form filling (steps 2, 3 and 6) goes to a subagent with `model: "haiku"`, given the form URL, the application folder, the PDF path and these rules. It fills the factual fields only and returns what it filled, what it left blank and why.
- **Harder work on Opus.** Free-text answers and the cover letter go to a subagent with `model: "opus"`, given the application folder (posting text and profile paths) and the rules in those two sections. It returns the drafts; this session enters them in the form.

If subagents are unavailable, do the steps here.

### Browser work

Keep page reads small, since screenshots and page dumps are large:

- Load every browser tool needed in one ToolSearch call, including `browser_batch`, then send runs of predictable clicks and typing as one batch.
- Find fields with `find` and fill them with `form_input`. Avoid full `read_page` dumps after the first read of the form.
- Take a screenshot only to check a result, at `scale: 0.5`.

### Free-text answers

A free-text question asks for sentences, not a fact: "Why do you want to work here?", "Tell us about a project you are proud of", "What interests you about this role?", "Anything else we should know?".

- Answer from two sources only: `me/profile.md` for everything about the person, and the posting text for everything about the role and company. Do not research the company or add facts about it from memory.
- Pick the one or two profile entries that best match what the posting asks for, and use their real numbers. Use the posting's own words for the work where the profile supports them.
- Write in the first person, plainly, with no flattery and no claims of passion the profile does not show. Keep to the form's limit; with no limit, 60 to 120 words.
- A question that needs something the profile lacks (a salary figure, a start date, a story that never happened) is not free text: leave it blank and list it for the user.
- Save every question and answer to `answers.md` in the application folder, marked as a draft.

### Cover letter

- Copy `me/cover-letter.tex` to `cover-letter.tex` in the application folder; if `me/cover-letter.tex` is missing, copy `me.example/cover-letter.tex` to `me/` first and fill in the header from the profile.
- Write the body between the `%%BEGIN body` and `%%END body` lines: three short paragraphs, under 250 words. First, the role and the single strongest reason the person fits it. Second, one or two profile entries with their real numbers, tied to what the posting asks for. Third, availability (term and dates from `me/preferences.md`) and a plain close. The same two-source rule as free-text answers applies.
- Compile it with Tectonic and read the PDF: it must be one page.
- Paste the text when the form has a cover letter box; attach the PDF when it has an upload.

## Approve

Show one numbered list of the prepared applications. For each: company, role, score, competition tier, round-1 odds, resume link, anything left blank, and then every free-text answer in full under its question, and the cover letter text when one was written. The user is checking this wording before it is sent, so never summarize it.

Under the list, show the skipped applications and what each needs from the user. Then ask which numbers to submit, and say that the user can reply with changes to any answer first.

- When the user changes an answer or the cover letter, update the form and `answers.md` (or recompile the letter), show the new wording, and ask again.
- When the user answers a missing factual question, save it under "Form answers" in `me/preferences.md` so it is never asked again.

## Submit (only what the user named)

For each application the user named in this session: reopen the form if needed, check the filled values and free-text answers are still what the user approved, press submit, confirm the site shows a success message, and set the row to `submitted` with today's date. Report any that failed. Applications the user did not name stay `prepared`.
