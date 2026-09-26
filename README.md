# Strata - Manganese Ore Operations Dashboard

Multi-lingual operational dashboard for manganese ore mining operations with real-time weather integration and production analytics.

## Features

- **Multi-language Support**: English, Hindi, and Marathi translations via MyMemory API
- **Weather Integration**: Live rainfall data from Open-Meteo (keyless API)
- **Production Analytics**: 30-day historical production data with filtering by mine
- **Deterministic Mock Data**: Seeded PRNG ensures SSR/client hydration consistency

## Development

Requires Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm install
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS
- Supabase (planned)
