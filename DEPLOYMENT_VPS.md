# 🚀 Guia de Deploy em VPS (Arc Invoice)

Este guia cobre o processo profissional de colocar o **Arc Invoice** no ar usando uma VPS paga (Virtual Private Server) e seu domínio `arcinvoice.xyz`.

---

## 🔄 O Fluxo Correto (GitHub vs. Deploy)

> **Dúvida:** *"Não é melhor fazer deploy antes e depois jogar no GitHub?"*

**Resposta:** Não. O fluxo profissional é **PC Local** ➔ **GitHub** ➔ **VPS (Servidor)**.

1.  **Segurança:** O GitHub é seu "cofre". Se seu PC queimar, o código está salvo.
2.  **Sincronia:** A VPS "puxa" o código do GitHub. Você não sobe arquivos do seu PC direto para o servidor (isso é inseguro e difícil de manter).
3.  **Deploy Contínuo:** No futuro, cada vez que você der `git push`, o servidor pode atualizar sozinho.

---

## 1️⃣ Criando o Repositório GitHub

Já que seu usuário é `cryptoraiz`:

1.  Acesse [github.com/new](https://github.com/new).
2.  **Repository name:** `arc-invoice` (Importante manter o nome que definimos no projeto).
3.  **Public/Private:** Escolha *Public* (mais fácil para deploy) ou *Private* (precisa configurar chaves SSH).
4.  **Não marque** "Add a README" ou .gitignore (nós já criamos isso no seu PC).
5.  Clique em **Create repository**.
6.  Copie os comandos que aparecem na tela (seção "...or push an existing repository"). Serão parecidos com:

```bash
git remote add origin https://github.com/cryptoraiz/arc-invoice.git
git push -u origin master
```

---

## 2️⃣ Preparando a VPS (Máquina Virtual)

Recomendação de VPS: **DigitalOcean (Droplet)**, **Vultr**, **Hetzner** ou **AWS Lightsail**.
*Sistema Operacional:* **Ubuntu 22.04 LTS** (Padrão de mercado).

### A. Acesso SSH
Acesse seu terminal (no Windows use o PowerShell ou Terminal):
```bash
ssh root@SEU_IP_DA_VPS
# Digite a senha que a provedora te enviou
```

### B. Instalação Básica
Rode no terminal da VPS:
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar gerenciador de processos (PM2)
sudo npm install -g pm2

# Instalar Servidor Web (Nginx)
sudo apt install -y nginx

# Instalar Certbot (para HTTPS/Cadeado)
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3️⃣ Configurando o Backend e Frontend

### A. Clonar o Projeto
Na VPS (`/var/www` é o padrão para sites):
```bash
cd /var/www
git clone https://github.com/cryptoraiz/arc-invoice.git
cd arc-invoice
```

### B. Setup
```bash
# Instalar dependências globais
npm install

# Instalar dependências do Frontend e Backend
cd frontend && npm install
cd ../backend && npm install
```

### C. Build do Frontend (React)
O React precisa ser "compilado" para HTML/CSS/JS estático.
```bash
cd /var/www/arc-invoice/frontend
# Crie o .env de produção
nano .env
# (Cole suas chaves da Arc Network aqui e salve com Ctrl+X, Y, Enter)

# Compilar
npm run build
```
Isso cria uma pasta `dist` com seu site pronto.

### D. Setup do Backend (Node.js)
```bash
cd /var/www/arc-invoice/backend
nano .env.local
# (Cole a string do MongoDB aqui)

# Iniciar com PM2 (para ficar rodando para sempre)
pm2 start server.js --name "arc-backend"
pm2 save
```

---

## 4️⃣ Configurando o Domínio (arcinvoice.xyz)

1.  Vá onde você comprou o domínio (Namecheap, GoDaddy, etc).
2.  Procure a configuração **DNS**.
3.  Crie dois registros do tipo **A**:
    *   **Host:** `@` ➔ **Value:** `IP_DA_SUA_VPS`
    *   **Host:** `www` ➔ **Value:** `IP_DA_SUA_VPS`

---

## 5️⃣ Colocando no Ar (Nginx)

O Nginx vai receber quem digita `arcinvoice.xyz` e mostrar o React. Se for uma chamada de API, ele manda para o Backend.

Apague a config padrão e crie a do Arc Invoice:
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/arcinvoice
```

Cole isso (ajuste o domínio):
```nginx
server {
    listen 80;
    server_name arcinvoice.xyz www.arcinvoice.xyz;

    # Frontend (React)
    location / {
        root /var/www/arc-invoice/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend (API)
    location /api/ {
        proxy_pass http://localhost:3000; # Porta do seu backend
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/arcinvoice /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6️⃣ HTTPS (Cadeado de Segurança)

Finalize com o certificado SSL gratuito:
```bash
sudo certbot --nginx -d arcinvoice.xyz -d www.arcinvoice.xyz
```
Responda as perguntas e pronto! Seu site estará seguro em `https://arcinvoice.xyz`.

---

## ✅ Resumo da Ópera

1.  **Código:** Seu PC ➔ GitHub.
2.  **Deploy:** GitHub ➔ VPS.
3.  **Build:** React vira HTML na pasta `dist`.
4.  **Servidor:** Nginx serve o HTML e joga as APIs para o Node.js.
