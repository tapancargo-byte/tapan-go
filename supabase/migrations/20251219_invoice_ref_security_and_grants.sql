-- Harden invoice_ref auto-generation for RLS roles (sequence grants + SECURITY DEFINER)

GRANT USAGE, SELECT ON SEQUENCE public.invoice_ref_seq TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.generate_invoice_ref()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'TA' || lpad(nextval('public.invoice_ref_seq')::text, 5, '0');
$$;

CREATE OR REPLACE FUNCTION public.next_invoice_ref()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.generate_invoice_ref();
$$;

CREATE OR REPLACE FUNCTION public.invoice_ref_autofill()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_ref IS NULL OR btrim(NEW.invoice_ref) = '' THEN
    NEW.invoice_ref := public.generate_invoice_ref();
  END IF;
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_invoice_ref() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_ref() TO anon, authenticated;
