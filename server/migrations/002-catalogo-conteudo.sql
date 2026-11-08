-- Catálogo comercial, projetos, marcas, imagens e conteúdo editável pelo painel.
-- Compatível com MySQL 8 e MariaDB 10.x (sem tipo JSON: listas guardadas como texto JSON).

CREATE TABLE IF NOT EXISTS images (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mime VARCHAR(40) NOT NULL,
  data MEDIUMBLOB NOT NULL,
  bytes INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS services (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  category ENUM('presenca','comercial','profissional') NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(300) NOT NULL,
  price_cents INT UNSIGNED NULL,
  price_from TINYINT(1) NOT NULL DEFAULT 0,
  hosting_cents INT UNSIGNED NULL,
  scope TEXT NOT NULL,
  highlight TINYINT(1) NOT NULL DEFAULT 0,
  sort INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(60) NOT NULL UNIQUE,
  client VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL,
  segment VARCHAR(120) NOT NULL,
  summary VARCHAR(400) NOT NULL,
  url VARCHAR(300) NULL,
  features TEXT NOT NULL,
  theme ENUM('padrao','beleza','industrial') NOT NULL DEFAULT 'padrao',
  logo_url VARCHAR(300) NULL,
  cover_url VARCHAR(300) NULL,
  mobile_url VARCHAR(300) NULL,
  gallery TEXT NOT NULL,
  video_url VARCHAR(300) NULL,
  sort INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  logo_url VARCHAR(300) NOT NULL,
  url VARCHAR(300) NULL,
  relation VARCHAR(120) NOT NULL DEFAULT 'Cliente',
  sort INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  name VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Leads: novos campos comerciais (todos opcionais, não afetam registros existentes)
ALTER TABLE leads
  ADD COLUMN investment VARCHAR(40) NULL AFTER message,
  ADD COLUMN wants_maintenance TINYINT(1) NULL AFTER investment,
  ADD COLUMN plan_slug VARCHAR(60) NULL AFTER wants_maintenance,
  ADD COLUMN estimate_min_cents INT UNSIGNED NULL AFTER plan_slug,
  ADD COLUMN estimate_max_cents INT UNSIGNED NULL AFTER estimate_min_cents,
  ADD COLUMN estimate_summary TEXT NULL AFTER estimate_max_cents;

-- Novos status comerciais. "primeiro_contato" deixa de existir e passa a "negociacao".
ALTER TABLE leads MODIFY status ENUM('novo','primeiro_contato','negociacao','proposta_enviada','aguardando_retorno','convertido','perdido') NOT NULL DEFAULT 'novo';
UPDATE leads SET status = 'negociacao' WHERE status = 'primeiro_contato';
ALTER TABLE leads MODIFY status ENUM('novo','negociacao','proposta_enviada','aguardando_retorno','convertido','perdido') NOT NULL DEFAULT 'novo';
UPDATE lead_events SET from_status = 'negociacao' WHERE from_status = 'primeiro_contato';
UPDATE lead_events SET to_status = 'negociacao' WHERE to_status = 'primeiro_contato';
