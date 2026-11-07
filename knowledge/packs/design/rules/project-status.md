# Project Status

`.wpaikit/status.md` is the backlog of a design run: what is done, what waits for the designer, what waits for the client, and what is next. It answers "what is left?" without relying on the chat, which context compaction shortens.

The status file tracks state only. Current rules go to `.wpaikit/design-direction.md`, the history of decisions to `.wpaikit/decision-log.md`, copy to `.wpaikit/copy-deck.md`. Do not repeat decisions in the status file.

## When to create and update it

- **Create it after gate C**, from the approved block plan and the utility pieces in scope (generate-design, stage 4). If the run starts later (an existing project), create it from the Figma file and the records before the first stage 6 cycle.
- **Read it first when resuming** a session or after context compaction, before choosing what to do next.
- **Update it at the end of every stage 6 cycle**, and whenever the designer approves, postpones, adds or drops an item, or supplies missing client data.
- **After each update, show the designer the next two or three open items** in one short line.
- When the designer asks what is left, answer from the file: count by status, then the open items in order.

## Statuses

| Status | Meaning |
|---|---|
| `todo` | In scope, not started |
| `in progress` | The current item; at most one at a time |
| `review` | Shown to the designer; waiting for a choice or approval |
| `done` | Approved by the designer and placed in the final page |
| `deferred` | Postponed by the designer; note until when or why |
| `waiting client` | Blocked or built with placeholders until the client supplies data |

Mark an item `done` only after the designer approved it, or explicitly said to continue without review. Built is not done.

## Format

```markdown
# Status — {project}

Updated: {date} · Now: {current item or "nothing in progress"}
Done {n} · Review {n} · To do {n} · Deferred {n} · Waiting client {n}

## {Page or area, for example "Home — desktop"}

| # | Item | Status | Next step or blocker | Figma |
|---|---|---|---|---|
| 1 | Hero | done | — | 91:258 |
| 2 | Coffee shelf | review | Designer picks Z1–Z3 | 150:582 |
| 3 | Delivery block | waiting client | Delivery price and minimum order; placeholders in place | 216:3150 |
| 4 | Toasts | todo | — | — |

## Waiting for client data

- Delivery price and minimum order: used in blocks 3 and 7.
```

- One table per page or area in the order of work: pages, then utility pieces, then mobile.
- Keep item names identical to the block plan, so the designer can match them.
- The Figma column holds the node ID of the final frame or section, or of the variants frame while in review.
- The "Waiting for client data" list merges the data questions from all gates, with where each answer is used.
- Keep `done` items: the file is also the record of what was delivered.
