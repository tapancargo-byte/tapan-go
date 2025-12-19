-- Allow operators/admins to insert/update/delete invoices (RLS)

DO $$
BEGIN
  IF to_regclass('public.invoices') IS NOT NULL THEN
    DROP POLICY IF EXISTS "operators_manage_invoices" ON public.invoices;

    CREATE POLICY "operators_manage_invoices" ON public.invoices
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
            AND users.role IN ('operator', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
            AND users.role IN ('operator', 'admin')
        )
      );
  END IF;

  IF to_regclass('public.invoice_items') IS NOT NULL THEN
    ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "operators_manage_invoice_items" ON public.invoice_items;

    CREATE POLICY "operators_manage_invoice_items" ON public.invoice_items
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
            AND users.role IN ('operator', 'admin')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid()
            AND users.role IN ('operator', 'admin')
        )
      );
  END IF;
END $$;
