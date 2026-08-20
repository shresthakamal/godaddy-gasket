# Releases

The Gasket project is split into two major monorepos. The public facing open
source project is under the `@gasket` scope and the internal private project is
under the `@godaddy/gasket-` scope and prefix.

Open source packages are fixed to a single major version, while internal
packages may have different major versions.
This allows for more flexibility in managing major changes in the two codebases.
Refer to the tables below to see what versions are currently active and
compatible with each other.

## Active

| Packages            | Source   | Version |
|---------------------|----------|---------|
| `@gasket/*`         | public   | 7.x     |
| `@godaddy/gasket-*` | internal | 3.x     |
| HCS                 | internal | 4.x     |

Key features in the Active release are GasketActions, full ESM and TypeScript
support, Gasket CLI removal, and unblocks Next.js 14.
For more details, see [what's new](what-is-new.md).

## Long-Term Support (LTS)

| Packages            | Source   | Version | Unsupported |
|---------------------|----------|---------|-------------|
| `@gasket/*`         | public   | 6.x     | Q3 2025     |
| `@godaddy/gasket-*` | internal | 2.x     | Q3 2025     |
| HCS                 | internal | 3.x     | Q3 2025     |

## Frequently Asked Questions

> What are the current versions?

The Active open-source packages are `^7.x` and the internal packages are
`^3.x`.
Maintenance of the LTS `^6.x` and `^2.x` packages will be limited to
security patches.
Community plugins may follow a different versioning scheme, so check if they
are compatible with the active release.

> How long do apps have to upgrade?

The Gasket team will continue to support Teams and Apps that have not migrated
to the latest plugins until Q3 of 2025. Teams are encouraged to upgrade their
Apps to latest during this timeframe.

> How will bug fixes and contributions be handled?

The maintenance branches will be `lts` for the open source repo internal repo.
And code changes and contributions to the maintenance branches will be limited
to security patches and fixes only. Any new feature development should take
place in the latest code of the `main` branches.

> Why are the version numbers for the internal packages different?

Sometimes, breaking changes are necessary in the internal packages that are not
required in the open-source packages. The internal packages are versioned
differently to allow for more flexibility in managing major changes in the
two codebases.

> How will publishes be handled?

When publishing maintenance changes, the `lts` dist-tag will be used for
open-source packages and internal packages.
