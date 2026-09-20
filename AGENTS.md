# WebToEpub

Browser extension (Chrome + Firefox) that converts web novels/pages into EPUB. Plain JavaScript, **no bundler, no TypeScript, no transpile step**. Source lives in `plugin/` and is shipped as-is.

## Critical: there is no "build"

`npm run lint` is both the build and the lint. It runs `eslint/pack.js`, which:
1. Concatenates every `<script src>` referenced from `plugin/popup.html` into `eslint/packed.js` (for eslint to scan), and
2. Packages the extension into `eslint/WebToEpub<version>.zip` (Chrome) and `eslint/WebToEpub<version>.version.xpi` (Firefox).

Success is signalled by output ending in `Wrote Zip to disk; Done in XXXs.` The `.zip`/`.xpi`/`packed.js`/`index.csv` files are gitignored build artifacts.

## Dev commands

- `npm install` — copies vendor libs (`zip.js`, `dompurify`) from `node_modules` into `plugin/` via the `postinstall` script. These copies are gitignored; tests/lint fail if they're missing.
- `npm run lint` — pack + lint (the real build). Also used by CI.
- `npm run build` — pack only, no lint.
- `npm run lint:fix` — `eslint --config eslint/.eslintrc.js --fix plugin/js`.
- `npm test` — serves `unitTest/Tests.html` over `http-server` and opens it in a browser. **QUnit tests run in a browser, not Node.** They require an http server (or Chrome/Firefox file-access flags) because tests use `XMLHttpRequest`/`localStorage`.
- `npm run web-ext` — validates the packed Firefox `.xpi`.
- `npm run release` — runs lint, then creates a GitHub release. Requires being on `master` (and master pushed to remote). Pass `pre` and/or `draft` args for prereleases/drafts.

## Adding a site parser (the main contributor task)

One file per site under `plugin/js/parsers/` named `<Site>Parser.js`. To wire it in you must manually register it in **two** places, both of which are just `<script src>` lists:

1. `plugin/popup.html` (all parsers)
2. `unitTest/Tests.html` (only parsers you want tested — it's a smaller subset)

The parser registers itself by calling `parserFactory.register(hostName, constructor)` (or `registerRule`/`registerUrlRule` for heuristic matching). The `.eslintrc.js` `globals` block lists the project's shared globals; a new parser typically needs no new global unless it's referenced from `packed.js` context.

`unitTest/Tests.html` has **no single-test runner** — it loads all test scripts at once. To isolate one test, comment out the others in `Tests.html`. HTML fixtures used by tests live in `testdata/`.

## Lint conventions (differ from JS defaults)

`eslint/.eslintrc.js` extends `eslint:recommended` plus:
- 4-space indent, `"double"` quotes, semicolons required
- `no-unused-vars` and `no-undef` are errors
- `space-before-function-paren`: anonymous `never`, named `never`, asyncArrow `always` (i.e. `function(){}` but `async () => {}`)
- `no-redeclare` with `builtinGlobals: false` (project relies on many shared globals across concatenated files)

`DOMPurify` and `zip` are declared readonly globals because `pack.js` excludes the vendor libs from `packed.js`.

## Manifest / versioning

- `plugin/manifest.json` is the single source of truth (MV3, Chrome-oriented). `pack.js` derives the Firefox MV2 manifest from it at pack time (`makeManifestForFirefox`) and strips Firefox-specific keys for Chrome (`makeManifestForChrome`). Edit only `manifest.json`; don't maintain separate manifests.
- The `version` field names the output artifacts (`WebToEpub<version>.zip`/`.xpi`) and is bumped by CI.

## Experimental parsers

Script tags containing `/experimental/` (e.g. `js/parsers/experimental/Sbxh1Parser.js`) are **stripped from the packaged output** and from `packed.js`. They only run in dev, so lint/CI won't catch issues in them. A dev/debugging parser is at `plugin/js/debugging/FakeParser.js`.

## Architecture map

- `plugin/popup.html` — popup UI; lists every JS file to load (the de-facto dependency graph).
- `plugin/js/main.js` — popup entrypoint.
- `plugin/js/ParserFactory.js` — selects a parser by hostname (`parserFactory` singleton).
- `plugin/js/Parser.js` — base parser; site parsers extend it (or `DefaultParser`/`WordpressBaseParser`).
- `plugin/js/ContentScript.js` — injected into pages to scrape the DOM and send `ParseResults` back to the popup.
- `plugin/js/EpubPacker.js`, `ImageCollector.js`, `HttpClient.js`, `Library.js` — EPUB generation, image/download handling, storage.

## Branches

- CI (`node.js.yml`, `AutoRelease.yml`) triggers on the `ExperimentalTabMode` branch; `CONTRIBUTING.md` also says to commit to it.
- `eslint/release.js` hard-requires the `master` branch for full (non-prerelease) releases.

## Contributor expectations

`CONTRIBUTING.md` adds your name to the `contributors` array in `package.json` and the Credits section of `readme.md`. New behavior should be user-disableable and off by default (users dislike silent behavior changes).
