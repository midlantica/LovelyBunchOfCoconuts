# Claims Guide

Claims consist of a short statement plus an internal "translation" (summary / interpretation). Each file holds one claim.

## Minimal Structure
```
---
title: "Living wage"
claim: "Living wage"
translation: "Mandated higher base wage"
---

Optional explanatory paragraph(s).
```

Rules:
- `title` and `claim` must match exactly.
- `translation` is a concise interpretive summary (one short line).
- Additional explanation is optional and placed after the frontmatter.

Filenames:
- Lowercase, hyphen-separated: `living-wage.md`
- Avoid duplicates with underscore forms (`living_wage.md`). Remove underscore variants when encountered.

Ignored: Files starting with `_`.

## Adding a Claim
1. Choose a concise hyphenated filename.
2. Add required frontmatter fields.
3. (Optional) add explanatory body text after frontmatter.

## Example (with body)
```
---
title: "Universal childcare"
claim: "Universal childcare"
translation: "State-funded childcare for all families"
---

Additional context about the claim can go here.
```

## See Also
- Root `README.md` (content summary and examples)
- `../_ReadMe.md` (overview)
