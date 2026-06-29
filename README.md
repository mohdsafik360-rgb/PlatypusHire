# PlatypusHire Rebuilt Codebase

This project was rebuilt from the flattened `platypushire-codebase.txt` export produced by Z.ai.

## What it is

A Next.js + TypeScript + Tailwind + shadcn-style resume builder with a consistent, compact editor UI:

- Landing page at `/`
- Resume builder at `/builder`
- Client-side Zustand resume state persisted to localStorage
- ATS score indicator
- One-page fit status indicator
- Local resume quality checks
- A4 resume preview
- Dynamic density controls for compact/normal/spacious/auto layouts
- Direct browser-side PDF download through `html2canvas` + `jspdf`
- Resume JSON import/export backup
- Optional Prisma SQLite config included from the original export

## Run locally

Using Bun:

```bash
bun install
cp .env.example .env
bun run dev
```

Using npm:

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:3000
```

## Quality checks

After installing dependencies, run:

```bash
npm run typecheck
npm run lint
npm run build
```

The rebuilt project no longer suppresses TypeScript build errors, so failed checks should be treated as real regressions.

## Notes

The uploaded file was not a normal source folder. It was a single text dump with `# FILE:` separators. This rebuilt archive restores those entries into a standard project directory.

No secrets are included. `.env.example` is provided for local setup.
