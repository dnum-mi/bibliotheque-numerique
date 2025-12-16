#!/bin/bash

set -e

echo "🚀 Démarrage de Bibliothèque Numérique"

# Vérifications des prérequis
command -v docker >/dev/null 2>&1 || { echo "❌ Docker non installé"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose non installé"; exit 1; }
echo "✅ Prérequis OK"

# Lancement des services
echo "📦 Lancement des services..."
docker compose --profile dev -f apps/server/docker-compose.yml -p bn build --no-cache server
docker compose --profile dev -f apps/server/docker-compose.yml -p bn up -d

echo ""
echo "🎉 Bibliothèque Numérique est lancée !"
echo ""
echo "Frontend   → http://localhost:8080"
echo "API        → http://localhost:3000"
echo "MinIO      → http://localhost:9001"
echo "Adminer    → http://localhost:8010"
echo "MailHog    → http://localhost:8025"
echo "Bull Board → http://localhost:3010"
echo ""
