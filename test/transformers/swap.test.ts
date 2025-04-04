import { html, transform } from '../../src/index.js';
import swap from '../../src/transformers/swap.js';
import { describe, expect, it } from 'vitest';

describe('html API', () => {
	it('function for element', async () => {
		const components = {
			h1: (_, children) => html`<span>${children}</span>`,
		};
		const input = `<h1>Hello world!</h1>`;
		const output = await transform(input, [swap(components)]);
		expect(output).toEqual(`<span>Hello world!</span>`);
	});
	it('function for component', async () => {
		const components = {
			Title: (_, children) => html`<h1>${children}</h1>`,
		};
		const input = `<Title>Hello world!</Title>`;
		const output = await transform(input, [swap(components)]);
		expect(output).toEqual(`<h1>Hello world!</h1>`);
	});
	it('string for element to Component', async () => {
		const components = {
			h1: 'Title',
			Title: (_, children) => html`<span>${children}</span>`,
		};
		const input = `<h1>Hello world!</h1>`;
		const output = await transform(input, [swap(components)]);
		expect(output).toEqual(`<span>Hello world!</span>`);
	});
	it('string for element to Component', async () => {
		const components = {
			h1: 'Title',
			Title: (_, children) => html`<span>${children}</span>`,
		};
		const input = `<h1>Hello world!</h1>`;
		const output = await transform(input, [swap(components)]);
		expect(output).toEqual(`<span>Hello world!</span>`);
	});
	it('async Component', async () => {
		const components = {
			Title: async (_, children) => html`<span>${children}</span>`,
		};
		const input = `<Title>Hello world!</Title>`;
		const output = await transform(input, [swap(components)]);
		expect(output).toEqual(`<span>Hello world!</span>`);
	});

	it('readme example', async () => {
		const Title = (props, children) =>
			html`<h1 class="ultra" ...${props}>${children}</h1>`;
		const output = await transform(`<h1>Hello world!</h1>`, [
			swap({ h1: Title }),
		]);
		expect(output).toEqual(`<h1 class="ultra">Hello world!</h1>`);
	});
	it('transforms custom components', async () => {
		const CustomElement = (props, children) =>
			html`<custom-element class="ultra" ...${props}>${children}</custom-element>`;
		const output = await transform(
			`<custom-element>Hello world!</custom-element>`,
			[swap({ 'custom-element': CustomElement })],
		);
		expect(output).toEqual(
			`<custom-element class="ultra">Hello world!</custom-element>`,
		);
	});
});
