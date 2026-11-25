-- Preço de gestão, a pedido do Antonio (24/11/2026): "Sistemas de Gestão Completo" (slug personalizado)
-- passa de "a partir de R$ 799,90" para "a partir de R$ 589,90". A hospedagem (R$ 149,90/ano) não muda.
-- É o serviço que define o "a partir de" do pilar "Gestão inteligente" na página inicial,
-- então o valor fica igual em todo o site.
-- Só muda se o preço ainda for o anterior; se já foi alterado no /admin, nada muda.
-- Para desfazer: /admin → Serviços → Sistemas de Gestão Completo → preço 799,90.
UPDATE services SET price_cents = 58990 WHERE slug = 'personalizado' AND price_cents = 79990;
