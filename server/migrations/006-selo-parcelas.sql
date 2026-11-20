-- Selo próprio por serviço (ex.: "Comece por aqui"). Vazio = "Mais procurado" quando destacado.
ALTER TABLE services ADD COLUMN badge VARCHAR(40) NULL AFTER highlight;

-- A Landing Page vira a porta de entrada do catálogo.
UPDATE services SET badge = 'Comece por aqui' WHERE slug = 'landing-page' AND badge IS NULL;
