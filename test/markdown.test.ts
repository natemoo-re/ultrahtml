import { html, attrs, parse, render } from '../src/';
import { describe, expect, it } from 'vitest';
import Markdown from 'markdown-it';

const md = new Markdown();

const src = `Token CSS is a new tool that seamlessly integrates [Design Tokens](https://design-tokens.github.io/community-group/format/#design-token) into your development workflow. Conceptually, it is similar to tools
like [Tailwind](https://tailwindcss.com), [Styled System](https://styled-system.com/), and many CSS-in-JS libraries that provide tokenized _constraints_ for your styles&mdash;but there's one big difference.

# Hello world!

**Token CSS embraces \`.css\` files and \`<style>\` blocks.**
`;

describe('markdown', () => {
	it('works', async () => {
		const input = md.render(src);
		const output = await render(parse(input));
		expect(input).eq(output);
	});
});
