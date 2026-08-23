---
name: humanizer
description: |
  Rewrites AI-sounding text so it reads naturally without changing meaning.
  Use when editing prose with inflated claims, sales language, stock AI words,
  filler, chatbot artifacts, or repetitive structure. Based on blader/humanizer
  and Wikipedia's Signs of AI writing.
---

# Humanizer

Rewrite text so it sounds like a person wrote it. Keep every fact. Do not invent details.

Full pattern list: [patterns.md](patterns.md) (from [blader/humanizer](https://github.com/blader/humanizer), MIT).

## Workflow

1. Read the source. Mark AI patterns (see patterns.md).
2. Draft a rewrite. Use plain verbs (`is`, `has`, `can`). Match the document tone (technical docs stay neutral).
3. Check: did you add or drop any fact, number, date, or claim?
4. Return the final text only when embedded in another task; otherwise return draft, patterns found, and final rewrite.

## File mode

When editing a repo file:

- Change prose only. Keep code blocks, YAML frontmatter, tables, and link targets.
- Do not rewrite quoted text, proper names, or spec identifiers.
- Technical docs: remove filler and stock phrases; keep precision.

## High-signal tells (quick scan)

| Category | Watch for |
|----------|-----------|
| Content | Inflated legacy claims, sales adjectives, vague "experts say" |
| Words | delve, crucial, pivotal, landscape, showcase, underscore, vibrant, fostering |
| Structure | Forced groups of three, bold mini-headings in lists, title-case headings |
| Chatbot | "I hope this helps", "Let's dive in", agreeable openers |
| Style | Em dashes (replace unless writer sample uses them), emoji headings |

## Source

[Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
