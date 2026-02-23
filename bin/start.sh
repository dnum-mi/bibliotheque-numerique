#!/bin/bash

set -e

echo "🚀 Démarrage de Bibliothèque Numérique"

# Vérifications des prérequis
command -v docker >/dev/null 2>&1 || { echo "❌ Docker non installé"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose non installé"; exit 1; }

ENV_FILE="apps/server/.env"
[ -f "$ENV_FILE" ] || ENV_FILE="apps/server/.env.docker"
# Vérifier que le fichier existe
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Fichier $ENV_FILE introuvable"
  exit 1
fi

# Fonction pour charger les variables proprement
load_env() {
  set -a
  source "$ENV_FILE"
  set +a
}

# Charger les variables
load_env

# Vérifier la variable
if [ -z "${DS_API_TOKEN:-}" ]; then
  echo ""
  echo "❌ La variable DS_API_TOKEN n'est pas définie."
  echo "   Veuillez la définir dans $ENV_FILE"
  echo "   DS_API_TOKEN est un token d'authentification pour l'API Démarche Numérique"
  echo ""

  read -p "   Appuyez sur Entrée après modification..."

  # Recharger les variables
  load_env

  # Re-vérification
  if [ -z "${DS_API_TOKEN:-}" ]; then
    echo ""
    echo "❌ DS_API_TOKEN est toujours vide ou non défini."
    echo "   Script interrompu. Veuillez corriger le problème et relancer le script."
    exit 1
  fi
fi
echo "✅ DS_API_TOKEN détecté"

echo "✅ Prérequis OK"

# Lancement des services
echo "📦 Lancement des services..."
docker compose --env-file "$ENV_FILE" --profile dev -f apps/server/docker-compose.yml -p bn build --no-cache server
docker compose --env-file "$ENV_FILE" --profile dev -f apps/server/docker-compose.yml -p bn up -d

echo ""
echo "🎉 Bibliothèque Numérique est lancée !"
echo ""
echo "BN Web      → http://localhost:${HTTP_PROXY_PORT} (La partie frontend de BN, utilisée par les utilisateurs finaux)"
echo "BN API      → http://localhost:${PORT} (La partie API de BN, utilisée par le frontend et les intégrations)"
echo "MinIO Web   → http://localhost:${MINIO_CONSOLE_PORT} (La console de gestion de MinIO, le service de S3)"
echo "Adminer     → http://localhost:${ADMINER_PORT} (La console de gestion de la base de données)"
echo "MailHog Web → http://localhost:${MAILHOG_WEB_PORT} (La console de gestion de MailHog, le service de capture des emails envoyés par l'application)"
echo "Bull Board  → http://localhost:${BULLBOARD_PORT} (La console de gestion de Bull, le service de gestion des tâches en arrière-plan)"
echo ""
