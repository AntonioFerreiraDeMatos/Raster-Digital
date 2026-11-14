# Raster Digital — site comercial + captação de leads

Site institucional e comercial da Raster Digital (**https://www.rasterdigital.com.br**).

- **Front-end:** Vite + React 19 + TypeScript (CSS próprio em `src/styles/site.css`)
- **Servidor:** Node 22 + Express + MySQL (`mysql2`), que entrega o site com o conteúdo embutido, recebe o formulário de proposta e serve o painel `/admin`
- **Integração:** os leads do formulário são enviados ao CRM do ERP (`erp.rasterdigital.com.br`)

O histórico de mudanças está em [CHANGELOG.md](CHANGELOG.md).

## Seções do site

| Seção (âncora) | Componente | Conteúdo editável no /admin |
|---|---|---|
| Início `#inicio` | `Hero.tsx` | Primeira dobra |
| Soluções `#solucoes` | `Solutions.tsx` | Soluções |
| Marcas | `BrandMarquee.tsx` | Marcas |
| Projetos `#projetos` | `Projects.tsx` | Projetos |
| Preços `#precos` | `Pricing.tsx` | Serviços (planos de desenvolvimento) e Hospedagem |
| **Manutenção `#manutencao`** | `Maintenance.tsx` | **Planos de manutenção** |
| Simulador `#simulador` | `Simulator.tsx` | Simulador (complexidade e adicionais) + planos de manutenção |
| Segmentos | `Segments.tsx` | Soluções por segmento |
| Fundador | `Founder.tsx` | Fundador |
| Contato `#contato` | `LeadForm.tsx` | — (formulário de proposta) |

Páginas: `/` · `/privacidade` · `/admin` (painel, não indexado).

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
- Cada arquivo de teste limpa só os dados que ele mesmo criou, porque os arquivos rodam em paralelo.
- O formulário aceita no máximo 8 envios a cada 15 minutos por IP. Para repetir a suíte, reinicie o servidor entre as execuções, senão os testes de formulário recebem `429`.

## Deploy (Hostinger)

O **push na `main` publica automaticamente** (app Node/Express, build `npm run build`, entrada `server/index.js`, Node 22).

- Trabalhe numa branch e junte na `main` só quando estiver aprovado.
- As migrations (`server/migrations/*.sql`) rodam sozinhas na inicialização.
- Variáveis de ambiente: veja `.env.example`. Em produção, use `DB_HOST=127.0.0.1` e `NODE_ENV=production`.
- **Variáveis no hPanel:** adicione uma por vez pela tela *Variáveis de ambiente*, com o **tradutor do navegador desligado** (ele impede o salvamento e pode traduzir nomes). A API da Hostinger substitui o conjunto inteiro, então não a use para incluir uma única variável.
