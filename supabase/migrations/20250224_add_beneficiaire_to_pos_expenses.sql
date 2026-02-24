-- Add beneficiaire and expense_type_id columns to pos_expenses
ALTER TABLE pos_expenses ADD COLUMN IF NOT EXISTS beneficiaire text;
ALTER TABLE pos_expenses ADD COLUMN IF NOT EXISTS expense_type_id integer REFERENCES expense_types(id);
