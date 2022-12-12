import { describe, it, expect } from "vitest";
import { h, Fragment, parse, transform } from "../../src/index";
import inline from "../../src/transformers/inline";
import { setTimeout as sleep } from "timers/promises";

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

  it("inline styles with class", async () => {
    const input = `<div class="cool">Hello world</div>
      <style>
        .cool {
          color: red;
        }
      </style>`;
    const output = await transform(input, [inline()]);
    expect(output.trim()).toEqual(
      `<div class="cool" style="color:red;">Hello world</div>`
    );
  });
});

describe("inline jsx", () => {
  it("works with a simple input", async () => {
    const input = (
      <>
        <div>Hello world</div>
        <style>{`div { color: red; }`}</style>
      </>
    );
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
  });

  it("works with multiple inputs", async () => {
    const input = (
      <>
        <div>Hello world</div>
        <style>{`div { color: green; }`}</style>
        <style>{`div { color: red; }`}</style>
      </>
    );
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
  });

  it("inline styles override external", async () => {
    const input = (
      <>
        <div style="color:blue;">Hello world</div>
        <style>{`div { color: red; }`}</style>
      </>
    );
    const output = await transform(input, [inline()]);
    expect(output).toEqual(`<div style="color:blue;">Hello world</div>`);
  });
});

describe("object syntax", () => {
  it("emits style as object", async () => {
    const inliner = inline({ useObjectSyntax: true });
    const input = `<div>Hello world</div><style>div { color: red; }</style>`;
    const doc = await parse(input);
    const output = inliner(doc);
    expect(output.children[0].attributes.style).toEqual({ color: "red" });
  });

  it("emits plain style attribute as object", async () => {
    const inliner = inline({ useObjectSyntax: true });
    const input = `<div style="color: blue;">Hello world</div>`;
    const doc = await parse(input);
    const output = inliner(doc);
    expect(output.children[0].attributes.style).toEqual({ color: "blue" });
  });

  it("works for complex properties", async () => {
    const inliner = inline({ useObjectSyntax: true });
    const input = `
      <div>Hello world</div>
      <style>
        div {
          background: linear-gradient(135deg, #ef629f, #eecda3);
          display: flex;
          width: 100%;
          height: 100%;
        }
      </style>
    `.trim();
    const doc = await parse(input);
    const output = inliner(doc);
    expect(output.children[0].attributes.style).toEqual({
      background: "linear-gradient(135deg, #ef629f, #eecda3)",
      display: "flex",
      width: "100%",
      height: "100%",
    });
  });
});

// describe("inline link", () => {
//   it("works with sync resolveAsset", async () => {
//     const input = `<link rel="stylesheet" href="/assets/1.css" /><div>Hello world</div>`;
//     const output = await transform(input, [
//       inline({
//         resolveAsset({ attributes: { href } }) {
//           if (href === "/assets/1.css") {
//             return "div{color:red;}";
//           }
//         },
//       }),
//     ]);
//     expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
//   });
//   it("ignores unresolved assets", async () => {
//     const input = `<link rel="stylesheet" href="/assets/1.css"><div>Hello world</div>`;
//     const output = await transform(input, [
//       inline({
//         resolveAsset({ attributes: { href } }) {
//           if (href === "/assets/1.css") {
//             return;
//           }
//         },
//       }),
//     ]);
//     expect(output).toEqual(input);
//   });
//   it("works with async resolveAsset", async () => {
//     const input = `<link rel="stylesheet" href="/assets/1.css" /><div>Hello world</div>`;
//     const output = await transform(input, [
//       inline({
//         async resolveAsset({ attributes: { href } }) {
//           if (href === "/assets/1.css") {
//             return "div{color:red;}";
//           }
//         },
//       }),
//     ]);
//     expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
//   });
//   it("works with multiple inputs", async () => {
//     const input = `<link rel="stylesheet" href="/assets/1.css" /><link rel="stylesheet" href="/assets/2.css" /><div>Hello world</div>`;
//     const output = await transform(input, [
//       inline({
//         resolveAsset({ attributes: { href } }) {
//           if (href === "/assets/1.css") {
//             return "div{color:green;}";
//           }
//           if (href === "/assets/2.css") {
//             return "div{color:red;}";
//           }
//         },
//       }),
//     ]);
//     expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
//   });
//   it("works with multiple inputs and maintains order", async () => {
//     const input = `<link rel="stylesheet" href="/assets/1.css" /><link rel="stylesheet" href="/assets/2.css" /><div>Hello world</div>`;
//     const output = await transform(input, [
//       inline({
//         async resolveAsset({ attributes: { href } }) {
//           if (href === "/assets/1.css") {
//             await sleep(200)
//             return "div{color:green;}";
//           }
//           if (href === "/assets/2.css") {
//             return "div{color:red;}";
//           }
//         },
//       }),
//     ]);
//     expect(output).toEqual(`<div style="color:red;">Hello world</div>`);
//   });
// });
