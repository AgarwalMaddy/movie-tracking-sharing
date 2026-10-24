# Folder structure and dependency rules

Read this when creating a new file or folder, moving code, or adding an import across folders.

```
src/
├── app/                 # app shell: providers, router, header/footer (Shell)
├── pages/               # route screens; compose features
├── features/<name>/     # domain code + one public index.ts
├── components/
│   ├── ui/              # generic, domain-agnostic building blocks
│   └── layout/          # generic structural pieces
├── lib/                 # api client, form helpers, formatters
├── styles.css
└── main.tsx
```

`app/shell.tsx` is the chrome (nav, search overlay, footer). It is not a generic layout primitive, so it stays in `app/` rather than `components/layout/`.

Do not create empty `components/ui` or `components/layout` folders ahead of time. Add them when the first generic piece lands.

## Where does a new file go?

1. Mentions titles, lists, auth, friends, and so on → `features/<name>/`.
2. Reusable visual element with no domain knowledge → `components/ui`.
3. Arranges other content, no meaning of its own → `components/layout`.
4. Composes the app frame (header, router) → `app/`.
5. A route → `pages/`.

"Used in many places" does not make something shared. Domain-aware components stay in their feature and are imported from the feature's public entry point (`index.ts`).

## Dependency direction (one way only)

```
app → pages → features → components → lib
```

- `components/` never imports from `features/`, `pages/`, or `app/`.
- `features/` never imports from `pages/` or `app/`, and not from other features. Move shared things down to `components/` or `lib/`.
- `lib/` imports nothing from the rest of `src/`.
- Inside a feature, use relative imports. Outside, import from the feature's `index.ts` only.
- No circular imports (`import-x/no-cycle` is enforced).
- Avoid barrel files except one public entry per feature.

Start code in the feature that needs it. Promote to shared only when a second feature needs it.

Pages currently hold a lot of screen logic (Discover, Title, and so on). When you touch a page, extract domain pieces into `features/<name>/` rather than growing the page further.
