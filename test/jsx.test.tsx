import { h } from '../src/index.js';
import { describe, expect, it } from 'vitest';
import { render } from '../src/index';

describe('jsx', () => {
	it('works', async () => {
		const value = await render(<h1>Hello world!</h1>);
		expect(value).toEqual(`<h1>Hello world!</h1>`);
	});
	it('escapes', async () => {
		const value = await render(<h1>{'<div></div>'}</h1>);
		expect(value).toEqual(`<h1>&lt;div&gt;&lt;/div&gt;</h1>`);
	});
	it('nested', async () => {
		const value = await render(<h1>{<div></div>}</h1>);
		expect(value).toEqual(`<h1><div></div></h1>`);
	});
	it('attrs', async () => {
		const value = await render(<h1 hey="ya"></h1>);
		expect(value).toEqual(`<h1 hey="ya"></h1>`);
	});
	it('spread', async () => {
		const value = await render(<h1 {...{ hey: 'ya' }}></h1>);
		expect(value).toEqual(`<h1 hey="ya"></h1>`);
	});
});
