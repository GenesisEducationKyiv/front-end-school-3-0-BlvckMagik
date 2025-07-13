# Налаштування CI/CD

## Що було створено

### 1. GitHub Actions Workflows

- **`.github/workflows/ci.yml`** - основний CI/CD pipeline
- **`.github/workflows/deploy.yml`** - workflow для деплою
- **`.github/workflows/test.yml`** - workflow для тестування
- **`.github/workflows/cache.yml`** - приклад з розширеним кешуванням

### 2. Docker файли

- **`Dockerfile`** - багатоетапний білд для production
- **`docker-compose.yml`** - для локальної розробки
- **`.dockerignore`** - оптимізація Docker білду

### 3. Скрипти та документація

- **`scripts/test-ci.sh`** - локальне тестування CI процесу
- **`docs/CI-CD.md`** - детальна документація
- **`docs/SETUP.md`** - цей файл з інструкціями

## Налаштування

### 1. GitHub Secrets

Для роботи з Docker потрібно додати секрети в GitHub:

1. Перейдіть в Settings → Secrets and variables → Actions
2. Додайте:
   - `DOCKER_USERNAME` - ваше ім'я користувача Docker Hub
   - `DOCKER_PASSWORD` - токен доступу Docker Hub

### 2. Локальне тестування

```bash
# Запуск всіх перевірок
./scripts/test-ci.sh

# Окремі команди
pnpm lint          # ESLint
pnpm type-check    # TypeScript
pnpm build         # Збірка
```

### 3. Docker команди

```bash
# Локальна розробка
docker-compose up --build

# Збірка образу
docker build -t music-app .

# Запуск контейнера
docker run -p 3000:3000 music-app
```

## Що включає CI/CD процес

### ✅ Перевірки коду
- ESLint перевірка
- TypeScript перевірка типів
- Збірка додатку

### 🐳 Docker
- Багатоетапний білд
- Оптимізація розміру образу
- Автоматична публікація

### 📦 Кешування
- node_modules кешування
- pnpm store кешування
- Docker layer кешування

### 🎯 Артефакти
- Збереження білд файлів
- Збереження логів тестування
- Docker образи в registry

## Структура файлів

```
.github/
├── workflows/
│   ├── ci.yml          # Основний CI/CD
│   ├── deploy.yml      # Деплой
│   ├── test.yml        # Тестування
│   └── cache.yml       # Приклад кешування
├── Dockerfile          # Docker образ
├── docker-compose.yml  # Локальна розробка
├── .dockerignore       # Оптимізація Docker
├── scripts/
│   └── test-ci.sh     # Локальне тестування
└── docs/
    ├── CI-CD.md        # Документація
    └── SETUP.md        # Цей файл
```
