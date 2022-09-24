# `ultrahtml`

A 1.75kB library for enhancing `html`. `ultrahtml` has zero dependencies and is compatible with any JavaScript runtime.

### Features
- Tiny, fault-tolerant and friendly HTML-like parser. Works with HTML, Astro, Vue, Svelte, and any other HTML-like syntax.
- Built-in AST `walk` utility
- Built-in `transform` utility for easy output manipulation
- Automatic but configurable sanitization, adhering to the [HTML Sanitizer API](https://developer.mozilla.org/en-US/docs/Web/API/Sanitizer/Sanitizer)
- Handy `html` template utility

#### `walk`

The `walk` function provides full control over the AST. It can be used to scan for text, elements, components, or any other validation you might want to do.

```js
import { parse, walk, ELEMENT_NODE } from 'ultrahtml';

const ast = parse(`<h1>Hello world!</h1>`);
walk(ast, (node) => {
  if (node.type === ELEMENT_NODE && node.name === 'script') {
    throw new Error('Found a script!')
  }
})
```

#### `render`

The `render` function allows you to serialize an AST back into a string.

```js
import { parse, render } from 'ultrahtml';

const ast = parse(`<h1>Hello world!</h1>`);
const output = await render(ast);
```

#### `transform`

The `transform` function provides a straight-forward way to swap in-place elements (or Components) and update them with a new value.

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
