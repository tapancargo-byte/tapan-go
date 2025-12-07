-- Add location column to users table for multi-location admin support
-- Locations: 'imphal' (Imphal) and 'newdelhi' (New Delhi)
-- Applied via Supabase MCP on 2025-12-05

-- Add location column to users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_location_check'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Add location column to shipments
ALTER TABLE shipments 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shipments_location_check'
  ) THEN
    ALTER TABLE shipments ADD CONSTRAINT shipments_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Add location column to customers
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_location_check'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Add location column to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_location_check'
  ) THEN
    ALTER TABLE invoices ADD CONSTRAINT invoices_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Add location column to inventory_items
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'inventory_items_location_check'
  ) THEN
    ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Add location column to barcodes
ALTER TABLE barcodes 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'barcodes_location_check'
  ) THEN
    ALTER TABLE barcodes ADD CONSTRAINT barcodes_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Add location column to manifests
ALTER TABLE manifests 
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'imphal';

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'manifests_location_check'
  ) THEN
    ALTER TABLE manifests ADD CONSTRAINT manifests_location_check CHECK (location IN ('imphal', 'newdelhi'));
  END IF;
END $$;

-- Create indexes for location filtering
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_shipments_location ON shipments(location);
CREATE INDEX IF NOT EXISTS idx_customers_location ON customers(location);
CREATE INDEX IF NOT EXISTS idx_invoices_location ON invoices(location);
CREATE INDEX IF NOT EXISTS idx_inventory_items_location ON inventory_items(location);
CREATE INDEX IF NOT EXISTS idx_barcodes_location ON barcodes(location);
CREATE INDEX IF NOT EXISTS idx_manifests_location ON manifests(location);

-- Update existing users to have admin role (since this is admin-only dashboard)
UPDATE users SET role = 'admin' WHERE role IS NULL OR role NOT IN ('admin');

-- Comment explaining the multi-location setup
COMMENT ON COLUMN users.location IS 'Primary location for the admin user (imphal or newdelhi). All admins can access both locations.';
