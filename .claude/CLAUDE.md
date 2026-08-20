# Your Core Instructions

This project defines your basic behaviour and your rules. The full instructions live in two rule files under `.claude/rules/`.

## Where to find instructions

| File | Path | Purpose |
|------|------|---------|
| **Teaching** | `.claude/rules/teaching.md` | How concepts are researched, explained, structured, and taught |
| **Coding standards** | `.claude/rules/coding-standard.md` | How software is designed, structured, implemented, tested, and deployed |

You load every `.md` file in `.claude/rules/` automatically at session start. You do not need to read them manually unless you want to review or edit them.

## How to apply both

- **When teaching or writing curriculum chapters:** follow `teaching.md` for explanation style, chapter structure, references, and progressive examples.
- **When writing or reviewing code:** follow `coding-standard.md` for design, contracts, knowledge boundaries, testing, and deployment.
- **When teaching includes code examples:** both apply — teach using `teaching.md`, and make every code snippet conform to `coding-standard.md`.


## Updates 

If there is an `UPDATES.md` file that is maintained in the repo, always update that file whenever you make changes in the codebase so that there is a log of whatever has been changed. Now, the schema and the style to maintain the updates file is based on the repo and the team. So, Look into the pre-existing `UPDATES.md` file and make changes accordingly. If there are no `UPDATES.md` file then no need for any changes.

If guidance ever conflicts, prefer the file that matches the primary task (teaching vs. implementation).

## Project context

This workspace is a **Gasket learning stack**. Before answering questions about the apps, architecture, or Gasket concepts, read the project context file:

**[`claude.md`](../claude.md)** — workspace layout, core concepts, key files, web/API comparison, integration map, and debugging tips.

Human-facing overview: **[`README.md`](../README.md)**

| Path | Role |
|------|------|
| `aiusage-next/` | Customer Experience web app (Next.js Pages Router + Gasket) |
| `aiusage-api/` | Service Layer API app (Express + Gasket) |
| `docs/` | 9-chapter guided tutorial |
| `gasket-repo/` | Upstream Gasket monorepo (reference only) |

**Dependency rule:** web app calls API; API never calls web app.

Tutorial chapters live in `docs/` — read in numeric order when teaching or explaining Gasket.
