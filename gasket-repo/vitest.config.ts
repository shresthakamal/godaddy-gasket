import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { basename, dirname, resolve } from 'path';
import { existsSync, readdirSync, statSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure vitest is always run from the repo root, not from a package subdirectory
if (!existsSync(resolve(process.cwd(), 'pnpm-workspace.yaml'))) {
  throw new Error(
    `vitest.config.ts must be run from the repo root.\n` +
    `Running from: ${process.cwd()}\n` +
    `Add a vitest.config.js to your package instead of relying on the root config.`
  );
}

const isExcluded = (pkg: string) =>
  pkg.startsWith('gasket-preset-') ||
  pkg.startsWith('gasket-template-') ||
  pkg === 'gasket-upgrade-cli' ||
  pkg === 'gasket-cookies';

// Published source files that live at the package root instead of src/ or lib/
const extraCoverageIncludes = [
  'packages/gasket-plugin-uxp/utils.js',
];

const packagesDir = resolve(__dirname, 'packages');

const coverageInclude = readdirSync(packagesDir)
  // basename() strips any path separators, preventing path traversal before resolve
  .map((entry) => basename(entry))
  // skip stray files and intentionally excluded packages (presets, templates, etc.)
  .filter((entry) => statSync(resolve(packagesDir, entry)).isDirectory() && !isExcluded(entry))
  // sort for deterministic ordering
  .sort()
  // map each package to its source glob: src/ wins over lib/ for TS packages
  // that compile src/ → lib/; packages with neither are skipped (return [])
  .flatMap((pkg) => {
    const pkgDir = resolve(packagesDir, pkg);
    if (existsSync(resolve(pkgDir, 'src'))) {
      return [`packages/${pkg}/src/**/*.{js,jsx,ts,tsx}`];
    }
    if (existsSync(resolve(pkgDir, 'lib'))) {
      return [`packages/${pkg}/lib/**/*.js`];
    }
    return [];
  })
  // add any published source files that live outside src/ or lib/
  .concat(extraCoverageIncludes);

export default defineConfig({
  test: {
    projects: ['packages/*/vitest.config.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      reportOnFailure: true,
      include: coverageInclude,
      exclude: ['packages/**/*.d.ts'],
    },
  },
});
