#!/bin/bash
#=============================================
# Trade Buddy AI - Portal Uninstaller
#=============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "╔══════════════════════════════════════════╗"
echo "║   Trade Buddy AI - Uninstaller           ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Jalankan sebagai root: sudo bash uninstall-portal.sh${NC}"
  exit 1
fi

echo -e "${YELLOW}⚠️  Ini akan menghapus portal dari VPS. Lanjutkan? (y/n)${NC}"
read -r CONFIRM
if [ "$CONFIRM" != "y" ]; then
  echo "Dibatalkan."
  exit 0
fi

echo -e "${GREEN}🗑️  Menghapus file web...${NC}"
rm -rf /var/www/html/*

echo -e "${GREEN}🗑️  Menghapus project folder...${NC}"
rm -rf /root/trade-buddy-ai

echo -e "${GREEN}🗑️  Menghapus auto-update crontab...${NC}"
crontab -l 2>/dev/null | grep -v "update-portal.sh" | crontab -

echo -e "${GREEN}🗑️  Menghapus update script...${NC}"
rm -f /root/update-portal.sh

echo -e "${GREEN}🗑️  Menghapus Nginx config...${NC}"
rm -f /etc/nginx/sites-available/trade-buddy
rm -f /etc/nginx/sites-enabled/trade-buddy

echo -e "${GREEN}🗑️  Menghapus log...${NC}"
rm -f /var/log/trade-buddy-update.log

# Restore default Nginx
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/ 2>/dev/null || true
systemctl restart nginx 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ Portal berhasil di-uninstall dari VPS!${NC}"
echo ""
