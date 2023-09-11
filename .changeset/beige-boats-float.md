---
"ultrahtml": minor
---

Add support for static media queries to `ultrahtml/transformers/inline`.

You may now pass an `env` value to the transformer, for example:

```js
import { transform } from "ultrahtml";
import inline from "ultrahtml/transformers/inline";

const output = await transform(input, [
  // Acts as if the screen is 960px wide and 1280px tall
  inline({ env: { width: 960, height: 1280 } }),
]);
```
