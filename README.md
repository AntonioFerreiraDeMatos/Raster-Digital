# Raster Digital — site comercial + captação de leads

Site institucional e comercial da Raster Digital (**https://www.rasterdigital.com.br**).

- **Front-end:** Vite + React 19 + TypeScript (CSS próprio em `src/styles/site.css`)
- **Servidor:** Node 22 + Express + MySQL (`mysql2`), que entrega o site com o conteúdo embutido, recebe o formulário de proposta e serve o painel `/admin`
- **Integração:** os leads do formulário são enviados ao CRM do ERP (`erp.rasterdigital.com.br`)

O histórico de mudanças está em [CHANGELOG.md](CHANGELOG.md).

## Página inicial (curta: apresentação comercial)

| Seção (âncora) | Componente | Onde editar |
|---|---|---|
| Início `#inicio` | `Hero.tsx` | /admin → Primeira dobra (o campo "Apresentação do fundador" não aparece mais no topo) |
| Soluções `#solucoes` | `Pillars.tsx` | `src/data/home.json` (3 pilares); o "a partir de" vem dos preços do /admin |
| Diferenciais `#diferenciais` | `Differentials.tsx` | `src/data/home.json` |
| Como funciona `#como-funciona` | `Steps.tsx` | `src/data/home.json` |
| Projetos `#projetos` | `Projects.tsx` | /admin → Projetos |
| Fundador `#fundador` | `Founder.tsx` | /admin → Fundador (os "Destaques" não aparecem mais) |
| Contato `#contato` | `LeadForm.tsx` | — (formulário; presente em todas as páginas) |

## Páginas internas (SEO em silo)

Cada página tem título, descrição, canonical, H1, breadcrumb, dados estruturados (Service, BreadcrumbList, FAQPage) e texto no HTML, montados pelo servidor (`server/lib/pages.js` + `server/lib/seo.js`) sobre o modelo `pagina.html`.

| Endereço | Conteúdo |
|---|---|
| `/criacao-de-sites`, `/loja-virtual`, `/cardapio-digital` | Presença digital |
| `/sistemas-personalizados`, `/painel-administrativo` | Gestão e sistemas (os Segmentos do /admin aparecem aqui como exemplos) |
| `/criacao-de-sites-fortaleza`, `/criacao-de-sites-caucaia` | SEO local (conteúdo próprio de cada cidade) |
| `/precos` | Todos os serviços, hospedagem, planos de manutenção e simulador |
| `/projetos`, `/projetos/<slug>` | Portfólio e um case por projeto ativo no /admin |

- **Textos:** `src/data/pages/<pagina>.json`. Preços nunca são escritos no texto: use `{{preco:slug-do-servico}}` e `{{parcelamento}}`, trocados pelos valores atuais do /admin.
- **Cases:** `src/data/cases.json` (necessidade, solução, objetivo, funcionalidades e depoimento). Só o que está documentado: campos `null` não aparecem. Nunca invente depoimentos ou resultados.
- **Serviço inativo** no /admin some das páginas (sem card quebrado); no texto, o marcador vira "valor sob consulta".
- **Sitemap** (`/sitemap.xml`) é gerado pelo servidor com as páginas e os projetos ativos. Ao revisar textos, atualize `CONTENT_UPDATED` em `server/lib/pages.js`.
- **Endereços únicos:** `/index.html`, `/privacidade.html`, barra no fim → 301; `/404` responde 404; o modelo `/pagina` nunca é servido.
- **Links antigos** da página inicial (`#precos`, `#simulador`, `#manutencao`, `#plano-…`) levam para `/precos` (`src/main.tsx`).

Outras páginas: `/privacidade` · `/admin` (painel, não indexado).

Em desenvolvimento (Vite), abra uma página interna em `/pagina.html?p=/criacao-de-sites`.

## Painel /admin

- **Leads:** indicadores, filtros, detalhes, status, observações e histórico. O perfil *comercial* não exclui leads.
- **Catálogo:** serviços, projetos, marcas e imagens (as imagens ficam no banco).
- **Conteúdo:** textos e listas de cada seção, salvos na tabela `settings`. A alteração aparece no site na hora.
- **Minha senha:** troca da senha do usuário logado.

Só o perfil **administrador** altera conteúdo. Os valores padrão ficam em `server/data/defaults.js` e só preenchem o banco quando a chave ainda não existe. Depois do primeiro deploy, edite pelo /admin.

### Planos de manutenção

Configuração `maintenancePlans` (/admin → Conteúdo → *Planos de manutenção*):

- Textos da seção: chamada, título, destaque (em azul), subtítulo e observação.
- De 1 a 4 planos. Cada um tem nome, número, frase, **valor mensal**, etiquetas de solicitações e de tempo, benefícios, selo (vazio = sem selo) e **estilo** (`essencial`, `premium` ou `platinum`, que define o visual do card).
- O botão *Contratar* abre o WhatsApp de **Contatos e redes** com o plano e o valor na mensagem.
- O simulador oferece os mesmos planos. O valor escolhido entra na estimativa, na mensagem do WhatsApp e no lead.

O servidor recusa planos sem valor, com estilo inválido ou com a lista vazia.

## Integração com o ERP

Cada lead do formulário é enviado ao endpoint `POST /api/v1/integrations/site-leads` do ERP (`server/lib/erpSync.js`):

- Ele é enviado logo após a resposta ao visitante. Se falhar, a rotina repete a cada 5 minutos e também envia leads antigos ainda não sincronizados.
- Ativação: variáveis `ERP_LEADS_URL` e `ERP_LEADS_TOKEN` no site e o **mesmo** token em `SITE_LEADS_TOKEN` no ERP. Sem elas, a integração fica desligada e o site funciona normalmente.

## Rodar localmente

```bash
cp .env.example .env    # preencha banco e JWT_SECRET (mínimo 32 caracteres)
npm install
npm run build && npm start          # http://localhost:3000
ADMIN_NAME="Antonio Matos" ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
```

Desenvolvimento com recarga: `npm run server` + `npm run dev` (o Vite repassa `/api` para a porta 3000).

## Testes

```bash
npm run build && npm start   # em um terminal, apontando para um banco de TESTE
npm test                     # em outro (BASE_URL=http://localhost:PORTA se não for 3000)
```

- **Nunca** rode os testes contra o banco de produção (eles criam e apagam registros `@raster.test`).
- `server/test/pages.test.js` só faz leituras (páginas, SEO técnico, sitemap, formatação de preços): `BASE_URL=http://localhost:PORTA node --test server/test/pages.test.js`.
- Cada arquivo de teste limpa só os dados que ele mesmo criou, porque os arquivos rodam em paralelo.
- O formulário aceita no máximo 8 envios a cada 15 minutos por IP. Para repetir a suíte, reinicie o servidor entre as execuções, senão os testes de formulário recebem `429`.

## Deploy (Hostinger)

O **push na `main` publica automaticamente** (app Node/Express, build `npm run build`, entrada `server/index.js`, Node 22).

- Trabalhe numa branch e junte na `main` só quando estiver aprovado.
- As migrations (`server/migrations/*.sql`) rodam sozinhas na inicialização.
- Variáveis de ambiente: veja `.env.example`. Em produção, use `DB_HOST=127.0.0.1` e `NODE_ENV=production`.
- **Variáveis no hPanel:** adicione uma por vez pela tela *Variáveis de ambiente*, com o **tradutor do navegador desligado** (ele impede o salvamento e pode traduzir nomes). A API da Hostinger substitui o conjunto inteiro, então não a use para incluir uma única variável.
