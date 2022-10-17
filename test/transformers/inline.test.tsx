import { describe, it, expect } from "vitest";
import { h, Fragment, transform } from '../../src/index'
import inline from '../../src/transformers/inline';

describe("inline", () => {
  it("works with a simple input", async () => {
    const input = `<div>Hello world</div><style>div { color: red; }</style>`;
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
  });

  it("works with multiple inputs", async () => {
    const input = `<div>Hello world</div><style>div { color: green; }</style><style>div { color: red; }</style>`;
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
  });

  it("inline styles override external", async () => {
    const input = `<div style="color:blue;">Hello world</div><style>div { color: red; }</style>`;
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:blue;">Hello world</div>`);
  });
})

describe("inline jsx", () => {
  it("works with a simple input", async () => {
    const input = <><div>Hello world</div><style>{`div { color: red; }`}</style></>;
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
  });

  it("works with multiple inputs", async () => {
    const input = <><div>Hello world</div><style>{`div { color: green; }`}</style><style>{`div { color: red; }`}</style></>;
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
  });

  it("inline styles override external", async () => {
    const input = <><div style="color:blue;">Hello world</div><style>{`div { color: red; }`}</style></>;
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:blue;">Hello world</div>`);
  });
})
