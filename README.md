# Cem Yıldız — Portfolio

A Turkish-first portfolio for project notes and work by Cem Yıldız, a Mathematics and Computer Sciences undergraduate at Eskişehir Osmangazi University.

The site presents shipped products and educational projects with their purpose, available evidence, Cem's role, AI assistance, and known limits. It is not a list of framework or expertise claims.

## Featured projects

- **GündemAI** — an Android news app in closed testing; access is limited to invited testers.
- **Bike Demand: Temporal ML** — a chronological comparison of seasonal-naive and ridge models on the [UCI Bike Sharing dataset](https://doi.org/10.24432/C5W894). The repository reports a final-test MAE of 77.79 bikes versus 103.54 for the baseline; this is one city and two years, and historical weather does not establish advance forecast performance.
- **WC2026 AI Simulator** — a probability-based tournament simulation using Poisson distributions and Monte Carlo. It is not a trained machine-learning model.

SleepInfo remains available as an earlier case study. Its published model metrics have not been independently validated.

## Site

Built with Next.js, React, and TypeScript. Project content lives in `src/data/projects.ts`; the homepage is in `src/app/page.tsx`.

```bash
npm ci
npm run dev
```

Use `npm run lint`, `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm run test:e2e` for local verification.
