-- Simulador: complexidade avançada a partir de R$ 400; destaque "loja 24 horas" nas soluções.
-- Só substitui os textos originais exatos; se já foram editados no painel, nada muda.
UPDATE settings SET value = REPLACE(value, '"id":"avancado","label":"Avançado","factor":null}', '"id":"avancado","label":"Avançado","factor":null,"min_cents":40000}') WHERE name = 'simulator';
UPDATE settings SET value = REPLACE(value, '"Venda pela internet."', '"Sua loja vendendo 24 horas por dia."') WHERE name = 'solutions';
