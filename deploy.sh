#!/bin/bash
set -e

echo "🚀 Déploiement de DistrictClub BackOffice..."

# Pull latest code
git pull origin main

# Build and restart containers
docker compose down
docker compose build --no-cache
docker compose up -d

echo "✅ Déploiement terminé !"
echo "📋 Logs : docker compose logs -f"
