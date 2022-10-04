import { html, transform } from "../src/";
import { describe, expect, it } from "vitest";

describe("transform", () => {
  it("readme example", async () => {
    const Title = (props, children) => html`<h1 class="ultra" ...${props}>${children}</h1>`;
    const output = await transform(`<h1>Hello world!</h1>`, { components: { h1: Title } })
    expect(output).toEqual(`<h1 class="ultra">Hello world!</h1>`);
  });
  it("transforms custom components", async () => {
    const CustomElement = (props, children) => html`<custom-element class="ultra" ...${props}>${children}</custom-element>`;
    const output = await transform(`<custom-element>Hello world!</custom-element>`, { components: { "custom-element": CustomElement } })
    expect(output).toEqual(`<custom-element class="ultra">Hello world!</custom-element>`);
  })
});
