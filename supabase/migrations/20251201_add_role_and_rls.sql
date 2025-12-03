-- Add role column to users table
ALTER TABLE IF EXISTS users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment
COMMENT ON COLUMN users.role IS 'User role: admin, operator, or customer';

-- Update existing users (set first user as admin if no admin exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') THEN
    UPDATE users 
    SET role = 'admin' 
    WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);
  END IF;
END $$;

-- ========================================
-- Enable Row Level Security
-- ========================================

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifests ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Shipments Policies
-- ========================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "admins_all_shipments" ON shipments;
DROP POLICY IF EXISTS "operators_warehouse_shipments" ON shipments;
DROP POLICY IF EXISTS "customers_own_shipments" ON shipments;

-- Admins can do everything
CREATE POLICY "admins_all_shipments" ON shipments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Operators can view and update shipments
CREATE POLICY "operators_view_shipments" ON shipments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

CREATE POLICY "operators_update_shipments" ON shipments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

-- Customers can only view their own shipments
CREATE POLICY "customers_own_shipments" ON shipments
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- Invoices Policies
-- ========================================

DROP POLICY IF EXISTS "admins_all_invoices" ON invoices;
DROP POLICY IF EXISTS "operators_view_invoices" ON invoices;
DROP POLICY IF EXISTS "customers_own_invoices" ON invoices;

CREATE POLICY "admins_all_invoices" ON invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "operators_view_invoices" ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

CREATE POLICY "customers_own_invoices" ON invoices
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers 
      WHERE user_id = auth.uid()
    )
  );

-- ========================================
-- Customers Policies
-- ========================================

DROP POLICY IF EXISTS "admins_all_customers" ON customers;
DROP POLICY IF EXISTS "operators_view_customers" ON customers;
DROP POLICY IF EXISTS "customers_own_profile" ON customers;

CREATE POLICY "admins_all_customers" ON customers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "operators_view_customers" ON customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

CREATE POLICY "customers_own_profile" ON customers
  FOR ALL
  USING (user_id = auth.uid());

-- ========================================
-- Barcodes Policies
-- ========================================

DROP POLICY IF EXISTS "admins_all_barcodes" ON barcodes;
DROP POLICY IF EXISTS "operators_manage_barcodes" ON barcodes;
DROP POLICY IF EXISTS "customers_view_own_barcodes" ON barcodes;

CREATE POLICY "admins_all_barcodes" ON barcodes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "operators_manage_barcodes" ON barcodes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

CREATE POLICY "customers_view_own_barcodes" ON barcodes
  FOR SELECT
  USING (
    shipment_id IN (
      SELECT id FROM shipments 
      WHERE customer_id IN (
        SELECT id FROM customers 
        WHERE user_id = auth.uid()
      )
    )
  );

-- ========================================
-- Package Scans Policies
-- ========================================

DROP POLICY IF EXISTS "admins_all_scans" ON package_scans;
DROP POLICY IF EXISTS "operators_manage_scans" ON package_scans;

CREATE POLICY "admins_all_scans" ON package_scans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "operators_manage_scans" ON package_scans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

-- ========================================
-- Manifests Policies
-- ========================================

DROP POLICY IF EXISTS "admins_all_manifests" ON manifests;
DROP POLICY IF EXISTS "operators_manage_manifests" ON manifests;

CREATE POLICY "admins_all_manifests" ON manifests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "operators_manage_manifests" ON manifests
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('operator', 'admin')
    )
  );

-- ========================================
-- Helper Functions
-- ========================================

-- Function to check user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = user_id LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is operator or admin
CREATE OR REPLACE FUNCTION is_operator_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role IN ('operator', 'admin')
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- ========================================
-- Indexes for Performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_shipments_customer_id ON shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_at ON shipments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_barcodes_shipment_id ON barcodes(shipment_id);
CREATE INDEX IF NOT EXISTS idx_package_scans_barcode_id ON package_scans(barcode_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
