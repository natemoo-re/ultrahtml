import { html, transform } from "../src/";
import { describe, expect, it } from "vitest";

describe("transform", () => {
  it("readme example", async () => {
    const Title = (props, children) => html`<h1 class="ultra" ...${props}>${children}</h1>`;
    const output = await transform(`<h1>Hello world!</h1>`, { components: { h1: Title } })
    expect(output).toEqual(`<h1 class="ultra">Hello world!</h1>`);
  });
});
