import { describe, expect, it } from "vitest";
import sanitize from "../../src/transformers/sanitize.js";
import { transform } from "../../src/index.js";

describe("sanitize", () => {
  it("drop", async () => {
    const input = `<h1>Hello world!</h1>`;
    const output = await transform(input, [sanitize({ dropElements: ['h1'] })]);
    expect(output).toEqual('');
  });
  it("block", async () => {
    const input = `<h1>Hello world!</h1>`;
    const output = await transform(input, [sanitize({ blockElements: ['h1'] })]);
    expect(output).toEqual('Hello world!');
  });
  it("allow", async () => {
    const input = `<script>console.log("pwnd")</script>`;
    const output = await transform(input, [sanitize({ allowElements: ['script'] })]);
    expect(output).toEqual('<script>console.log("pwnd")</script>');
  });
  it("drop script by default", async () => {
    const input = `<h1>Hello world!</h1><script>console.log("pwnd")</script>`;
    const output = await transform(input, [sanitize()]);
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("explicit components are automatically allowed", async () => {
    const input = `<Test>Hello world!</Test>`;
    const output = await transform(input);
    expect(output).toEqual('<Test>Hello world!</Test>');
  });
  it("attribute drop", async () => {
    const input = `<h1 no="way">Hello world!</h1>`;
    const output = await transform(input, [sanitize({ dropAttributes: { no: ['h1'] }})]);
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("attribute drop *", async () => {
    const input = `<h1 no="way">Hello world!</h1>`;
    const output = await transform(input, [sanitize({ dropAttributes: { no: ['*'] }})]);
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("attribute allow", async () => {
    const input = `<h1 yes="way">Hello world!</h1>`;
    const output = await transform(input, [sanitize({ allowAttributes: { yes: ['h1'] } })]);
    expect(output).toEqual('<h1 yes="way">Hello world!</h1>');
  });
  it("attribute allow", async () => {
    const input = `<h1 yes="way">Hello world!</h1><h2 yes="drop" />`;
    const output = await transform(input, [sanitize({ dropAttributes: { yes: ['*'] }, allowAttributes: { yes: ['h1'] } })]);
    expect(output).toEqual('<h1 yes="way">Hello world!</h1><h2></h2>');
  });
});
