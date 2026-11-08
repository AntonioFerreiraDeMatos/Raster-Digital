CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','comercial') NOT NULL DEFAULT 'admin',
  active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leads (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  company VARCHAR(120) NOT NULL,
  whatsapp VARCHAR(13) NOT NULL,
  email VARCHAR(190) NOT NULL,
  segment VARCHAR(40) NOT NULL,
  service VARCHAR(40) NOT NULL,
  message TEXT NULL,
  status ENUM('novo','primeiro_contato','negociacao','proposta_enviada','convertido','perdido') NOT NULL DEFAULT 'novo',
  consent_at DATETIME NOT NULL,
  privacy_version VARCHAR(20) NOT NULL,
  source VARCHAR(120) NOT NULL DEFAULT 'site',
  utm_source VARCHAR(120) NULL,
  utm_medium VARCHAR(120) NULL,
  utm_campaign VARCHAR(120) NULL,
  landing_path VARCHAR(255) NULL,
  referrer VARCHAR(500) NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  submissions INT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_leads_status (status),
  KEY idx_leads_segment (segment),
  KEY idx_leads_created (created_at),
  KEY idx_leads_email (email),
  KEY idx_leads_whatsapp (whatsapp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lead_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id INT UNSIGNED NOT NULL,
  admin_user_id INT UNSIGNED NULL,
  type ENUM('criado','reenvio','status','observacao','edicao') NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NULL,
  body TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_events_lead (lead_id, created_at),
  CONSTRAINT fk_events_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  CONSTRAINT fk_events_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
