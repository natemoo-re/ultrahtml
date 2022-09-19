# `ultrahtml`

A tiny library for enhancing `html`, inspired by [MDX](https://mdxjs.com/).

```js
import { transform, html } from 'ultrahtml';

const output = await transform(`<h1>Hello world!</h1>`, {
  components: {
    h1: (props, children) => html`<h1 class="ultra">${children}</h1>`
  }
})

console.log(output) // <h1 class="ultra">Hello world!</h1>
```

## TODO: docs

## Acknowledgements

- [Jason Miller](https://twitter.com/_developit)'s [`htmlParser`](https://github.com/developit/htmlParser) provided a great, lightweight base for this parser
- [Titus Wormer](https://twitter.com/wooorm)'s [`mdx`](https://mdxjs.com) for inspiration
