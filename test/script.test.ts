import { parse, render } from "../src";
import { describe, expect, it, test } from "vitest";

describe("script", () => {
  it("works for elements", async () => {
    const input = `<script>console.log("Hello <name>!")</script>`;
    const output = await render(parse(input));
    expect(output).toEqual(input);
  });
  it("works without quotes", async () => {
    const input = `<script>0<1>0</name></script>`;
    const output = await render(parse(input));
    expect(output).toEqual(input);
  });
});

describe("style", () => {
  it("works for elements", async () => {
    const input = `<style><name></name><foo></style>`;
    const output = await render(parse(input));
    expect(output).toEqual(input);
  });
  it("works without quotes", async () => {
    const input = `<style>0>1</name></style>`;
    const output = await render(parse(input));
    expect(output).toEqual(input);
  });
});
