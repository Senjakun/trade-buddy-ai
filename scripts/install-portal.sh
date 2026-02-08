#!/bin/bash
#=============================================
# Trade Buddy AI - Portal Auto Installer
# For Ubuntu/Debian VPS
#=============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════╗"
echo "║   Trade Buddy AI - Portal Installer      ║"
echo "║   Auto Install & Configure               ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Check root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Jalankan sebagai root: sudo bash install-portal.sh${NC}"
  exit 1
fi

# Variables
REPO_URL="https://github.com/Senjakun/trade-buddy-ai.git"
INSTALL_DIR="/root/trade-buddy-ai"
WEB_DIR="/var/www/html"
UPDATE_SCRIPT="/root/update-portal.sh"
DOMAIN=""

# Ask for domain (optional)
echo -e "${YELLOW}🌐 Masukkan domain (kosongkan jika pakai IP saja):${NC}"
read -r DOMAIN

echo ""
echo -e "${GREEN}📦 Step 1: Update system & install dependencies...${NC}"
apt update -y && apt upgrade -y
apt install -y curl git nginx

# Install Node.js via nvm
echo -e "${GREEN}📦 Step 2: Install Node.js 20...${NC}"
# Cek versi Node.js, install/upgrade jika belum v20+
NEED_NODE=true
if command -v node &> /dev/null; then
  NODE_MAJOR=$(node -v | grep -oP '(?<=v)\d+')
  if [ "$NODE_MAJOR" -ge 20 ] 2>/dev/null; then
    NEED_NODE=false
    echo -e "${CYAN}   Node.js sudah v20+, skip install${NC}"
  else
    echo -e "${YELLOW}   Node.js versi lama ($(node -v)), upgrade ke v20...${NC}"
  fi
fi

if [ "$NEED_NODE" = true ]; then
  # Hapus NodeSource lama jika ada
  rm -f /etc/apt/sources.list.d/nodesource.list 2>/dev/null
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi
echo -e "${CYAN}   Node: $(node -v) | NPM: $(npm -v)${NC}"

# Clone repository
echo -e "${GREEN}📦 Step 3: Clone repository...${NC}"
if [ -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}   Folder sudah ada, pulling latest...${NC}"
  cd "$INSTALL_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# Install & Build
echo -e "${GREEN}📦 Step 4: Install dependencies & build...${NC}"
npm install
npm run build

# Deploy to Nginx
echo -e "${GREEN}📦 Step 5: Deploy ke Nginx...${NC}"
rm -rf ${WEB_DIR}/*
cp -r dist/* "$WEB_DIR/"

# Configure Nginx
echo -e "${GREEN}📦 Step 6: Konfigurasi Nginx...${NC}"
if [ -n "$DOMAIN" ]; then
  SERVER_NAME="$DOMAIN"
else
  SERVER_NAME="_"
fi

cat > /etc/nginx/sites-available/trade-buddy <<EOF
server {
    listen 80;
    server_name ${SERVER_NAME};

    root ${WEB_DIR};
    index index.html;

    # SPA routing - semua route diarahkan ke index.html
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/trade-buddy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & restart Nginx
nginx -t && systemctl restart nginx
systemctl enable nginx

# Create auto-update script
echo -e "${GREEN}📦 Step 7: Setup auto-update...${NC}"
cat > "$UPDATE_SCRIPT" <<'SCRIPT'
#!/bin/bash
cd /root/trade-buddy-ai
git pull origin main 2>/dev/null

# Check if there are new changes
if [ $(git rev-parse HEAD) != $(git rev-parse @{u} 2>/dev/null || echo "none") ] || [ ! -d "dist" ]; then
  npm install --silent
  npm run build --silent
  rm -rf /var/www/html/*
  cp -r dist/* /var/www/html/
  echo "[$(date)] Portal updated successfully" >> /var/log/trade-buddy-update.log
fi
SCRIPT
chmod +x "$UPDATE_SCRIPT"

# Add crontab (every 5 minutes)
(crontab -l 2>/dev/null | grep -v "update-portal.sh"; echo "*/5 * * * * $UPDATE_SCRIPT") | crontab -

# Setup SSL with Certbot (if domain provided)
if [ -n "$DOMAIN" ]; then
  echo -e "${GREEN}📦 Step 8: Setup SSL (Let's Encrypt)...${NC}"
  apt install -y certbot python3-certbot-nginx
  
  # Setup SSL untuk domain utama + www
  certbot --nginx -d "$DOMAIN" -d "www.${DOMAIN}" --non-interactive --agree-tos --email admin@${DOMAIN} || {
    echo -e "${YELLOW}⚠️  SSL otomatis gagal, coba jalankan manual:${NC}"
    echo -e "${CYAN}  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
  }
fi

# Summary
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗"
echo -e "║   ✅ INSTALASI SELESAI!                   ║"
echo -e "╚══════════════════════════════════════════╝${NC}"
echo ""
if [ -n "$DOMAIN" ]; then
  echo -e "${CYAN}🌐 Akses portal: https://${DOMAIN}${NC}"
else
  IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  echo -e "${CYAN}🌐 Akses portal: http://${IP}${NC}"
fi
echo -e "${CYAN}📁 Install dir:  ${INSTALL_DIR}${NC}"
echo -e "${CYAN}🔄 Auto-update:  Setiap 5 menit via crontab${NC}"
echo -e "${CYAN}📋 Update log:   /var/log/trade-buddy-update.log${NC}"
echo ""
echo -e "${YELLOW}📌 Konfigurasi AI nodes di: /admin-rimba${NC}"
echo ""
echo -e "${GREEN}Untuk uninstall jalankan:${NC}"
echo -e "${CYAN}  bash ${INSTALL_DIR}/scripts/uninstall-portal.sh${NC}"
echo ""
