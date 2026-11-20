-- Portfólio: projeto e marca Cumbuco de Buggy (não duplica se já existir).
-- Só age em bancos que já têm conteúdo: num banco novo, as tabelas estão vazias e o
-- conteúdo inicial (server/data/defaults.js, que já inclui o Cumbuco) é gravado depois das migrations.
INSERT IGNORE INTO projects (slug, client, title, segment, summary, url, features, theme, logo_url, cover_url, mobile_url, gallery, video_url, sort)
SELECT 'cumbuco-de-buggy', 'Cumbuco de Buggy', 'Site de turismo trilíngue', 'Turismo e passeios',
  'Site rápido em português, inglês e espanhol para passeios de buggy em Cumbuco, com galeria, vídeo e reservas direto pelo WhatsApp.',
  'https://cumbucodebuggy.online',
  '["Português, inglês e espanhol","Roteiros de passeio","Galeria de fotos e vídeo","Avaliações de clientes","Reservas pelo WhatsApp","SEO para turismo"]',
  'padrao', '/img/brands/cumbuco-de-buggy.webp', '/img/projects/cumbuco-desktop.webp', '/img/projects/cumbuco-mobile.webp',
  '[]', NULL, 2
FROM DUAL WHERE EXISTS (SELECT 1 FROM projects);

INSERT INTO brands (name, logo_url, url, relation, sort)
SELECT 'Cumbuco de Buggy', '/img/brands/cumbuco-de-buggy.webp', 'https://cumbucodebuggy.online', 'Cliente · Site de turismo', 2
FROM DUAL WHERE EXISTS (SELECT 1 FROM brands) AND NOT EXISTS (SELECT 1 FROM brands WHERE name = 'Cumbuco de Buggy');
