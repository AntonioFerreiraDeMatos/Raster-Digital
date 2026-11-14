-- Controle do envio de cada lead para o ERP (erp.rasterdigital.com.br).
ALTER TABLE leads
  ADD COLUMN erp_lead_id INT UNSIGNED NULL,
  ADD COLUMN erp_synced_at DATETIME NULL,
  ADD COLUMN erp_attempts INT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN erp_last_error VARCHAR(255) NULL,
  ADD KEY idx_leads_erp_pending (erp_synced_at, erp_attempts);
