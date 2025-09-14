# Pekka — Creative Lab (GH Pages)

Modern frosted-glass portfolio that auto-loads your GitHub profile and repositories.

## What’s inside
- index.html — layout wired to a frosted-glass theme
- assets/style.css — glassmorphism, gradients, chips, responsive grid
- assets/app.js — fetches profile + repositories from GitHub API and renders cards

## Customize
- Username: set the `data-username` attribute on `<body>` (defaults to `mangobanaani`).
- Email button: update the `mailto:` in the hero actions.
- Sections: tweak headings, copy, or add new blocks in `index.html`.

## Notes
- Uses the public GitHub API (no token). Anonymous rate limit is ~60 requests/hour per IP. If you hit it, the page shows a friendly message; try again later.
- Repos are fetched in pages of 100, sorted by stars then by last update. Search, language chips, and an “Include forks” toggle are provided client-side.

## Local preview
Open `index.html` directly or serve the folder with any static server.

## Deploy
This repository is set up as a user site: `mangobanaani.github.io`. Pushing to `main` publishes automatically via GitHub Pages.
# Deploy trigger Tue Aug 12 01:05:15 EEST 2025


<--tunnel-through-iap Deploy trigger Mon Sep 15 01:31:03 EEST 2025 -->
