import { describe, it, expect } from 'vitest';
import { h, Fragment, transform } from '../../src/index';
import scope from '../../src/transformers/scope';

describe('scope', () => {
	it('works with a simple input', async () => {
		const input = `<div>Hello world</div><style>div { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div data-scope="XXX">Hello world</div><style>div:where([data-scope="XXX"]){color:red;}</style>`,
		);
	});

	it('only scopes seen selectors', async () => {
		const input = `<div>Hello <span>world</span></div><style>div { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div data-scope="XXX">Hello <span>world</span></div><style>div:where([data-scope="XXX"]){color:red;}</style>`,
		);
	});

	it('keeps unmatched selectors', async () => {
		const input = `<div>Hello world</div><style>div#foo { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div>Hello world</div><style>div#foo:where([data-scope="XXX"]){color:red;}</style>`,
		);
	});

	it('keeps unmatched :global selectors', async () => {
		const input = `<div>Hello world</div><style>:global(div#foo) { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div>Hello world</div><style>div#foo{color:red;}</style>`,
		);
	});

	it('keeps :root selector', async () => {
		const input = `<div>Hello world</div><style>:root { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div>Hello world</div><style>:root{color:red;}</style>`,
		);
	});
	it('scopes div > * + *  selector', async () => {
		const input = `<div><span>Hello</span><span>world</span><span>!</span></div><style>div > * + * { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div><span>Hello</span><span>world</span><span>!</span></div><style>div:where([data-scope="XXX"])>*:where([data-scope="XXX"])+*:where([data-scope="XXX"]){color:red;}</style>`,
		);
	});
	it('keeps div > :global(* + *) selector', async () => {
		const input = `<div><span>Hello</span><span>world</span><span>!</span></div><style>div > :global(* + *) { color: red; }</style>`;
		const output = await transform(input, [scope({ hash: 'XXX' })]);
		expect(output).toEqual(
			`<div><span>Hello</span><span>world</span><span>!</span></div><style>div:where([data-scope="XXX"])>* + *{color:red;}</style>`,
		);
	});
});

describe('attribute', () => {
	it('ignores style without attribute', async () => {
		const input = `<div>Hello world</div><style>div { color: red; }</style>`;
		const output = await transform(input, [
			scope({ hash: 'XXX', attribute: 'scoped' }),
		]);
		expect(output).toEqual(
			`<div>Hello world</div><style>div { color: red; }</style>`,
		);
	});
	it('scopes style with attribute', async () => {
		const input = `<div>Hello world</div><style scoped>div { color: red; }</style>`;
		const output = await transform(input, [
			scope({ hash: 'XXX', attribute: 'scoped' }),
		]);
		expect(output).toEqual(
			`<div data-scope="XXX">Hello world</div><style>div:where([data-scope="XXX"]){color:red;}</style>`,
		);
	});
});

describe('scope jsx', () => {
	it('works with a simple input', async () => {
		const input = (
			<>
				<div>Hello world</div>
				<style scoped>{`div { color: red; }`}</style>
			</>
		);
		const output = await transform(input, [
			scope({ hash: 'XXX', attribute: 'scoped' }),
		]);
		expect(output).toEqual(
			`<div data-scope="XXX">Hello world</div><style>div:where([data-scope="XXX"]){color:red;}</style>`,
		);
	});
});
