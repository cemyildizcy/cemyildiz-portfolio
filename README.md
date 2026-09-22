# Cem Yıldız — Portfolio

A Turkish-first portfolio for project notes and work by Cem Yıldız, a Mathematics and Computer Sciences undergraduate at Eskişehir Osmangazi University.

The site presents shipped products and educational projects with their purpose, available evidence, Cem's role, AI assistance, and known limits. It is not a list of framework or expertise claims.

## Featured projects

- **GündemAI** — an Android news app published on Google Play.
- **Bike Demand: Temporal ML** — a chronological comparison of seasonal-naive and ridge models on the [UCI Bike Sharing dataset](https://doi.org/10.24432/C5W894). The repository reports a final-test MAE of 77.79 bikes versus 103.54 for the baseline; this is one city and two years, and historical weather does not establish advance forecast performance.
- **Fashion-MNIST: NumPy ile MLP** — a NumPy experiment on the official 10,000-image test set: a 128–64 ReLU MLP reached 87.03% accuracy versus 83.56% for linear softmax. Results come from one seed and split; the noise tests use synthetic pixel corruption, and parts of the implementation and documentation were AI-assisted.
- **WC2026 AI Simulator** — a probability-based tournament simulation using Poisson distributions and Monte Carlo. It is not a trained machine-learning model.

SleepInfo remains in the repository as an earlier case page and is not featured on the homepage. Its published model metrics have not been independently validated.

## Site

Built with Next.js, React, and TypeScript. Project content lives in `src/data/projects.ts`; the homepage is in `src/app/page.tsx`.

```bash
npm ci
npm run dev
```

Use `npm run lint`, `npm test`, `npx tsc --noEmit`, `npm run build`, and `npm run test:e2e` for local verification.
