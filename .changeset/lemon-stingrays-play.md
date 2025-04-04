---
"ultrahtml": minor
---

Adds a new `transformSync` function, a synchronous alternative to the `transform` function. This can be used when there are no `async` transformer functions.

```js
import { transformSync, html } from "ultrahtml";
import swap from "ultrahtml/transformers/swap";

const output = transformSync(`<h1>Hello world!</h1>`, [
  swap({
    h1: "h2",
  })
]);

console.log(output); // <h2>Hello world!</h2>
```
