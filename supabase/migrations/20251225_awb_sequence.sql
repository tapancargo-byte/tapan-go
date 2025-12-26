-- Create sequence for 12-digit AWB, starting at 100000000001
CREATE SEQUENCE IF NOT EXISTS public.invoice_awb_seq
  INCREMENT BY 1
  MINVALUE 100000000001
  START WITH 100000000001;

-- Function to generate the formatted AWB (raw numeric string)
CREATE OR REPLACE FUNCTION public.generate_invoice_awb()
RETURNS text
LANGUAGE sql
AS $$
  SELECT nextval('public.invoice_awb_seq')::text;
$$;

-- Function for previewing (optional, similar to existing)
CREATE OR REPLACE FUNCTION public.preview_next_invoice_awb()
RETURNS text
LANGUAGE sql
AS $$
  -- Peek at next value without incrementing (approximate)
  -- Note: sequence functions like last_value aren't always multi-user safe for peeking, 
  -- but strictly for preview "what will be next" this is okay-ish or we just return nextval.
  -- Better to just return the next value if we want to reserve it, but for preview we might just fallback to current.
  -- Actually, let's just make it return the NEXT value by adding 1 to last_value if initialized, else start.
  SELECT COALESCE(last_value + 1, 100000000001)::text 
  FROM public.invoice_awb_seq;
$$;


-- Update trigger to use new AWB format
-- We are replacing the old `invoice_ref_autofill` logic to use this new sequence
CREATE OR REPLACE FUNCTION public.invoice_ref_autofill()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Force overwrite or fill if empty, based on requirement "remove manual"
  -- If we want to strictly ENFORCE auto-gen, we always overwrite.
  -- But usually, we only do it if null/empty to allow migration updates if needed.
  -- User asked to "remove manual option", so we should ensure it's generated.
  IF NEW.invoice_ref IS NULL OR btrim(NEW.invoice_ref) = '' THEN
    NEW.invoice_ref := public.generate_invoice_awb();
  END IF;
  RETURN NEW;
END;
$$;

-- Re-create trigger just to be safe it's attached
DROP TRIGGER IF EXISTS trg_invoice_ref_autofill ON public.invoices;
CREATE TRIGGER trg_invoice_ref_autofill
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.invoice_ref_autofill();

-- Note: We do NOT set a DEFAULT on the column itself because we want the trigger 
-- to handle the assignment logic centrally, and prevent "double-generation" or conflicts.
