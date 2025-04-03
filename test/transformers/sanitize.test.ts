import { describe, expect, it } from 'vitest';
import sanitize from '../../src/transformers/sanitize.js';
import { transform } from '../../src/index.js';

describe('sanitize', () => {
	it('drop', async () => {
		const input = `<h1>Hello world!</h1>`;
		const output = await transform(input, [sanitize({ dropElements: ['h1'] })]);
		expect(output).toEqual('');
	});
	it('block', async () => {
		const input = `<h1>Hello world!</h1>`;
		const output = await transform(input, [
			sanitize({ blockElements: ['h1'] }),
		]);
		expect(output).toEqual('Hello world!');
	});
	it('block with multiple elements', async () => {
		const input = `<h1>Hello <strong>world!</strong></h1>`;
		const output = await transform(input, [
			sanitize({ blockElements: ['h1', 'strong'] }),
		]);
		expect(output).toEqual('Hello world!');
	});
	it('allow', async () => {
		const input = `<script>console.log("pwnd")</script>`;
		const output = await transform(input, [
			sanitize({ allowElements: ['script'] }),
		]);
		expect(output).toEqual('<script>console.log("pwnd")</script>');
	});
	describe('unblock', () => {
		it('empty unblock array blocks all elements', async () => {
			const input = `<h1>Hello <strong>world!</strong></h1>`;
			const output = await transform(input, [
				sanitize({ unblockElements: [] }),
			]);
			expect(output).toEqual('Hello world!');
		});
		it('unblock array blocks unlisted elements', async () => {
			const input = `<h1>Hello <strong>world!</strong></h1>`;
			const output = await transform(input, [
				sanitize({ unblockElements: ['strong'] }),
			]);
			expect(output).toEqual('Hello <strong>world!</strong>');
		});
	});
	it('allow drops everything else', async () => {
		const input = `<h1>Hello world!</h1><h4>This is not allowed</h4>`;
		const output = await transform(input, [
			sanitize({ allowElements: ['h1', 'h2', 'h3'] }),
		]);
		expect(output).toEqual('<h1>Hello world!</h1>');
	});
	it('drop script by default', async () => {
		const input = `<h1>Hello world!</h1><script>console.log("pwnd")</script>`;
		const output = await transform(input, [sanitize()]);
		expect(output).toEqual('<h1>Hello world!</h1>');
	});
	it('explicit components are automatically allowed', async () => {
		const input = `<Test>Hello world!</Test>`;
		const output = await transform(input);
		expect(output).toEqual('<Test>Hello world!</Test>');
	});
	it('attribute drop', async () => {
		const input = `<h1 no="way">Hello world!</h1>`;
		const output = await transform(input, [
			sanitize({ dropAttributes: { no: ['h1'] } }),
		]);
		expect(output).toEqual('<h1>Hello world!</h1>');
	});
	it('attribute drop *', async () => {
		const input = `<h1 no="way">Hello world!</h1>`;
		const output = await transform(input, [
			sanitize({ dropAttributes: { no: ['*'] } }),
		]);
		expect(output).toEqual('<h1>Hello world!</h1>');
	});
	it('attribute allow', async () => {
		const input = `<h1 yes="way">Hello world!</h1>`;
		const output = await transform(input, [
			sanitize({ allowAttributes: { yes: ['h1'] } }),
		]);
		expect(output).toEqual('<h1 yes="way">Hello world!</h1>');
	});
	it('attribute allow', async () => {
		const input = `<h1 yes="way">Hello world!</h1><h2 yes="drop" />`;
		const output = await transform(input, [
			sanitize({
				dropAttributes: { yes: ['*'] },
				allowAttributes: { yes: ['h1'] },
			}),
		]);
		expect(output).toEqual('<h1 yes="way">Hello world!</h1><h2></h2>');
	});
	it('gracefully handles invalid drop', async () => {
		const input = `<a href=\"https://example.com\">Hello world!</a>`;
		const output = await transform(input, [
			sanitize({ dropAttributes: { nonexistent: ['a'] } }),
		]);
		expect(output).toEqual(`<a href=\"https://example.com\">Hello world!</a>`);
	});
	it('gracefully handles invalid allow', async () => {
		const input = `<a href=\"https://example.com\">Hello world!</a>`;
		const output = await transform(input, [
			sanitize({ allowAttributes: { nonexistent: ['a'] } }),
		]);
		expect(output).toEqual(`<a href=\"https://example.com\">Hello world!</a>`);
	});
});
