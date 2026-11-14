import { parse, render, renderSync } from '../src/';
import { describe, expect, it, test } from 'vitest';

test('sanity', () => {
	expect(parse).toBeTypeOf('function');
});

describe('input === output', () => {
	it('works for elements', async () => {
		const input = `<h1>Hello world!</h1>`;
		const output = await render(parse(input));
		expect(output).toEqual(input);
	});
	it('works for custom elements', async () => {
		const input = `<custom-element>Hello world!</custom-element>`;
		const output = await render(parse(input));
		expect(output).toEqual(input);
	});
	it('works for comments', async () => {
		const input = `<!--foobar-->`;
		const output = await render(parse(input));
		expect(output).toEqual(input);
	});
	it('works for text', async () => {
		const input = `Hmm...`;
		const output = await render(parse(input));
		expect(output).toEqual(input);
	});
	it('works for doctype', async () => {
		const input = `<!DOCTYPE html>`;
		const output = await render(parse(input));
		expect(output).toEqual(input);
	});
	it('works for html:5', async () => {
		const input = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body></body></html>`;
		const output = await render(parse(input));

		expect(output).toEqual(input);
	});
});

describe('attributes', () => {
	it('simple', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a="b" c="1"></div>`);
		expect(attributes).toMatchObject({ a: 'b', c: '1' });
	});
	it('empty', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div test></div>`);
		expect(attributes).toMatchObject({ test: '' });
	});
	it('@', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div @on.click="doThing"></div>`);
		expect(attributes).toMatchObject({ '@on.click': 'doThing' });
	});
	it('namespace', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div on:click="alert()"></div>`);
		expect(attributes).toMatchObject({ 'on:click': 'alert()' });
	});
	it('simple and empty', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div test a="b" c="1"></div>`);
		expect(attributes).toMatchObject({ test: '', a: 'b', c: '1' });
	});
	it('with linebreaks', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a="1
2
3"></div>`);
		expect(attributes).toMatchObject({ a: '1\n2\n3' });
	});
	it('with single quote', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a="nate'
s"></div>`);
		expect(attributes).toMatchObject({ a: "nate'\ns" });
	});
	it('with escaped double quote', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a="&quot;never
more&quot;"></div>`);
		expect(attributes).toMatchObject({ a: '&quot;never\nmore&quot;' });
	});
	it('renders a double quote inside a single-quoted value', async () => {
		const input = `<p title='a"b'>x</p>`;
		const output = await render(parse(input));
		expect(output).toEqual(`<p title="a&quot;b">x</p>`);
		expect(parse(output).children[0].attributes).toEqual({
			title: 'a&quot;b',
		});
	});
	it('does not let a quoted value add attributes on render', async () => {
		const input = `<p title='x" onclick="alert(1)'>hi</p>`;
		const output = await render(parse(input));
		expect(output).toEqual(`<p title="x&quot; onclick=&quot;alert(1)">hi</p>`);
		expect(Object.keys(parse(output).children[0].attributes)).toEqual([
			'title',
		]);
	});
	it('escapes double quotes in renderSync', () => {
		const output = renderSync(parse(`<p title='a"b'>x</p>`));
		expect(output).toEqual(`<p title="a&quot;b">x</p>`);
	});
});
