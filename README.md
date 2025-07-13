# Music Player App

### Optimistic Updates

The app uses optimistic updates through the `TracksContext` to immediately reflect changes in the UI before server confirmation:

- Track deletion: Immediately removes track from the list
- Track addition: Instantly shows new track at the top of the list
- Track updates: Immediately shows edited track details

Implementation can be found in `src/contexts/TracksContext.tsx`

### Audio Visualization

The audio player includes a real-time frequency visualization using Web Audio API:

- Colorful frequency bars that react to the audio in real-time
- Bars change color based on frequency and playback state
- Responsive canvas that adjusts to screen width
- Smooth animations using requestAnimationFrame

Implementation can be found in `src/components/tracks/AudioPlayer.tsx`

Key features:

- Uses AudioContext for audio processing
- AnalyserNode for frequency data analysis
- Canvas API for rendering
- Singleton pattern for AudioContext management

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## CI/CD Pipeline

Цей проект використовує автоматизований CI/CD процес з GitHub Actions:

### Перевірки при кожному PR:
- ✅ ESLint перевірка коду
- ✅ TypeScript перевірка типів  
- ✅ Збірка додатку
- ✅ Збереження артефактів

### Docker:
- 🐳 Багатоетапний Dockerfile для оптимізації розміру
- 🐳 Автоматична збірка та публікація Docker образів
- 🐳 Docker Compose для локальної розробки

### Локальне тестування:
```bash
pnpm lint          # ESLint перевірка
pnpm type-check    # TypeScript перевірка
pnpm build         # Збірка додатку
```

### Docker команди:
```bash
docker-compose up --build  # Локальна розробка
docker build -t music-app . # Збірка образу
docker run -p 3000:3000 music-app # Запуск контейнера
```

Детальна документація: [docs/CI-CD.md](docs/CI-CD.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
