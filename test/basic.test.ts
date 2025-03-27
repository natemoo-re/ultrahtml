import { parse, render } from '../src/';
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
});
