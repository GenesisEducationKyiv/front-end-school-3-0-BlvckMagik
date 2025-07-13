#!/bin/bash

set -e

echo "🧪 Тестування CI процесу локально..."

echo "📦 Встановлення залежностей..."
pnpm install --frozen-lockfile

echo "🔍 Запуск ESLint..."
pnpm lint

echo "🔧 Перевірка TypeScript типів..."
pnpm type-check

echo "🏗️ Збірка додатку..."
pnpm build

echo "🐳 Тестування Docker збірки..."
docker build -t music-app-test .

echo "✅ Всі перевірки пройшли успішно!"
echo "🚀 CI процес готовий до використання"
