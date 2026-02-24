#!/bin/bash

set -e

echo "🛑 Arrêt de Bibliothèque Numérique"

ENV_FILE="apps/server/.env"
[ -f "$ENV_FILE" ] || ENV_FILE="apps/server/.env.docker"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Fichier $ENV_FILE introuvable"
  exit 1
fi

echo "📦 Arrêt des services..."

docker compose --env-file "$ENV_FILE" --profile prod -f apps/server/docker-compose.yml -p bn down

echo ""
echo "✅ Tous les services sont arrêtés."
echo ""
