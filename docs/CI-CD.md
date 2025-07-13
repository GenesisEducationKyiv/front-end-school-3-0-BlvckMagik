# CI/CD Pipeline

## Огляд

Цей проект використовує GitHub Actions для автоматизації процесу розробки та деплою.

## Workflow

### CI/CD Pipeline (`.github/workflows/ci.yml`)

Цей workflow запускається при:
- Push до гілок `main` та `develop`
- Pull Request до гілок `main` та `develop`

#### Кроки:

1. **Checkout** - отримання коду
2. **Setup Node.js** - налаштування Node.js 20
3. **Setup pnpm** - налаштування pnpm 8
4. **Install dependencies** - встановлення залежностей з кешуванням
5. **Run ESLint** - перевірка коду
6. **Type check** - перевірка TypeScript типів
7. **Build application** - збірка додатку
8. **Upload build artifacts** - збереження артефактів білду

### Docker Build

При push до `main` гілки:
- Будується Docker image
- Push до Docker Hub
- Використовується кешування для прискорення білду

## Docker

### Dockerfile

Використовується багатоетапний білд:
- `base` - базова Node.js 20 Alpine
- `deps` - встановлення залежностей
- `builder` - збірка додатку
- `runner` - фінальний образ з production кодом

### Локальна розробка

```bash
# Збірка та запуск
docker-compose up --build

# Тільки збірка
docker build -t music-app .

# Запуск контейнера
docker run -p 3000:3000 music-app
```

## Налаштування

### GitHub Secrets

Для роботи з Docker потрібно налаштувати:

- `DOCKER_USERNAME` - ім'я користувача Docker Hub
- `DOCKER_PASSWORD` - токен доступу Docker Hub

### Локальне тестування

```bash
# Перевірка ESLint
pnpm lint

# Перевірка типів
pnpm type-check

# Збірка
pnpm build
```

## Артефакти

- Білд файли зберігаються як артефакти на 7 днів
- Docker образи публікуються в Docker Hub
- Кеш node_modules використовується між запусками
