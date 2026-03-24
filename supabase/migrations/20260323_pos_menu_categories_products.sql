-- ─────────────────────────────────────────────────────────────────────────────
-- POS Menu: Categories & Products (District Club menu)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Upsert categories
INSERT INTO pos_categories (name, icon, display_order, is_active)
VALUES
  ('Petit-Déjeuner & Snacks', 'cookie',     1, true),
  ('Cafés & Thés',            'coffee',     2, true),
  ('Salades',                 'circle-dot', 3, true),
  ('Boissons Fraîches',       'cup-soda',   4, true),
  ('Desserts',                'cookie',     5, true)
ON CONFLICT (name) DO UPDATE
  SET icon          = EXCLUDED.icon,
      display_order = EXCLUDED.display_order,
      is_active     = EXCLUDED.is_active;

-- 2. Insert products (using a CTE to resolve category ids by name)
WITH cats AS (
  SELECT id, name FROM pos_categories
)
INSERT INTO pos_products (category_id, name, product_type, price, price_ttc, selling_price_ht, tax_rate, purchase_price, stock_quantity, is_active)
SELECT c.id, p.name, 'bien', p.price, p.price, p.price, 0, 0, NULL, true
FROM (VALUES

  -- ── Petit-Déjeuner & Snacks ──────────────────────────────────────────
  ('Petit-Déjeuner & Snacks', 'Manaïch Zaatar',                           2500),
  ('Petit-Déjeuner & Snacks', 'Manaïch Fromage',                          2500),
  ('Petit-Déjeuner & Snacks', 'Manaïch Mix',                              2500),
  ('Petit-Déjeuner & Snacks', 'Granola maison',                           5000),
  ('Petit-Déjeuner & Snacks', 'Crackers au zaatar',                       3500),
  ('Petit-Déjeuner & Snacks', 'Brioche au zaatar & fromage de chèvre',    4500),
  ('Petit-Déjeuner & Snacks', 'Pain de mie beurre de cacahuète & banane', 3500),
  ('Petit-Déjeuner & Snacks', 'Pain de mie halloumi & miel',              5500),
  ('Petit-Déjeuner & Snacks', 'Cookies healthy chocolat',                 2000),
  ('Petit-Déjeuner & Snacks', 'Pancakes healthy',                         4500),
  ('Petit-Déjeuner & Snacks', 'Crêpes healthy',                           4000),

  -- ── Cafés & Thés ─────────────────────────────────────────────────────
  ('Cafés & Thés', 'Espresso',                  2000),
  ('Cafés & Thés', 'Americano',                 3000),
  ('Cafés & Thés', 'Cappuccino',                4000),
  ('Cafés & Thés', 'Latte classique',           4000),
  ('Cafés & Thés', 'Flat White',                3000),
  ('Cafés & Thés', 'Chocolat chaud',            3500),
  ('Cafés & Thés', 'Matcha Latte',              5000),
  ('Cafés & Thés', 'Espresso à l''eau de coco', 2500),
  ('Cafés & Thés', 'Caramel Frappé',            4500),
  ('Cafés & Thés', 'Iced Rose Matcha',          5000),
  ('Cafés & Thés', 'Spanish Latte',             5000),
  ('Cafés & Thés', 'Affogato',                  4000),
  ('Cafés & Thés', 'Thés Dammann Frères',       2500),

  -- ── Salades ──────────────────────────────────────────────────────────
  ('Salades', 'Salade thaï aux crevettes',   10000),
  ('Salades', 'Salade de boule de chèvre',   10000),
  ('Salades', 'Salade césar façon District', 10000),
  ('Salades', 'Salade Friké au poulet',      10000),

  -- ── Boissons Fraîches ────────────────────────────────────────────────
  ('Boissons Fraîches', 'Perrier',                  2000),
  ('Boissons Fraîches', 'Red Bull',                 2000),
  ('Boissons Fraîches', 'Eau minérale (petite)',     500),
  ('Boissons Fraîches', 'Eau minérale (grande)',    1000),
  ('Boissons Fraîches', 'Eau de coco',              2000),
  ('Boissons Fraîches', 'Jus nature',               3000),
  ('Boissons Fraîches', 'Mocktail fait maison',     3500),
  ('Boissons Fraîches', 'Detox Shot',               1500),

  -- ── Desserts ─────────────────────────────────────────────────────────
  ('Desserts', 'Cake matcha',             4000),
  ('Desserts', 'Brownie double chocolat', 4000),
  ('Desserts', 'Cake thé chaï & amande',  4000),
  ('Desserts', 'Tiramisu healthy',        4000),
  ('Desserts', 'Energy Ball',             1500),
  ('Desserts', 'Lazy cake',              3000)

) AS p(category_name, name, price)
JOIN cats c ON c.name = p.category_name
ON CONFLICT (name) DO UPDATE
  SET category_id = EXCLUDED.category_id,
      price       = EXCLUDED.price,
      price_ttc   = EXCLUDED.price_ttc,
      selling_price_ht = EXCLUDED.selling_price_ht,
      is_active   = EXCLUDED.is_active;
