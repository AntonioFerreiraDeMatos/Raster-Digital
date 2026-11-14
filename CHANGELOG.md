# Changelog — site Raster Digital

Mudanças publicadas em https://www.rasterdigital.com.br (cada item foi para o ar com um push na `main`).

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
