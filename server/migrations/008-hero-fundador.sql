-- Primeira dobra com o fundador em destaque: somente TEXTOS (nenhum preço, link ou condição).
-- Cada troca só acontece se o texto ainda for o original exato; o que já foi editado no /admin fica como está.

-- Apresentação do fundador no topo
UPDATE settings SET value = REPLACE(value, '"intro":"Você conversa diretamente com quem desenvolve sua solução. Entendemos sua necessidade, planejamos o projeto e construímos uma tecnologia pensada para a realidade do seu negócio."', '"intro":"Você não precisa lidar com intermediários. Aqui, conversa diretamente com Antonio Matos, fundador e desenvolvedor da Raster Digital, desde o planejamento até o desenvolvimento da sua solução."') WHERE name = 'hero';

-- Seção "Quem desenvolve": novo texto em três parágrafos
UPDATE settings SET value = REPLACE(value, '"text":"Sou Antonio Matos, fundador e desenvolvedor da Raster Digital. Meu trabalho é transformar desafios empresariais em soluções digitais que facilitam processos, fortalecem marcas e criam novas oportunidades de negócio."', '"text":"Sou Antonio Matos, fundador e desenvolvedor da Raster Digital. Acredito que a tecnologia precisa resolver problemas reais, facilitar a rotina das empresas e criar novas oportunidades de crescimento.\\n\\nPor isso, participo diretamente do planejamento e desenvolvimento de cada solução, buscando entender as necessidades de cada negócio para entregar projetos com propósito, qualidade e transparência.\\n\\nAqui, você conversa diretamente com quem desenvolve seu projeto."') WHERE name = 'founder';

-- Selo de formação (curso, instituição e situação), editável no /admin
UPDATE settings SET value = REPLACE(value, '"role":"Fundador e desenvolvedor",', '"role":"Fundador e desenvolvedor","course":"Análise e Desenvolvimento de Sistemas","school":"Universidade de Fortaleza — Unifor","graduation":"Conclusão prevista: 2026",') WHERE name = 'founder' AND value NOT LIKE '%"course":%';
