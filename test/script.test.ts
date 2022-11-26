import { parse, render, walk, ELEMENT_NODE } from "../src";
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
  it("works with <script> in string", async () => {
    const input = `<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><link rel="icon" href="/favicon-48x48.cbbd161b.png"/><link rel="apple-touch-icon" href="/apple-touch-icon.6803c6f0.png"/><meta name="theme-color" content="#ffffff"/><link rel="manifest" href="/manifest.56b1cedc.json"/><link rel="search" type="application/opensearchdescription+xml" href="/opensearch.xml" title="MDN Web Docs"/><script>Array.prototype.flat&&Array.prototype.includes||document.write('<script src="https://polyfill.io/v3/polyfill.min.js?features=Array.prototype.flat%2Ces6"><\/script>')</script><title>HTML Sanitizer API - Web APIs | MDN</title><link rel="alternate" title="HTML Sanitizer API" href="https://developer.mozilla.org/ja/docs/Web/API/HTML_Sanitizer_API" hreflang="ja"/><link rel="alternate" title="HTML Sanitizer API" href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API" hreflang="en"/><meta name="robots" content="index, follow"><meta name="description" content="The HTML Sanitizer API allow developers to take untrusted strings of HTML and Document or DocumentFragment objects, and sanitize them for safe insertion into a document&apos;s DOM."/><meta property="og:url" content="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API"/><meta property="og:title" content="HTML Sanitizer API - Web APIs | MDN"/><meta property="og:locale" content="en-US"/><meta property="og:description" content="The HTML Sanitizer API allow developers to take untrusted strings of HTML and Document or DocumentFragment objects, and sanitize them for safe insertion into a document&apos;s DOM."/><meta property="og:image" content="https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png"/><meta property="twitter:card" content="summary_large_image"/><link rel="canonical" href="https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API"/><style media="print">.breadcrumbs-container,.document-toc-container,.language-menu,.on-github,.page-footer,.top-navigation-main,nav.sidebar,ul.prev-next{display:none!important}.main-page-content,.main-page-content pre{padding:2px}.main-page-content pre{border-left-width:2px}</style><script src="/static/js/ga.js" defer=""></script><script defer="defer" src="/static/js/main.bfba1cdc.js"></script><link href="/static/css/main.7fcd0907.css" rel="stylesheet">`
    let meta = 0;
    await walk(parse(input), async (node, parent) => {
      if (node.type === ELEMENT_NODE && node.name === 'meta' && parent?.name === 'head') {
        meta++;
      }
    })
    expect(meta).toEqual(11);
  })
  it("works with </script> in live string", async () => {
    const input = await fetch("https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API").then(r => r.text());
    let meta = 0;
    await walk(parse(input), async (node, parent) => {
      if (node.type === ELEMENT_NODE && node.name === 'meta' && parent?.name === 'head') {
        meta++;
      }
    })
    expect(meta).toEqual(11);
  })
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
