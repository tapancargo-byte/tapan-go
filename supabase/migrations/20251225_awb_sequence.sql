-- Migration: Secure AWB (Invoice Reference) Sequence
-- Description: Creates a sequence and trigger to automatically generate invoiceRef (e.g., TAPAN00001) if not provided.

-- 1. Create the sequence
CREATE SEQUENCE IF NOT EXISTS public.invoice_ref_seq START WITH 1;

-- 2. Create the function to generate the formatted reference
CREATE OR REPLACE FUNCTION public.generate_invoice_ref() 
RETURNS TEXT AS $$
DECLARE
    seq_val BIGINT;
BEGIN
    seq_val := nextval('public.invoice_ref_seq');
    RETURN 'TAPAN' || LPAD(seq_val::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- 3. Create a trigger function to set the invoiceRef on insert
CREATE OR REPLACE FUNCTION public.set_invoice_ref()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."invoiceRef" IS NULL OR NEW."invoiceRef" = '' THEN
        NEW."invoiceRef" := public.generate_invoice_ref();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Attach the trigger to the invoices table
-- Note: Replace 'invoices' with the actual table name if different (e.g., 'Invoices' or 'shipments')
DROP TRIGGER IF EXISTS set_invoice_ref_trigger ON public.invoices;
CREATE TRIGGER set_invoice_ref_trigger
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.set_invoice_ref();

-- 5. Optional: Initialize sequence to start after current highest reference if any
-- SELECT setval('public.invoice_ref_seq', (SELECT COALESCE(MAX(SUBSTRING("invoiceRef" FROM 6)::INTEGER), 0) FROM public.invoices));
