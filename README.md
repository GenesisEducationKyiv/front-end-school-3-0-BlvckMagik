# Music Player App

## 🚀 Оптимізації та продуктивність

### Bundle Analysis (Аналіз бандлів)

Для аналізу розміру бандлів використовується `@next/bundle-analyzer`:

```bash
# Аналіз розміру бандлів
pnpm analyze

# Або вручну
pnpm build:analyze
```

Це відкриє веб-сторінку з детальним аналізом:
- Розмір кожного модуля
- Залежності та їх вплив на розмір бандла
- Дублікати модулів
- Можливості для оптимізації

### Code Splitting (Розділення коду)

Додаток використовує динамічні імпорти для зменшення початкового розміру бандла:

- **Модалки**: `CreateTrackModal`, `EditTrackModal`, `TrackDetailsModal` завантажуються тільки при відкритті
- **AudioPlayer**: Завантажується лише коли користувач починає відтворення треку
- **Lazy компоненти**: Знаходяться в `src/components/tracks/LazyModals.tsx` та `src/components/tracks/LazyAudioPlayer.tsx`

### Loading States (Стани завантаження)

Проект використовує різні види індикаторів завантаження:

#### Skeleton Loaders (Для lazy компонентів)

Skeleton loaders показуються під час завантаження lazy компонентів:

```typescript
import { 
  TrackItemSkeleton,
  TrackListSkeleton 
} from "@/components/ui";

// Використання
<TrackListSkeleton count={10} />
```

**Доступні skeleton компоненти:**
- `TrackItemSkeleton` - для одного елемента списку треків
- `TrackListSkeleton` - для всього списку треків

#### Спінери (Для операцій завантаження)

Спінери використовуються для індикації активних операцій:

```typescript
import { 
  Spinner, 
  PageSpinner, 
} from "@/components/ui";

// Базовий спінер
<Spinner size="lg" color="primary" text="Завантаження..." />

// Спінер для всієї сторінки
<PageSpinner />
```

**Доступні спінери:**
- `Spinner` - базовий спінер з налаштуваннями розміру і кольору
- `PageSpinner` - повноекранний спінер для завантаження сторінки

#### Глобальне завантаження

Додаток має глобальний провайдер завантаження:

```typescript
import { useLoading } from "@/components/layout/LoadingProvider";

const { isLoading, setLoading, showPageSpinner } = useLoading();

// Показати спінер на 2 секунди
showPageSpinner(2000);

// Встановити стан завантаження
setLoading(true);
```

### Tree Shaking

Next.js автоматично видаляє невикористаний код завдяки:
- ES6 модулям
- Налаштуванню `sideEffects: false` у webpack
- Оптимізації імпортів для великих бібліотек

### Lazy Loading (Відкладене завантаження)

Важкі компоненти завантажуються лише за потреби:
- Аудіоплеєр з Web Audio API візуалізацією
- Модальні вікна з формами
- Показ skeleton loader під час завантаження

### Source Maps

Увімкнені source maps для продакшн режиму:
- Налаштовано `productionBrowserSourceMaps: true`
- Полегшує дебагінг у продакшн оточенні
- Не впливає на продуктивність кінцевого користувача

### Додаткові оптимізації

- **Compression**: Увімкнено gzip стиснення
- **Console removal**: Автоматичне видалення console.log у продакшн
- **CSS оптимізація**: Увімкнено `optimizeCss`
- **Package оптимізація**: Оптимізація імпортів для `@heroicons/react`, `@headlessui/react`, `react-select`, `lodash`

## 🔧 Змінні середовища

Створіть файл `.env.local` з наступними змінними:

```env
# Основні налаштування
NEXT_PUBLIC_APP_NAME=Music App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Розробка
NODE_ENV=development

# База даних
DATABASE_URL=your_database_url_here

# Bundle analyzer
ANALYZE=false

# Обмеження файлів
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_SUPPORTED_AUDIO_FORMATS=mp3,wav,m4a,flac

# Вимкнути телеметрію Next.js
NEXT_TELEMETRY_DISABLED=1
```

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
