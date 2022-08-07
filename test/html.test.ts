import { html } from "../src/";
import { describe, expect, it } from "vitest";

describe("html", () => {
  it("works", () => {
    const { value } = html`<h1>${"Hello world!"}</h1>`;
    expect(value).toEqual(`<h1>Hello world!</h1>`);
  })
  it("escapes", () => {
    const { value } = html`<h1>${"<div></div>"}</h1>`;
    expect(value).toEqual(`<h1>&lt;div&gt;&lt;/div&gt;</h1>`);
  })
  it("nested", () => {
    const { value } = html`<h1>${html`<div></div>`}</h1>`;
    expect(value).toEqual(`<h1><div></div></h1>`);
  })
});
