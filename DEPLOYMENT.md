# Déploiement VPS - district.armasoft.ci

## Prérequis sur le VPS

- **OS** : Ubuntu 22.04+ recommandé
- **RAM** : 2 Go minimum
- **Docker** & **Docker Compose** installés
- **Nginx** installé
- Accès SSH root ou sudo

---

## Étape 1 : Préparer le VPS

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Installer Nginx
sudo apt install nginx -y

# Installer Certbot (SSL)
sudo apt install certbot python3-certbot-nginx -y
```

## Étape 2 : Configurer le DNS

Chez votre registrar DNS, ajouter un **enregistrement A** :

| Type | Nom    | Valeur           |
|------|--------|------------------|
| A    | panel  | `<IP_DU_VPS>`   |

Attendre la propagation DNS (quelques minutes à 24h).

## Étape 3 : Cloner le projet sur le VPS

```bash
# Créer le dossier
sudo mkdir -p /opt/districtclub
cd /opt/districtclub

# Cloner le repo
git clone <URL_DU_REPO> backoffice
cd backoffice
```

## Étape 4 : Configurer l'environnement

```bash
# Copier et adapter le fichier d'environnement
cp .env.production .env.production

# Vérifier les variables (modifier si nécessaire)
nano .env.production
```

## Étape 5 : Créer le réseau Docker

```bash
docker network create web
```

## Étape 6 : Build et lancement

```bash
chmod +x deploy.sh
./deploy.sh
```

Vérifier que le conteneur tourne :
```bash
docker compose ps
docker compose logs -f
```

## Étape 7 : Configurer Nginx

```bash
# Copier la config Nginx
sudo cp nginx/district.armasoft.ci.conf /etc/nginx/sites-available/district.armasoft.ci

# Activer le site
sudo ln -s /etc/nginx/sites-available/district.armasoft.ci /etc/nginx/sites-enabled/

# Supprimer le site par défaut (optionnel)
sudo rm -f /etc/nginx/sites-enabled/default
```

## Étape 8 : Obtenir le certificat SSL (AVANT d'activer le bloc HTTPS)

D'abord, commenter temporairement le bloc `server` HTTPS dans la config Nginx pour que Certbot puisse fonctionner :

```bash
sudo nano /etc/nginx/sites-available/district.armasoft.ci
```

Commenter tout le bloc `server { listen 443 ... }`, puis :

```bash
# Tester la config
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Obtenir le certificat SSL
sudo certbot certonly --webroot -w /var/www/certbot -d district.armasoft.ci
```

Ensuite, décommenter le bloc HTTPS et recharger :

```bash
sudo nano /etc/nginx/sites-available/district.armasoft.ci
# Décommenter le bloc server 443

sudo nginx -t
sudo systemctl reload nginx
```

## Étape 9 : Renouvellement automatique SSL

```bash
# Tester le renouvellement
sudo certbot renew --dry-run

# Le cron est configuré automatiquement par Certbot
```

---

## Mise à jour (redéploiement)

```bash
cd /opt/districtclub/backoffice
./deploy.sh
```

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Redémarrer
docker compose restart

# Arrêter
docker compose down

# Reconstruire sans cache
docker compose build --no-cache && docker compose up -d

# Statut Nginx
sudo systemctl status nginx
```

---

## Architecture

```
Internet → DNS (district.armasoft.ci)
         → VPS (IP publique)
         → Nginx (port 80/443, SSL termination)
         → Docker (port 3000, Next.js standalone)
         → Supabase Cloud (API externe)
```
