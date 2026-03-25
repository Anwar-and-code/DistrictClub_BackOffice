#!/bin/bash
set -e

DOMAIN="district.armasoft.ci"
APP_NAME="districtclub-backoffice"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "============================================"
echo "  Déploiement automatique - $DOMAIN"
echo "============================================"

# -------------------------------------------
# 1. Installer les dépendances système
# -------------------------------------------
install_deps() {
    echo ""
    echo "� [1/6] Vérification des dépendances..."

    if ! command -v docker &> /dev/null; then
        echo "  → Installation de Docker..."
        curl -fsSL https://get.docker.com | sh
        sudo usermod -aG docker "$USER"
        echo "  ✅ Docker installé"
    else
        echo "  ✅ Docker déjà installé"
    fi

    if ! command -v nginx &> /dev/null; then
        echo "  → Installation de Nginx..."
        sudo apt-get update -qq
        sudo apt-get install -y -qq nginx
        echo "  ✅ Nginx installé"
    else
        echo "  ✅ Nginx déjà installé"
    fi

    if ! command -v certbot &> /dev/null; then
        echo "  → Installation de Certbot..."
        sudo apt-get install -y -qq certbot python3-certbot-nginx
        echo "  ✅ Certbot installé"
    else
        echo "  ✅ Certbot déjà installé"
    fi
}

# -------------------------------------------
# 2. Créer le fichier .env.production si absent
# -------------------------------------------
setup_env() {
    echo ""
    echo "⚙️  [2/6] Vérification de l'environnement..."

    if [ ! -f "$PROJECT_DIR/.env.production" ]; then
        echo "  ⚠️  Fichier .env.production manquant !"
        echo "  Créez-le avec :"
        echo "    nano $PROJECT_DIR/.env.production"
        echo ""
        echo "  Contenu requis :"
        echo "    NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co"
        echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx"
        echo "    SUPABASE_SERVICE_ROLE_KEY=xxx"
        exit 1
    else
        echo "  ✅ .env.production trouvé"
    fi
}

# -------------------------------------------
# 3. Build et lancement Docker
# -------------------------------------------
deploy_app() {
    echo ""
    echo "🐳 [3/6] Build et lancement de l'application..."

    # Créer le réseau Docker si nécessaire
    docker network create web 2>/dev/null || true

    # Charger les variables pour le build
    set -a
    source "$PROJECT_DIR/.env.production"
    set +a

    cd "$PROJECT_DIR"

    # Arrêter les anciens conteneurs
    docker compose down 2>/dev/null || true

    # Build et lancement
    docker compose build --no-cache
    docker compose up -d

    echo "  ✅ Application démarrée sur le port 3000"
}

# -------------------------------------------
# 4. Configurer Nginx
# -------------------------------------------
setup_nginx() {
    echo ""
    echo "🌐 [4/6] Configuration de Nginx..."

    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"
    NGINX_ENABLED="/etc/nginx/sites-enabled/$DOMAIN"

    # Supprimer les anciennes configs
    sudo rm -f /etc/nginx/sites-available/panel.districtclub.ci
    sudo rm -f /etc/nginx/sites-enabled/panel.districtclub.ci

    # Écrire la config HTTP uniquement (pour Certbot)
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    # Activer le site
    sudo rm -f "$NGINX_ENABLED"
    sudo ln -s "$NGINX_CONF" "$NGINX_ENABLED"

    # Supprimer le site par défaut
    sudo rm -f /etc/nginx/sites-enabled/default

    # Créer le dossier certbot
    sudo mkdir -p /var/www/certbot

    # Tester et recharger
    sudo nginx -t
    sudo systemctl reload nginx

    echo "  ✅ Nginx configuré (HTTP)"
}

# -------------------------------------------
# 5. Obtenir le certificat SSL
# -------------------------------------------
setup_ssl() {
    echo ""
    echo "🔒 [5/6] Configuration SSL..."

    CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

    if [ -f "$CERT_PATH" ]; then
        echo "  ✅ Certificat SSL déjà existant"
    else
        echo "  → Obtention du certificat SSL via Certbot..."
        sudo certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" --non-interactive --agree-tos --email admin@armasoft.ci
        echo "  ✅ Certificat SSL obtenu"
    fi

    # Mettre à jour la config Nginx avec HTTPS
    NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

    sudo nginx -t
    sudo systemctl reload nginx

    echo "  ✅ Nginx configuré avec HTTPS"
}

# -------------------------------------------
# 6. Résumé
# -------------------------------------------
summary() {
    echo ""
    echo "============================================"
    echo "  ✅ Déploiement terminé !"
    echo "============================================"
    echo ""
    echo "  🌐 URL : https://$DOMAIN"
    echo "  📋 Logs : docker compose logs -f"
    echo "  🔄 Redéployer : ./deploy.sh"
    echo ""
}

# -------------------------------------------
# Exécution
# -------------------------------------------
install_deps
setup_env
deploy_app
setup_nginx
setup_ssl
summary
