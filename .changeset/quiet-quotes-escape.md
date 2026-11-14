---
"ultrahtml": patch
---

Escape `"` in attribute values when rendering, so a single-quoted value that contains `"` can no longer end the value early and add new attributes.
