# rich-text-tools

`rich-text-tools` is a TypeScript utility library for making text replacements inside HTML while preserving tag structure.

## What this project does

The package parses HTML into a tree of segments (`root`, `tag`, `text`), applies text mutations to text nodes, and reconstructs HTML output.  
The main exported helper is designed for safe **text-only** replacement across rich-text markup:

- `ReplaceInHTML(html, search, replaceWith)`

It intentionally avoids changing content for ignored elements such as `script`, `style`, and `template`.

## Public API

The library exports:

- `ReplaceInHTML(html, search, replaceWith): string`
  - Runs a string/regex replacement over text content while preserving tag boundaries.
- `setSettings(settings: Partial<Settings>): void`
  - Overrides parser/output behavior (inline elements, void elements, XML mode, ignored elements, etc.).

## Internal design (analysis)

Core flow in `src/HTMLparser.ts`:

1. Parse HTML into segment objects with paths and parent references.
2. Normalize segments so text/tag ordering is consistent.
3. Build text blocks based on inline/block semantics.
4. Apply replacement callback to each block.
5. Use character diffs (`diff` package) to map rewritten block text back to original text segments.
6. Re-serialize segments back to HTML.

Supporting modules:

- `src/defaultElementRules.ts`: default inline/void/ignored/deprecated element rules.
- `src/extractors.ts`: attribute and inner-content extraction helpers.
- `src/regularExpressions.ts`: regex constants used by parser/extractors.
- `src/settings.ts`: `Settings` type and `defaultSettings`.
- `src/antiRecursiveReferenceGenerator.ts`: cycle guard for recursive traversal.

## Installation

```bash
npm install rich-text-tools
```

## Usage

```ts
import { ReplaceInHTML, setSettings } from "rich-text-tools";

const html = `<p>Hello <strong>world</strong>!</p>`;
const output = ReplaceInHTML(html, /world/g, "team");
// <p>Hello <strong>team</strong>!</p>

setSettings({
  output: {
    xmlMode: true,
    encode: true,
    transformDepricatedElements: true,
  },
});
```

## Development notes

- Language: TypeScript
- Runtime dependency: `diff`
- Current `npm test` script is a placeholder and exits with an error by default.

## License

MIT
