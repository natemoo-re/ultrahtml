---
"ultrahtml": major
---

`ultrahtml` is a complete markup toolkit with a tiny footprint. Parse, transform, and render HTML on the server, in the browser, with or without a build step.

## Breaking Changes

The signature of `transform` has been updated. Rather than applying sanitization and component swapping by default, these have been split out to individual `ultrahtml/transformers` that can be applied modularly.

In `ultrahtml@0.x`, `transform` accepted an options object with `sanitize` and `components`. Other transformations would need to be applied outside of this flow.

```js
import { transform } from "ultrahtml";

await transform(markup, {
  components: { h1: "h2" },
  sanitize: { allowElements: ["h1", "h2", "h3"] },
});
```

In `ultrahtml@1.x`, `transform` accepts an array of transformers to apply. The `sanitize` and `components` options can be handled with the built-in transformers named `sanitize` and `swap`.

```js
import { transform } from "ultrahtml";
import swap from "ultrahtml/transformers/swap";
import sanitize from "ultrahtml/transformers/sanitize";

await transform(markup, [
  swap({ h1: "h2" }),
  sanitize({ allowElements: ["h1", "h2", "h3"] }),
]);
```

## New Features

### JSX Runtime

`ultrahtml` now comes with `h` and `Fragment` functions for JSX, as well as a `jsx-runtime` export.

### Tranformers

Transformers are AST transformations that can be applied to any `ultrahtml` Node. Usually these are applied to entire documents.

**New** `inline` transformer inlines CSS from `<style>` blocks directly to matching elements.

**New** `scope` transformer scopes CSS from `<style>` blocks to the elements in a given document or component.
