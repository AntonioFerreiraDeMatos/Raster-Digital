# Changelog — site Raster Digital

Mudanças publicadas em https://www.rasterdigital.com.br (cada item foi para o ar com um push na `main`).

## 2026-11-24 — Reestruturação (publicada em 24/11, merge 992c4d8)

Ponto de restauração: tag `pre-reestruturacao-2026-11-24` (o site no ar até aqui).

### Ajustes depois da publicação
- Segmentos de /sistemas-personalizados em áreas amplas de negócio, no lugar de nichos (migration 010).
- "Parcelamento facilitado" no lugar de "em até 3x" (cards, simulador, textos das páginas e llms.txt). O número de parcelas do /admin só liga ou desliga o texto (0 = não mostra).

### Página inicial mais curta (12 → 7 seções, ~2.060 → ~730 palavras)
- **Topo:** "Tecnologia que transforma ideias em soluções." com o "R" 3D de volta como destaque (cena 3D sem alterações). H1: "Sites, sistemas e soluções digitais em Fortaleza e Caucaia – CE" (migration 009, só onde o texto ainda era o original).
- **Soluções em 3 pilares** (Presença digital, Gestão inteligente, Soluções personalizadas) com "a partir de" calculado dos preços do /admin.
- **Diferenciais** (6) e **Como funciona** (4 etapas) reúnem o que antes se repetia no topo, nos preços e no FAQ.
- **Projetos** em cards compactos com link para o case. A vitrine com os aparelhos em perspectiva foi para `/projetos`.
- **Fundador:** uma única apresentação, com a mesma composição da foto (bordas que se dissolvem, luz azul, placa com nome e cargo) e o selo de formação.
- **Chamada final** "Tem um projeto em mente?" com o formulário.
- Saíram da página inicial (o conteúdo foi para as páginas internas): Desafios, 9 cards de Soluções, Preços, Manutenção, Simulador, Segmentos, FAQ e a faixa de marcas.

### Páginas internas (SEO em silo)
- Novas: `/criacao-de-sites`, `/loja-virtual`, `/cardapio-digital`, `/sistemas-personalizados`, `/painel-administrativo`, `/criacao-de-sites-fortaleza`, `/criacao-de-sites-caucaia`, `/precos`, `/projetos` e um case por projeto.
- Cada uma com título, descrição, canonical, H1, breadcrumb, FAQ, links relacionados, formulário e dados estruturados. Preços sempre vêm do /admin (marcadores `{{preco:slug}}`).
- Sitemap gerado pelo servidor; `/llms.txt` com o novo posicionamento e a lista de páginas.
- Dados estruturados da empresa gerados com os dados do banco (faixa de preço atualizada). Sem endereço, avaliações ou números inventados.

### Preços, simulador e formulário
- **Nenhum preço foi alterado.** A tabela proposta no briefing aguarda aprovação.
- Preços em grupos visíveis (sem abas); escopo sem marcadores duplicados; "Não inclui…" como observação.
- Simulador: mensagem do WhatsApp no modelo pedido (uma informação por linha), resumo das escolhas e condições.
- Formulário com 7 campos (saíram "Investimento" e "Manutenção mensal?", que eram opcionais). Empresa, e-mail e segmento continuam obrigatórios até confirmar o que o CRM do ERP aceita.

### Correções e acessibilidade
- Textos colados para leitores de tela e buscadores ("sistemasob análise", "EssencialA partir de", "PremiumR$ 99,90").
- Alvos de toque de pelo menos 24 px; menu mais opaco; /404 com status 404; 301 dos endereços .html.
- Testado em 390 px e 1366 px: sem rolagem horizontal, um H1 por página, sem erros no console.

## 2026-11-20

