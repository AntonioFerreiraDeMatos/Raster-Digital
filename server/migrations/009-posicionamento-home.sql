-- Novo posicionamento da primeira dobra ("Tecnologia que transforma ideias em soluções"): somente TEXTOS.
-- Nenhum preço, serviço, escopo, link, imagem ou contato é alterado.
-- Cada troca só acontece se o texto ainda for o original exato; o que já foi editado no /admin fica como está.
-- Num banco novo os textos vêm de server/data/defaults.js.
-- Para desfazer: troque os valores de volta em /admin → Conteúdo → Primeira dobra.

-- H1 (chamada acima do título): atuação + região, sem limitar a "criação de sites"
UPDATE settings SET value = REPLACE(value, '"eyebrow":"Criação de sites profissionais em Caucaia – CE"', '"eyebrow":"Sites, sistemas e soluções digitais em Fortaleza e Caucaia – CE"') WHERE name = 'hero';

-- Título e destaque
UPDATE settings SET value = REPLACE(value, '"title":"Seu negócio merece mais do que estar na internet."', '"title":"Tecnologia que transforma ideias"') WHERE name = 'hero';
UPDATE settings SET value = REPLACE(value, '"highlight":"Merece crescer com tecnologia."', '"highlight":"em soluções."') WHERE name = 'hero';

-- Texto de apoio
UPDATE settings SET value = REPLACE(value, '"subtitle":"Desenvolvemos sites profissionais, lojas virtuais e sistemas personalizados para empresas que querem conquistar clientes, aumentar oportunidades de vendas e simplificar sua operação."', '"subtitle":"Desenvolvemos sites, sistemas e plataformas personalizadas para empresas que desejam crescer, organizar processos e conquistar novas oportunidades."') WHERE name = 'hero';
