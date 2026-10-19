---
name: pr-description
description: Write or rewrite a pull request description in plain, professional language that gives reviewers and future readers context the diff can't. Use when drafting or editing a PR body.
---

# PR Description

A PR description serves two readers: a reviewer who needs context before reading the diff, and someone months later asking why the change was made. Write for both. Everything in the description should be something the diff cannot tell them.

## Before writing

Gather what you need to be specific:

- The ticket, issue, incident, or doc that motivated the change. If you don't have a link, ask for it. Never invent one or write a placeholder.
- Related PRs, especially ones this builds on or follows up.
- The reason for the approach taken, and alternatives that were considered and rejected.

## What to include

1. **Problem.** What was wrong or missing, stated so someone with no context understands it. Include the concrete symptom (an error message, a failure, a measurement) when there is one.
2. **Approach.** What the change does about it, in terms of behavior, not code structure. Name the key decision and why it was chosen over the alternatives. Don't do this as a rule, only include alternatives when there would be genuine confusion or context that an experienced engineer would need.
3. **References.** Link the ticket, issue, incident, doc, or prior PRs inline where they apply, not in a separate section of bare links.
4. **Consequences.** Anything that changes behavior for callers, requires a deploy step or data migration, or leaves known gaps. State it directly.
5. **Testing.** Say what was actually exercised and how, concretely. If nothing beyond CI was run, omit the section instead of padding it. Don't give false confidence here. Plainly state how to test and verify. CI is implied.

Use only the parts that apply. Do not add a section because it is customary.

## What to leave out

- **File lists and file-by-file walkthroughs.** The diff shows what files changed. Describe behavior instead.
- **Tables of areas to files.**
- **Section headers addressed to the reader**, such as "Worth a reviewer's eye", "Where to look", "Things to note", or "Verified". If something deserves attention, say what it is and why in the sentence that introduces it.
- **Offers and hedges** such as "easy to change if you'd rather" or "happy to adjust". State the decision and the reasoning.
- **Restating the diff or the test names** in prose.
- **Attribution footers** and tool signatures.
- **Implemention references** don't reference plan docs, sub agent verifications, anything that relates to how to code was generated is irrelevant to a reviewer.

## Language

- Plain, direct, specific. Say what happened and what the code does now.
- Active voice, and past or present tense for what the change does ("Retries 429 responses with exponential backoff").
- Prefer concrete values over vague ones: "5 attempts, 15s base delay, 120s cap", not "reasonable backoff".
- No filler openers ("This PR aims to", "This change introduces"), no intensifiers, no emoji.
- Don't describe the PR as comprehensive, robust, or improved. Say what is different.
- Title: imperative verb plus the object and context, under about 70 characters ("Retry Vertex 429s during document ingestion").
- Use bullets when items are parallel and discrete. Use prose when the reasoning is connected, since bullets drop the "because".

## Check before finishing

- Could a reader a year from now understand why this exists without opening the ticket?
- Does every sentence tell the reader something the diff doesn't?
- Is any heading or phrase there for appearance rather than information? Cut it.
- Are all links real and relevant?
