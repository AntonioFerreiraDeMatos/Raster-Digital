# Raster Digital — site comercial + captação de leads

Site (Vite + React) e servidor Node/Express com MySQL para o formulário de proposta e o painel de leads.

## Estrutura
- `src/` — site público (`App.tsx`), painel (`src/admin/`), dados editáveis em `src/data/` e `src/config/site.ts`
- `server/` — API Express (`/api/leads`, `/api/admin/*`), migrations SQL e testes
- Páginas: `/` · `/privacidade` · `/admin` (painel, não indexado)

## Adicionar um projeto novo
Edite `src/data/projects.ts` (imagens em `public/img/`). Ele aparece automaticamente em **Projetos** e em **Marcas**.
Vídeo de depoimento da Amanda: preencha `testimonialVideo` com o link *embed* do YouTube/Vimeo.

## Rodar localmente
```bash
cp .env.example .env    # preencha banco e JWT_SECRET
npm install
npm run build && npm start          # http://localhost:3000
ADMIN_NAME="Antonio Matos" ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
npm test                             # testes ponta a ponta (NUNCA contra o banco de produção)
```
Desenvolvimento com recarga: `npm run server` + `npm run dev` (o Vite repassa `/api` para a porta 3000).

## Deploy na Hostinger (o push na `main` publica automaticamente)
Antes do primeiro deploy desta versão:
1. hPanel → Bancos de dados: criar um banco MySQL e um usuário para a Raster.
2. hPanel → Node.js do domínio: mudar o tipo de **Vite (estático)** para **Express/Node**, comando de build `npm run build`, arquivo de entrada `server/index.js`.
3. Configurar as variáveis de ambiente (ver `.env.example`), com `DB_HOST=127.0.0.1` e `NODE_ENV=production`.
4. Fazer o deploy. As tabelas são criadas automaticamente na inicialização (migrations).
5. Criar o usuário do painel com `npm run admin:create` (via SSH, com as variáveis ADMIN_*).
