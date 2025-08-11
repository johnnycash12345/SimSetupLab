# RaceSetup Pro - Guia Completo de Implantação

## Visão Geral

Este documento fornece instruções detalhadas para implantar o RaceSetup Pro, uma plataforma completa para setups de corridas virtuais, em um servidor de produção. O projeto consiste em um backend Flask com API REST e um frontend React com design moderno e responsivo.

## Arquitetura do Sistema

### Backend (Flask)
- **Framework**: Flask 3.0+ com SQLAlchemy
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **APIs**: 80+ endpoints REST
- **Autenticação**: JWT tokens
- **CORS**: Configurado para frontend
- **Porta**: 5000 (padrão)

### Frontend (React)
- **Framework**: React 18+ com Vite
- **Roteamento**: React Router DOM
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Estilização**: Tailwind CSS com tema personalizado
- **Internacionalização**: Suporte a PT, EN, ES
- **Porta**: 5173 (desenvolvimento) / 3000 (produção)

## Pré-requisitos

### Servidor
- **Sistema Operacional**: Ubuntu 20.04+ ou CentOS 8+
- **RAM**: Mínimo 2GB, recomendado 4GB+
- **Armazenamento**: Mínimo 10GB livres
- **CPU**: 2 cores mínimo

### Software
- **Python**: 3.9+
- **Node.js**: 18+
- **npm/pnpm**: Última versão
- **PostgreSQL**: 13+ (produção)
- **Nginx**: 1.18+ (proxy reverso)
- **SSL**: Certbot para HTTPS

## Preparação do Ambiente

### 1. Atualização do Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib nginx certbot python3-certbot-nginx
```

### 2. Configuração do PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco
sudo -u postgres psql
CREATE USER racesetup WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE racesetup_prod OWNER racesetup;
GRANT ALL PRIVILEGES ON DATABASE racesetup_prod TO racesetup;
\q
```

### 3. Configuração do Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Implantação do Backend

### 1. Preparação dos Arquivos
```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/racesetup
sudo chown $USER:$USER /var/www/racesetup

# Copiar arquivos do backend
cp -r racing-setups-backend/* /var/www/racesetup/
cd /var/www/racesetup
```

### 2. Configuração do Ambiente Virtual
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### 3. Configuração de Produção
Criar arquivo `/var/www/racesetup/config.py`:
```python
import os

class ProductionConfig:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'sua-chave-secreta-muito-segura'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://racesetup:sua_senha_segura@localhost/racesetup_prod'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = False
    TESTING = False
    
    # CORS
    CORS_ORIGINS = ['https://seudominio.com']
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-chave-secreta'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hora
```

### 4. Variáveis de Ambiente
Criar arquivo `/var/www/racesetup/.env`:
```bash
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta-muito-segura-aqui
DATABASE_URL=postgresql://racesetup:sua_senha_segura@localhost/racesetup_prod
JWT_SECRET_KEY=jwt-chave-secreta-aqui
```

### 5. Inicialização do Banco
```bash
source venv/bin/activate
python src/main.py  # Criar tabelas
python src/seed_data_complete.py  # Popular dados iniciais
```

### 6. Configuração do Gunicorn
Criar arquivo `/var/www/racesetup/gunicorn.conf.py`:
```python
bind = "127.0.0.1:5000"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2
max_requests = 1000
max_requests_jitter = 100
preload_app = True
```

### 7. Serviço Systemd
Criar arquivo `/etc/systemd/system/racesetup-backend.service`:
```ini
[Unit]
Description=RaceSetup Pro Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/racesetup
Environment=PATH=/var/www/racesetup/venv/bin
EnvironmentFile=/var/www/racesetup/.env
ExecStart=/var/www/racesetup/venv/bin/gunicorn -c gunicorn.conf.py src.main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable racesetup-backend
sudo systemctl start racesetup-backend
```

## Implantação do Frontend

