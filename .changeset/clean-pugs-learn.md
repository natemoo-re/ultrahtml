---
'ultrahtml': patch
---

Fixes sanitization of nested elements.

For example, the following code:

```js
const output = await transform('<h1>Hello <strong>world!</strong></h1>', [
	sanitize({ blockElements: ['h1', 'strong'] }),
]);
```

produced the following output before this fix:

```html
Hello <strong>world!</strong>
```

and now correctly produces:

```html
Hello world!
```
