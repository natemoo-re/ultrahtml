import $, { querySelector, querySelectorAll } from '../src/selector';
import { parse, render } from '../src';
import { describe, expect, it, test } from 'vitest';

test('sanity', () => {
	expect(querySelector).toBeTypeOf('function');
	expect(querySelectorAll).toBeTypeOf('function');
	expect($).toBeTypeOf('function');
	expect($).toEqual(querySelectorAll);
});

describe('type selector', () => {
	it('type', async () => {
		const input = `<h1>Hello world!</h1>`;
		const output = await render(querySelector(parse(input), 'h1'));
		expect(output).toEqual(input);
	});
	it('compound type class', async () => {
		const input = `<h1 class="foo">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1.foo')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 class="foo">Hello world!</h1>`);
	});
	it('compound type attribute', async () => {
		const input = `<h1 data-test>Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="">Hello world!</h1>`);
	});
	it('compound type attribute = case sensitive', async () => {
		const input = `<h1 data-test="foo">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test="FOO"]')[0];
		expect(el).toBeUndefined();
	});
	it('compound type attribute = case insensitive', async () => {
		const input = `<h1 data-test="foo">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test="FOO" i]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="foo">Hello world!</h1>`);
	});
	it('compound type attribute =', async () => {
		const input = `<h1 data-test="foo">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test="foo"]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="foo">Hello world!</h1>`);
	});
	it('compound type attribute ~=', async () => {
		const input = `<h1 data-test="a b foo">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test~="foo"]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="a b foo">Hello world!</h1>`);
	});
	it('compound type attribute *=', async () => {
		const input = `<h1 data-test="awesomefoobar">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test*="foo"]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="awesomefoobar">Hello world!</h1>`);
	});
	it('compound type attribute $=', async () => {
		const input = `<h1 data-test="awesomefoobar.com">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test$=".com"]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(
			`<h1 data-test="awesomefoobar.com">Hello world!</h1>`,
		);
	});
	it('compound type attribute ^=', async () => {
		const input = `<h1 data-test="awesomefoobar">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test^="awe"]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="awesomefoobar">Hello world!</h1>`);
	});
	it('compound type attribute |=', async () => {
		const input = `<h1 data-test="en-US">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(parse(input), 'h1[data-test|="en"]')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<h1 data-test="en-US">Hello world!</h1>`);
	});
	it('compound type attributes', async () => {
		const input = `<h1 data-test="https://astro.com">Hello world!</h1><h1>No</h1>`;
		const el = querySelectorAll(
			parse(input),
			'h1[data-test^="https://"][data-test$=.com]',
		)[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(
			`<h1 data-test="https://astro.com">Hello world!</h1>`,
		);
	});
});

describe('id selector', () => {
	it('id', async () => {
		const input = `<h1 id="foo">Hello world!</h1>`;
		const output = await render(querySelectorAll(parse(input), '#foo')[0]);
		expect(output).toEqual(input);
	});
});

describe('list selector', () => {
	it('list', async () => {
		const input = `<h1>Hello world!</h1><h2>Goodbye world!</h2>`;
		const els = querySelectorAll(parse(input), 'h1, h2');
		expect(els.length).toEqual(2);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual(input);
	});
});

