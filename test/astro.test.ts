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

    it("does not hang on unmatched braces", async () => {
    const input = `---
let value: string;
---

<h1>Hello {world}</h1>
<Component a="1" b="2" c={\`three\`} items={astro.map((item: string) => {
  const value: string = item.split('{').reverse().join('{');
  return value;
})}>Hello world</Component>`;
    const doc = parse(input);
    const output = await render(doc);
    expect(output).toEqual(input);
  });
});