### 1. Preparação e Build
```bash
cd racing-setups-frontend
npm install
npm run build
```

### 2. Configuração de Produção
Editar `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### 3. Copiar Arquivos Buildados
```bash
sudo mkdir -p /var/www/racesetup-frontend
sudo cp -r dist/* /var/www/racesetup-frontend/
sudo chown -R www-data:www-data /var/www/racesetup-frontend
```

## Configuração do Nginx

### 1. Configuração Principal
Criar arquivo `/etc/nginx/sites-available/racesetup`:
```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        root /var/www/racesetup-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
```

### 2. Ativar Configuração
```bash
sudo ln -s /etc/nginx/sites-available/racesetup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Configuração SSL

### 1. Obter Certificado
```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 2. Renovação Automática
```bash
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoramento e Logs

### 1. Logs do Backend
```bash
# Ver logs em tempo real
sudo journalctl -u racesetup-backend -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Monitoramento de Performance
```bash
# Status dos serviços
sudo systemctl status racesetup-backend
sudo systemctl status nginx
sudo systemctl status postgresql

# Uso de recursos
htop
df -h
free -h
```

## Backup e Manutenção

### 1. Backup do Banco de Dados
```bash
# Script de backup diário
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U racesetup -h localhost racesetup_prod > /backup/racesetup_$DATE.sql
find /backup -name "racesetup_*.sql" -mtime +7 -delete
```

### 2. Backup dos Arquivos
```bash
# Backup da aplicação
tar -czf /backup/racesetup_app_$(date +%Y%m%d).tar.gz /var/www/racesetup /var/www/racesetup-frontend
```

### 3. Atualizações
```bash
# Atualizar backend
cd /var/www/racesetup
source venv/bin/activate
git pull origin main  # se usando Git
pip install -r requirements.txt
sudo systemctl restart racesetup-backend

# Atualizar frontend
cd racing-setups-frontend
npm install
npm run build
sudo cp -r dist/* /var/www/racesetup-frontend/
```

## Solução de Problemas

### 1. Backend não inicia
```bash
# Verificar logs
sudo journalctl -u racesetup-backend -n 50

# Verificar configuração
source /var/www/racesetup/venv/bin/activate
cd /var/www/racesetup
python src/main.py
```

### 2. Frontend não carrega
```bash
# Verificar permissões
sudo chown -R www-data:www-data /var/www/racesetup-frontend

# Verificar Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Problemas de CORS
- Verificar configuração de CORS no backend
- Confirmar domínio correto nas configurações
- Verificar headers no Nginx

### 4. Banco de dados
```bash
# Verificar conexão
sudo -u postgres psql -d racesetup_prod -c "SELECT version();"

# Verificar tabelas
sudo -u postgres psql -d racesetup_prod -c "\dt"
```

## Otimizações de Performance

### 1. Cache Redis (Opcional)
```bash
sudo apt install redis-server
pip install redis flask-caching
```

### 2. CDN para Assets
- Configurar CloudFlare ou AWS CloudFront
- Otimizar imagens com WebP
- Minificar CSS/JS

### 3. Monitoramento Avançado
- Instalar Prometheus + Grafana
- Configurar alertas
- Monitorar métricas de aplicação

## Segurança

### 1. Firewall Avançado
```bash
# Fail2ban para proteção contra ataques
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 2. Atualizações de Segurança
```bash
# Atualizações automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Backup de Segurança
- Backup offsite regular
- Teste de restauração mensal
- Criptografia de backups

## Conclusão

Este guia fornece uma base sólida para implantar o RaceSetup Pro em produção. Lembre-se de:

1. **Testar** todas as funcionalidades após implantação
2. **Monitorar** logs e performance regularmente
3. **Manter** backups atualizados
4. **Atualizar** dependências de segurança
5. **Documentar** mudanças e configurações

Para suporte adicional, consulte a documentação específica de cada componente ou entre em contato com a equipe de desenvolvimento.

