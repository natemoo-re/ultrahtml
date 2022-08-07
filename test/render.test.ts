import { html, parse, render } from "../src/";
import { describe, expect, it } from "vitest";

describe("render API", () => {
  it("function for element", async () => {
    const components = {
      h1: (_, children) => html`<span>${children}</span>`,
    };
    const input = `<h1>Hello world!</h1>`;
    const output = await render(parse(input), { components });
    expect(output).toEqual(`<span>Hello world!</span>`);
  });
  it("function for component", async () => {
    const components = {
      Title: (_, children) => html`<h1>${children}</h1>`,
    };
    const input = `<Title>Hello world!</Title>`;
    const output = await render(parse(input), { components });
    expect(output).toEqual(`<h1>Hello world!</h1>`);
  });
  it("string for element to Component", async () => {
    const components = {
      h1: "Title",
      Title: (_, children) => html`<span>${children}</span>`,
    };
    const input = `<h1>Hello world!</h1>`;
    const output = await render(parse(input), { components });
    expect(output).toEqual(`<span>Hello world!</span>`);
  });
  it("string for element to Component", async () => {
    const components = {
      h1: "Title",
      Title: (_, children) => html`<span>${children}</span>`,
    };
    const input = `<h1>Hello world!</h1>`;
    const output = await render(parse(input), { components });
    expect(output).toEqual(`<span>Hello world!</span>`);
  });
  it("async Component", async () => {
    const components = {
      Title: async (_, children) => html`<span>${children}</span>`,
    };
    const input = `<Title>Hello world!</Title>`;
    const output = await render(parse(input), { components });
    expect(output).toEqual(`<span>Hello world!</span>`);
  });
});