### Primeira dobra com o fundador e a logo 3D
- **Foto real de Antonio Matos em destaque** (cerca de 35% da largura): bordas que se dissolvem no fundo, luz azul/ciano, entrada suave e leve profundidade com o mouse.
- **Logo 3D preservada:** mesma cena (`heroScene.ts` sem alterações), menor e ao lado da foto. Animação, órbitas, luzes, chão de pixels e giro no clique continuam iguais.
- Placa com nome e cargo revelada por animação e **selo de formação** (Análise e Desenvolvimento de Sistemas, Unifor, conclusão prevista para 2026), editável em **/admin → Conteúdo → Fundador** (curso, instituição e situação).
- **Faixa de credibilidade** com 5 compromissos no rodapé do topo (lista no celular).
- Nova apresentação do fundador no topo ("Você não precisa lidar com intermediários…") e texto em três parágrafos na seção "Quem desenvolve" (migration 008, só onde o texto ainda era o original).
- Removidas as etiquetas flutuantes "Sites / Lojas virtuais / Sistemas / Dashboards"; no celular, o véu escuro atrás do texto foi encurtado para a logo 3D manter o brilho.
- **Sem mudança** em títulos, botões, preços, formulário, links, navegação ou SEO. Com "reduzir movimento", sem animações e com a logo estática.

### Textos de conversão e SEO local (Caucaia e Fortaleza)
- **Primeira dobra:** novo título "Seu negócio merece mais do que estar na internet. Merece crescer com tecnologia.", subtítulo e botões "Quero uma solução para meu negócio" / "Conhecer projetos reais". Apresentação do fundador com foto logo abaixo do texto (editável em **/admin → Conteúdo → Primeira dobra → Apresentação do fundador**).
- **H1 para o Google:** "Criação de sites profissionais em Caucaia – CE" (campo "Chamada acima do título", mesmo visual de antes).
- **Nova seção "Quantas oportunidades seu negócio pode estar perdendo?"** com 6 desafios do empresário e botão para a proposta (`#desafios`).
- Textos orientados a benefício nos cards de Soluções, nas descrições dos 16 serviços e nas frases dos planos de manutenção; novos títulos em Soluções, Projetos, Preços, Manutenção, Simulador, Segmentos, FAQ e formulário.
- Fundador: novo texto e destaques; botão "Falar com o desenvolvedor" no WhatsApp.
- Frases comerciais acima dos botões de Soluções e Projetos; botão do formulário "Quero receber minha proposta".
- FAQ com Caucaia e duas perguntas novas (atendimento direto com o desenvolvedor e botão de WhatsApp).
- SEO: title "Raster Digital | Criação de Sites em Caucaia e Fortaleza", nova meta description, Open Graph, schema com Caucaia e Região Metropolitana em `areaServed`, HTML para buscadores e `/llms.txt` atualizados, sitemap com nova data.
- Textos do banco trocados pela migration 007, só onde ainda estavam iguais ao original (o que foi editado no painel fica como está).
- **Sem mudança** em preços, parcelamento, escopos, planos, simulador, formulário, gravação de leads, integração com o ERP, imagens, cores, fontes ou animações.

### Site mais imersivo
- **"R" da marca em 3D** no topo (Three.js), com órbitas, chão de grade e reflexos. Clicar no "R" faz ele girar.
  - Carrega depois que a página abre, em arquivo separado, sem atrasar o carregamento.
  - Pausa quando sai da tela ou a aba fica em segundo plano; versão mais leve no celular e em aparelhos simples.
  - Quem prefere menos movimento, usa economia de dados ou não tem WebGL vê a versão estática.
- Ambiente do site: manchas de luz com parallax na rolagem, luz que segue o cursor e barra de progresso de leitura.
- Cards com borda iluminada e leve inclinação 3D sob o mouse (só com mouse; no celular nada muda).
- Seções entram saindo do desfoque para o foco; aparelhos dos projetos ganham perspectiva na rolagem.

