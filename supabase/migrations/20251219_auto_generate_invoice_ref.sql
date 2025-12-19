-- Auto-generate invoice_ref (Consignment No.) as TA00001, TA00002, ...

CREATE SEQUENCE IF NOT EXISTS public.invoice_ref_seq
  INCREMENT BY 1
  MINVALUE 1
  START WITH 1;

DO $$
DECLARE
  max_existing bigint;
BEGIN
  SELECT max((substring(invoice_ref from '[0-9]+$'))::bigint)
    INTO max_existing
  FROM public.invoices
  WHERE invoice_ref ~ '^TA[0-9]+$';

  IF max_existing IS NULL THEN
    PERFORM setval('public.invoice_ref_seq', 1, false);
  ELSE
    PERFORM setval('public.invoice_ref_seq', max_existing + 1, false);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.generate_invoice_ref()
RETURNS text
LANGUAGE sql
AS $$
  SELECT 'TA' || lpad(nextval('public.invoice_ref_seq')::text, 5, '0');
$$;

CREATE OR REPLACE FUNCTION public.next_invoice_ref()
RETURNS text
LANGUAGE sql
AS $$
  SELECT public.generate_invoice_ref();
$$;

CREATE OR REPLACE FUNCTION public.invoice_ref_autofill()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invoice_ref IS NULL OR btrim(NEW.invoice_ref) = '' THEN
    NEW.invoice_ref := public.generate_invoice_ref();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invoice_ref_autofill ON public.invoices;
CREATE TRIGGER trg_invoice_ref_autofill
BEFORE INSERT ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.invoice_ref_autofill();

ALTER TABLE IF EXISTS public.invoices
  ALTER COLUMN invoice_ref SET DEFAULT public.generate_invoice_ref();
