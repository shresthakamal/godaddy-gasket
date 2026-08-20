# Contributing

Looking to contribute? Excellent! The following sections provide instructions on
how to proceed.

- [Development Setup]
- [When should I contribute? Do I need to wait?]
- [I found a bug and I want to fix it!]
- [I want to contribute my time to an existing feature!]
- [I want to define a new feature that I need!]
- [I just don't like how `<BLANK>` works!]
- [How else can I contribute?]

The focus of GoDaddy Gasket is "what do we need that is common for for apps
across GoDaddy?"

## Development Setup

This repository uses [pnpm](https://pnpm.io/) for package management. To get started:

1. Install pnpm globally:

```bash
npm install -g pnpm
```

2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm build
```

Key pnpm commands for development:

- `pnpm install` - Install all dependencies
- `pnpm build` - Build all packages
- `pnpm test` - Run tests across all packages
- `pnpm add <package>` - Add a dependency to a package
- `pnpm --filter <package> <command>` - Run a command for a specific package
- `pnpm run lint` - Run linting
- `pnpm run lint:fix` - Fix linting issues
- `pnpm run typecheck:all` - Run TypeScript type checking
- `pnpm run docs` - Generate documentation

## When should I contribute? Do I need to wait?

No! Contributions are welcome immediately so don't wait: *contribute today.*

## I found a bug and I want to fix it

If you are already using GoDaddy Gasket, came across a bug, and want to fix it
we would **love** 💚 to have your help.

1. Reach out to `@gasket` in [#gasket-support] to confirm it's a bug.
2. Once it is confirmed, fork this repository.
3. Once the fix has been written, make a PR from your fork.
4. Work with `@gasket` folks to get your PR approved.
5. **Done**, thank you! 🙏

## I want to contribute my time to an existing feature

See a [JIRA Story] you would like to contribute your time to? **That's amazing!
We want your help.**

Reach out to `@gasket` in [#gasket-dev] to volunteer.

## I want to define a new feature that I need

Have an idea for a feature? There are a few places you should double-check
first:

- Make sure there isn't already a [JIRA Story] covering this topic.
- Reach out to `@gasket` in [#gasket-dev] to ensure the feature itself makes
  sense in the context of the current Gasket Roadmap.

Did it qualify? Rad! Time to draft out the proposal:

1. Fork the [gdcorp-uxp/pdrs][PDR].
2. Create a new markdown file (`*.md`) under `gasket/` and name it after the
   proposed feature ([see past examples][PDR examples]).
3. Write up your feature. Be sure to cover API and usage examples.
4. Make a PR from your fork.
5. Work with `@gasket` folks to get your proposal approved.
6. Done, thank you! The gasket team will prioritize the work when time is
   available.

**Interested in building your feature?** See [I want to contribute my time to an
existing feature!] above.

## I just don't like how `<BLANK>` works

We are interested in hearing any and all feedback! Reach out to [#gasket-dev] to
start the discussion.

## How else can I contribute?

Looking for even more ways to get involved? Great! Here are a few other ways you
can get involved:

- **Tell us about your web app!** Write up and share a gist to catalog the user
  journeys for various web application needs at GoDaddy.

[When should I contribute? Do I need to wait?]: #when-should-i-contribute-do-i-need-to-wait
[I found a bug and I want to fix it!]: #i-found-a-bug-and-i-want-to-fix-it
[I want to contribute my time to an existing feature!]: #i-want-to-contribute-my-time-to-an-existing-feature
[I want to define a new feature that I need!]: #i-want-to-define-a-new-feature-that-i-need
[I just don't like how `<BLANK>` works!]: #i-just-dont-like-how-blank-works
[How else can I contribute?]: #how-else-can-i-contribute

[JIRA Story]: https://jira.godaddy.com/secure/RapidBoard.jspa?rapidView=4905&projectKey=UXP&view=planning.nodetail&issueLimit=100

[#gasket-dev]: https://godaddy.slack.com/messages/C9PEPF709/
[#gasket-support]: https://godaddy.slack.com/messages/CABCTNQ5P/

[PDR]: https://github.com/gdcorp-uxp/pdrs
[PDR examples]: https://github.com/gdcorp-uxp/pdrs/tree/main/gasket
