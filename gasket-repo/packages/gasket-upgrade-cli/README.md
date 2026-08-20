# @godaddy/gasket-upgrade-cli

CLI utility for upgrading apps and plugins to latest `@gasket/*` and
`@godaddy/gasket-*` packages.

## Installation

```bash
npm i -g @godaddy/gasket-upgrade-cli
```

## Usage

In the root of a Gasket app, simply run:

```bash
gasket-upgrade
```

This will make modifications to the expected files, including dependencies in
the `package.json`. From here, you must verify the changes are correct and that
your app still builds and runs correctly.

Refer to the [upgrade guides] for further details and things to check for.

[upgrade guides]: ../../docs/upgrades.md
