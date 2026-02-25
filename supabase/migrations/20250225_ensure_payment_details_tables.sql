-- ═══════════════════════════════════════════════════════════════
-- Ensure pos_order_payments table exists with all needed columns
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pos_order_payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES pos_orders(id) ON DELETE CASCADE,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_returned NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE pos_order_payments ADD COLUMN IF NOT EXISTS amount_received NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pos_order_payments ADD COLUMN IF NOT EXISTS amount_returned NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE pos_order_payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Index for fast lookups by order
CREATE INDEX IF NOT EXISTS idx_pos_order_payments_order_id ON pos_order_payments(order_id);

-- ═══════════════════════════════════════════════════════════════
-- Ensure reservation_payments table exists with all needed columns
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS reservation_payments (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_returned NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reservation_payments ADD COLUMN IF NOT EXISTS amount_received NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE reservation_payments ADD COLUMN IF NOT EXISTS amount_returned NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE reservation_payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_reservation_payments_reservation_id ON reservation_payments(reservation_id);

-- ═══════════════════════════════════════════════════════════════
-- Disable RLS on payment detail tables (backoffice-only data)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE pos_order_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_payments DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- Add payment_details JSONB fallback column on pos_orders
-- Stores [{method_name, payment_method_id, amount, amount_received, amount_returned}]
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE pos_orders ADD COLUMN IF NOT EXISTS payment_details JSONB;
