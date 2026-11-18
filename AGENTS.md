# Agents

## Sections

A **section** is a top-level screen region bound to one feature or tab, rendered by
`App.tsx`. It owns feature state, turns interactions into app callbacks, and lives in
`src/components/sections/<SectionName>/`.

## Subsections

A **subsection** is a presentational component rendering one visual block of a section,
in `<SectionName>/subsections/`. It receives props, reports intent through callbacks,
and holds no domain data or section state.

## Layout

```
src/components/sections/BigButtonSection/
├── BigButtonSection.tsx
├── constants.ts
└── subsections/
    ├── LocationSelector.tsx
    └── TimeOffsetSelector.tsx
```

Folder name matches the component name, imports target the `.tsx` directly, and shared
options live in the section's `constants.ts`.
