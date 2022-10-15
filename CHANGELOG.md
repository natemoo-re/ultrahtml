# ultrahtml

## 0.4.0

### Minor Changes

- 83c2e35: Improve declarations for node types

## 0.3.3

### Patch Changes

- 3b8fb6e: Remove bundledDependencies field

## 0.3.2

### Patch Changes

- 74010dd: Bundle parsel-js to avoid ESM/CJS issues
- d7b514d: Fix CJS compat issue (again)

## 0.3.1

### Patch Changes

- a105c5e: Fix CJS compat issue

## 0.3.0

### Minor Changes

- 2de70f3: Add `ultrahtml/selector` module which exports `querySelector`, `querySelectorAll`, and `matches` functions.

  To use `querySelectorAll`, pass the root `Node` as the first argument and any valid CSS selector as the second argument. Note that if a CSS selector you need is not yet implemented, you are invited to [open an issue](https://github.com/natemoo-re/ultrahtml/issues).

  ```js
  import { parse } from "ultrahtml";
  import { querySelectorAll, matches } from "ultrahtml/selector";

  const doc = parse(`
  <html>
      <head>
          <title>Demo</title>
      /head>
      <body>
          <h1>Hello world!</h1>
      </body>
  </html>
  `);
  const h1 = querySelector(doc, "h1");
  const match = matches(h1, "h1");
  ```

## 0.2.1

### Patch Changes

- 037711f: Update types

## 0.2.0

### Minor Changes

- 97b297f: Add `walkSync` export

## 0.1.3

### Patch Changes

- 123f7ea: Fix custom elements transform.

## 0.1.2

### Patch Changes

- 758bbba: Improve documentation

## 0.1.1

### Patch Changes

- 2f92e93: Export node types

## 0.1.0

### Minor Changes

- 517e24d: Fix edge cases with text node detection, refactor for compactness

## 0.0.5

### Patch Changes

- 23771a3: Fix `walk` function definition

## 0.0.4

### Patch Changes

- 4d082b3: Ensure types are included

## 0.0.3

### Patch Changes

- e0e8a2b: Add `__unsafeHTML` export

## 0.0.2

### Patch Changes

- f6e3a71: Support async components
