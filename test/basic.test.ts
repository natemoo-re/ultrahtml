import { ELEMENT_NODE, parse, render } from '../src/';
import type { ElementNode, Node } from '../src/';
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
	it('with > in double quotes', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a="1 > 0" b="c"></div>`);
		expect(attributes).toMatchObject({ a: '1 > 0', b: 'c' });
	});
	it('with > in single quotes', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a='1 > 0' b="c"></div>`);
		expect(attributes).toMatchObject({ a: '1 > 0', b: 'c' });
	});
	it('with > in a self-closing tag', async () => {
		const { children } = parse(`<a><b :action="() => fn()" /></a><c></c>`);
		const [a, c] = children.filter(
			(node: Node): node is ElementNode => node.type === ELEMENT_NODE,
		);
		expect(a.loc).toHaveLength(2);
		expect(a.children).toHaveLength(1);
		expect(a.children[0]).toMatchObject({
			name: 'b',
			attributes: { ':action': '() => fn()' },
		});
		expect(c.name).toBe('c');
	});
	it('with > and spaces around =', async () => {
		const {
			children: [{ attributes }],
		} = parse(`<div a = "1 > 0" b></div>`);
		expect(attributes).toMatchObject({ a: '1 > 0', b: '' });
	});
	it('with a quote in an unquoted value', async () => {
		const { children } = parse(`<p a=it's>x</p><p b='c'>y</p>`);
		const [first, second] = children.filter(
			(node: Node): node is ElementNode => node.type === ELEMENT_NODE,
		);
		expect(first.children).toHaveLength(1);
		expect(second.attributes).toMatchObject({ b: 'c' });
	});
	it('with an unclosed quote', async () => {
		const { children } = parse(`<div a="b>text</div><p>ok</p>`);
		const elements = children.filter(
			(node: Node): node is ElementNode => node.type === ELEMENT_NODE,
		);
		expect(elements.map((node) => node.name)).toEqual(['div', 'p']);
	});
});
