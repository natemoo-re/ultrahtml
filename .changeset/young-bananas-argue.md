---
"ultrahtml": minor
---

Add `ultrahtml/selector` module which exports `querySelector`, `querySelectorAll`, and `matches` functions.

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
