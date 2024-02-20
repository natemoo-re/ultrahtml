---
"ultrahtml": patch
---

upgrades `dts-bundle-generator` to `9.2.1`, fixing an issue with `.d.ts`
generation which led methods prefixed with two underscores to be
incorrectly made private in the generated declaration file.
