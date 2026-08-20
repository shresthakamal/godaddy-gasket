# Internal Gasket Documentation Site

This directory contains a Docusaurus site that generates documentation for the internal Gasket monorepo.

## How it works

1. The `pnpm run docs` command generates documentation from all packages
2. The `pnpm run docs-view` command generates docs and starts the Docusaurus development server
3. Documentation is automatically copied from the generated docs to the `site/docs` folder
4. Docusaurus serves the documentation with navigation, search, and a clean UI

## Development

```bash
# Generate docs and start the site
pnpm run docs-view

# Or just generate docs without starting the server
pnpm run docs

# Start the site (after docs have been generated)
cd site && npm start
```

## Build for production

```bash
cd site && npm run build
```

The built site will be in `site/build/`.