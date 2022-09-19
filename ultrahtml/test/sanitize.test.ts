import { parse, render } from "../src/";
import { describe, expect, it } from "vitest";

describe("sanitize", () => {
  it("drop", async () => {
    const input = `<h1>Hello world!</h1>`;
    const output = await render(parse(input), { sanitize: { dropElements: ['h1'] } });
    expect(output).toEqual('');
  });
  it("block", async () => {
    const input = `<h1>Hello world!</h1>`;
    const output = await render(parse(input), { sanitize: { blockElements: ['h1'] } });
    expect(output).toEqual('Hello world!');
  });
  it("allow", async () => {
    const input = `<script>console.log("pwnd")</script>`;
    const output = await render(parse(input), { sanitize: { allowElements: ['script'] } });
    expect(output).toEqual('<script>console.log("pwnd")</script>');
  });
  it("drop script by default", async () => {
    const input = `<h1>Hello world!</h1><script>console.log("pwnd")</script>`;
    const output = await render(parse(input));
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("explicit components are automatically allowed", async () => {
    const input = `<Test>Hello world!</Test>`;
    const output = await render(parse(input), { components: { Test: 'h1' }});
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("attribute drop", async () => {
    const input = `<h1 no="way">Hello world!</h1>`;
    const output = await render(parse(input), { sanitize: { dropAttributes: { no: ['h1'] }}});
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("attribute drop *", async () => {
    const input = `<h1 no="way">Hello world!</h1>`;
    const output = await render(parse(input), { sanitize: { dropAttributes: { no: ['*'] }}});
    expect(output).toEqual('<h1>Hello world!</h1>');
  });
  it("attribute allow", async () => {
    const input = `<h1 yes="way">Hello world!</h1>`;
    const output = await render(parse(input), { sanitize: { allowAttributes: { yes: ['h1'] } }});
    expect(output).toEqual('<h1 yes="way">Hello world!</h1>');
  });
  it("attribute allow", async () => {
    const input = `<h1 yes="way">Hello world!</h1><h2 yes="drop" />`;
    const output = await render(parse(input), { sanitize: { dropAttributes: { yes: ['*'] }, allowAttributes: { yes: ['h1'] } }});
    expect(output).toEqual('<h1 yes="way">Hello world!</h1><h2></h2>');
  });
});
