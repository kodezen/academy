# Cross-platform release build

One command produces a shippable Academy LMS zip on **Linux, macOS, and Windows** —
no bash / make / `wp dist-archive` required.

```bash
npm run dist          # full release: JS build → composer (no-dev + Strauss) → POT → zip
npm run dist:zip      # only repackage the current tree into the release zip
npm run dist:dev      # keep dev dependencies (debug build)

# single steps / skips:
node build-tools/build.mjs --only=js|composer|pot|zip
node build-tools/build.mjs --skip-composer
node build-tools/build.mjs --no-download   # fail instead of fetching wp-cli/strauss phars
```

## What each step does

| # | Step | How |
|---|------|-----|
| 1 | Production JS | `wp-scripts build` (install auto-skips when `node_modules` exists; fresh installs use `npm ci --legacy-peer-deps`) |
| 2 | Composer + Strauss | delegates to the existing `composer run build` (→ `--no-dev` + Strauss namespace prefixing via `post-install-cmd`) |
| 3 | POT | `wp i18n make-pot` → `languages/academy.pot` (uses local WP-CLI, else downloads `wp-cli.phar` to `.build-cache/`) |
| 4 | Zip | built in Node from `.distignore` — **never drops `vendor/autoload.php`** and needs no system `zip` |

Config lives in [`build.config.json`](../build.config.json). The zip step needs the
`archiver` + `ignore` dev deps (already in `package.json`).

## Notes

- All four steps are cross-platform.
- Step 2 delegates to `composer run build`. Its `prefix-namespaces` script is now
  fully portable: the old UNIX-only `rm -rf vendor/paragonie` + `find … -delete`
  cleanup was replaced with [`strauss-cleanup.php`](strauss-cleanup.php), which does
  the same thing in pure PHP on any OS. Strauss itself is still fetched to
  `wp-content/bin/strauss.phar` (a PHP `copy()`, works everywhere).

## WordPress VIP coding standards

`phpcs-vip.xml` checks the plugin against the `WordPress-VIP-Go` standard
(see <https://docs.wpvip.com/php_codesniffer/>). The toolchain lives in its own
Composer project under [`phpcs-vip/`](phpcs-vip/) so it never touches the
committed `vendor/` (VIPCS 3 needs WPCS 3, the root `require-dev` pins WPCS 2).

```bash
composer lint:vip:install   # once
composer lint:vip           # scan
composer format:vip         # auto-fix what phpcbf can
```

Intentional exceptions are annotated in place with `phpcs:ignore` /
`phpcs:disable … -- reason`, scoped to the single statement.
