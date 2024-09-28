import { parse, render } from "../src";
import { describe, expect, it, test } from "vitest";

describe("astro", () => {
  it("handles expressions", async () => {
    const input = `---
let value: string;
---

<h1>Hello {world}</h1>
<Component a="1" b="2" c={\`three\`} items={astro.map((item: string) => {
  const value: string = item.split('').reverse().join('');
  return value;
})}>Hello world</Component>`;
    const doc = parse(input);
    const output = await render(doc);
    expect(output).toEqual(input);
  });

  it("handles invalid expressions", async () => {
    const input = `---
let value = { awesome: { }};
---

<h1>Hello {world!}</h1>
<Component a="1" b="2" c={\`three\`} items={astro.map((item: string) => {
  const value: string = item.split('').reverse().join('');
  return value;
})}>Hello world</Component>`;
    const doc = parse(input);
    const output = await render(doc);
    expect(output).toEqual(input);
  });

   it("gracefully handles elements inside attributes", async () => {
    const input = `---
let value: string;
---

<h1>Hello {world}</h1>
<Component a="1" b="2" c={\`three\`} items={astro.map((item: string) => <li>{item}</li>)}>Hello world</Component>`;
    const doc = parse(input);
    expect(doc.children.at(-1).attributes.items).toEqual('{astro.map((item: string) => <li>{item}</li>)}');
    const output = await render(doc);
    expect(output).toEqual(input);
  });

  it("fails with error on unmatched braces", async () => {
    const input = `
<Component items={astro.map(({item: string) => <li>{item}</li>)}>Hello world</Component>`;
    let error: unknown;
    try {
      parse(input);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(Error);
  });

  it("handles single-line comments", async () => {
    const input = '<Component items={astro.map((item: string) => <li>\n//{{{((([[[[{item}\n</li>)}>Hello world</Component>';
    const doc = parse(input);
    const output = await render(doc);
    expect(output).toEqual(input);
  });

  it("handles multi-line comments", async () => {
    const input = '<Component items={astro.map((item: string) => <li>\n/* \n * {{{ }\n */\n{item}</li>)}>Hello world</Component>';
    const doc = parse(input);
    const output = await render(doc);
    expect(output).toEqual(input);
  });

  it("handles regex", async () => {
    const input = '<Component items={astro.map((item: string) => <li>\n{/{{{{/gmi.test(item)}\n</li>)}>Hello world</Component>';
    const doc = parse(input);
    const output = await render(doc);
    expect(output).toEqual(input);
  });
});
