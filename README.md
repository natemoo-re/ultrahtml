# `ultrahtml`

A 1.75kB library for enhancing `html`. `ultrahtml` has zero dependencies and is compatible with any JavaScript runtime.

### Features
- Tiny, XML-friendly parser
- Built-in `transform` utility for easy output manipulation
- Automatic but configurable sanitization, adhering to the [HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer)
- Handy `html` template utility

```js
import { transform, html } from 'ultrahtml';

const output = await transform(`<h1>Hello world!</h1>`, {
  components: {
    h1: (props, children) => html`<h1 class="ultra">${children}</h1>`
  }
})

console.log(output) // <h1 class="ultra">Hello world!</h1>
```

## Acknowledgements

- [Jason Miller](https://twitter.com/_developit)'s [`htmlParser`](https://github.com/developit/htmlParser) provided a great, lightweight base for this parser
- [Titus Wormer](https://twitter.com/wooorm)'s [`mdx`](https://mdxjs.com) for inspiration
