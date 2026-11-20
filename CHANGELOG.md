# Changelog — site Raster Digital

Mudanças publicadas em https://www.rasterdigital.com.br (cada item foi para o ar com um push na `main`).

## 2026-11-20

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