describe('complex selector', () => {
	it('deep', async () => {
		const input = `<h1>Hello <div><div><span>world</span></div></div>!</h1>`;
		const el = querySelectorAll(parse(input), 'h1 span')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('>', async () => {
		const input = `<h1>Hello <span>world</span>!</h1>`;
		const el = querySelectorAll(parse(input), 'h1 > span')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('~', async () => {
		const input = `<span>world</span> <span>!</span>`;
		const el = querySelectorAll(parse(input), 'span ~ span')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>!</span>');
	});
	it('* + *', async () => {
		const input = `<h1>Hello</h1> <span>world</span> <p>!</p>`;
		const el = querySelectorAll(parse(input), '* + *');
		expect(el).toBeDefined();
		expect(el.length).toEqual(2);
		const a = await render(el[0]);
		const b = await render(el[1]);
		expect(a).toEqual('<span>world</span>');
		expect(b).toEqual('<p>!</p>');
	});
});

describe('pseudo-class', () => {
	it('root', async () => {
		const input = `<html><h1>Hello <span>world</span></h1></html>`;
		const el = querySelectorAll(parse(input), ':root')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(input);
	});
	it('empty', async () => {
		const input = `<html><h1>Hello <span></span></h1></html>`;
		const el = querySelectorAll(parse(input), ':empty')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<span></span>`);
	});
	it('first-child', async () => {
		const input = `<h1>Hello <span>world</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:first-child')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('only-child', async () => {
		const input = `<h1>Hello <span>world</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:only-child')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('last-child', async () => {
		const input = `<h1>Hello <span>world</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:last-child')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('nth-child(1)', async () => {
		const input = `<h1>Hello <span>world</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:nth-child(1)')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('nth-child(odd)', async () => {
		const input = `<h1>Hello <span>world</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:nth-child(odd)')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('nth-child(even)', async () => {
		const input = `<h1>Hello <span>world</span><span>!</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:nth-child(even)')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>!</span>');
	});
	it('nth-child(2n + 1)', async () => {
		const input = `<h1>Hello <span>world</span><span>!</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:nth-child(2n + 1)')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>world</span>');
	});
	it('nth-child(2n)', async () => {
		const input = `<h1>Hello <span>world</span><span>!</span></h1>`;
		const el = querySelectorAll(parse(input), 'span:nth-child(2n)')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual('<span>!</span>');
	});
	it('nth-child(3n)', async () => {
		const input = `<h1><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span></h1>`;
		const els = querySelectorAll(parse(input), 'span:nth-child(3n)');
		expect(els.length).toBe(2);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual('<span>c</span><span>f</span>');
	});
	it('nth-child(n+4)', async () => {
		const input = `<h1><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span></h1>`;
		const els = querySelectorAll(parse(input), 'span:nth-child(n+4)');
		expect(els.length).toBe(3);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual('<span>d</span><span>e</span><span>f</span>');
	});
	it('nth-child(n + 4)', async () => {
		const input = `<h1><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span></h1>`;
		const els = querySelectorAll(parse(input), 'span:nth-child(n + 4)');
		expect(els.length).toBe(3);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual('<span>d</span><span>e</span><span>f</span>');
	});
	it('nth-child(2n+4)', async () => {
		const input = `<h1><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span></h1>`;
		const els = querySelectorAll(parse(input), 'span:nth-child(2n+4)');
		expect(els.length).toBe(2);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual('<span>d</span><span>f</span>');
	});
	it('nth-child(-n+3)', async () => {
		const input = `<h1><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span></h1>`;
		const els = querySelectorAll(parse(input), 'span:nth-child(-n+3)');
		expect(els.length).toBe(3);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual('<span>a</span><span>b</span><span>c</span>');
	});
	it('nth-child(n+3):nth-child(-n+5)', async () => {
		const input = `<h1><span>a</span><span>b</span><span>c</span><span>d</span><span>e</span><span>f</span></h1>`;
		const els = querySelectorAll(
			parse(input),
			'span:nth-child(n+3):nth-child(-n+5)',
		);
		expect(els.length).toBe(3);
		const output = await (await Promise.all(els.map((el) => render(el)))).join(
			'',
		);
		expect(output).toEqual('<span>c</span><span>d</span><span>e</span>');
	});
});

describe('functional pseudo-class', () => {
	it('not', async () => {
		const input = `<html><h1><span id="foo">Hello</span><span id="bar">world</span></h1></html>`;
		const el = querySelectorAll(parse(input), 'h1 > span:not(#foo)')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<span id="bar">world</span>`);
	});
	it('is', async () => {
		const input = `<html><h1><span id="foo">Hello</span><span id="bar">world</span></h1></html>`;
		const el = querySelectorAll(parse(input), 'h1 > span:is(#foo, [id])')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<span id="foo">Hello</span>`);
	});
	it('where', async () => {
		const input = `<html><h1><span id="foo">Hello</span><span id="bar">world</span></h1></html>`;
		const el = querySelectorAll(parse(input), 'h1 > span:where(#foo, [id])')[0];
		expect(el).toBeDefined();
		const output = await render(el);
		expect(output).toEqual(`<span id="foo">Hello</span>`);
	});
});