### Preços
- **Parcelamento:** cada card mostra "ou em até 3x de R$ …" e o simulador mostra "Parcele em até 3x". O número de parcelas fica em **/admin → Conteúdo → Parcelamento** (0 desliga).
- **Selo próprio por serviço:** novo campo "Selo do card" em **/admin → Serviços**. A Landing Page passa a mostrar **"Comece por aqui"** (migration 006). Sem selo, um serviço destacado continua com "Mais procurado".
- Texto da seção de preços: "pago uma vez e sem mensalidade obrigatória".
- **/llms.txt** (lido por Google e IAs) lista os Planos de Manutenção atuais (Essencial, Premium, Platinum) no lugar do valor antigo de R$ 59,90 e informa o parcelamento.

### Correções
- Banco novo: a migration do Cumbuco de Buggy impedia o cadastro dos outros projetos e marcas iniciais. Não afeta o site no ar.
- Lint: as funções dos planos de manutenção saíram de `Maintenance.tsx` para `src/lib/maintenance.ts`.
- Testes: novos testes de selo, parcelamento e llms.txt. Suíte completa: 23/23 com banco limpo.

## 2026-11-14

### Planos de Manutenção
- **Nova seção "Planos de Manutenção"** (`#manutencao`, link na navbar) com três planos:
  - **Essencial — R$ 49,90/mês:** monitoramento básico, 1 alteração simples, até 15 min de ajustes.
  - **Premium — R$ 99,90/mês:** selo *Mais recomendado*, até 2 alterações, relatório mensal, até 45 min.
  - **Platinum — R$ 149,90/mês:** selo *Exclusivo*, visual prata/platina, até 4 alterações, SEO técnico básico, até 90 min.
- Cada card tem o botão **Contratar** abrindo o WhatsApp oficial com o plano e o valor na mensagem.
- Observação sobre limites mensais **não acumulativos** e serviços orçados à parte (hospedagem e domínio não inclusos).
- Layout responsivo: três colunas no desktop; empilhado (01 → 02 → 03) no tablet e celular.
- **Removido** o card antigo "Manutenção opcional R$ 59,90/mês" da seção de Preços. O card de hospedagem passou a ocupar a largura toda.
- **Simulador:** a caixinha de manutenção de R$ 59,90 virou uma escolha entre *Sem manutenção*, Essencial, Premium e Platinum, com link para comparar os planos.
- **/admin → Conteúdo → Planos de manutenção:** textos, valores, benefícios, selos e estilo de cada plano passam a ser editáveis. A mudança aparece na hora nos cards, no WhatsApp e no simulador. O servidor valida os dados (valor obrigatório, estilo válido, de 1 a 4 planos).

### Testes
- Corrigida a falha intermitente do teste "minha senha" e do formulário: os arquivos de teste rodam em paralelo e cada um apagava os usuários e leads do outro. Agora cada arquivo limpa só os próprios dados. A troca de senha do painel sempre funcionou.
- Novo teste dos planos de manutenção. Suíte completa: 21/21 com banco limpo.

### Segurança
- Atualização de dependências com vulnerabilidades (PR #1, aberto pela Hostinger).

## 2026-11-12 / 13
- **Integração com o ERP:** leads do formulário vão para o CRM do ERP, com reenvio automático a cada 5 minutos e envio de leads antigos. Ativada em 14/11 com as variáveis `ERP_LEADS_URL`/`ERP_LEADS_TOKEN`.

## 2026-11-09
- Portfólio: novo print mobile da Amanda Cosméticos.
- Preços: itens não inclusos viram nota discreta.

## 2026-11-08
- **v2 comercial:** planos e preços por categoria, simulador de orçamento, faixa de marcas e painel de conteúdo (serviços, projetos, marcas, imagens e textos no banco).
- Plano avançado a partir de R$ 400 e destaque "loja vendendo 24h".
- **Reposicionamento comercial:** formulário de proposta com gravação em MySQL e painel `/admin` de leads.
- Formação do fundador e criação automática do primeiro administrador.
- Contato apenas pelo WhatsApp; ajustes na política de privacidade.

## 2026-07 a 2026-08
- Primeiras versões do site, interface premium, logo, WhatsApp e deploy automático.
