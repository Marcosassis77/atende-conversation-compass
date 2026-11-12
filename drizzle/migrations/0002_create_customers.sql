CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  whatsapp text,
  email text,
  document text,
  organization text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 160),
  CHECK (phone IS NULL OR phone ~ '^[0-9]{10,13}$'),
  CHECK (whatsapp IS NULL OR whatsapp ~ '^[0-9]{10,13}$'),
  CHECK (email IS NULL OR (char_length(email) <= 255 AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  CHECK (document IS NULL OR document ~ '^([0-9]{11}|[0-9]{14})$'),
  CHECK (organization IS NULL OR char_length(organization) <= 160),
  CHECK (notes IS NULL OR char_length(notes) <= 2000)
);
CREATE UNIQUE INDEX customers_company_email_uq ON public.customers (company_id, lower(email)) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX customers_company_document_uq ON public.customers (company_id, document) WHERE document IS NOT NULL;
CREATE UNIQUE INDEX customers_company_whatsapp_uq ON public.customers (company_id, whatsapp) WHERE whatsapp IS NOT NULL;
CREATE INDEX customers_company_idx ON public.customers (company_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read customers" ON public.customers FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "members insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "members update customers" ON public.customers FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));

CREATE OR REPLACE FUNCTION public.customers_before_write() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.full_name := btrim(NEW.full_name);
  NEW.email := nullif(lower(btrim(NEW.email)), '');
  NEW.phone := nullif(regexp_replace(coalesce(NEW.phone,''), '\D', '', 'g'), '');
  NEW.whatsapp := nullif(regexp_replace(coalesce(NEW.whatsapp,''), '\D', '', 'g'), '');
  NEW.document := nullif(regexp_replace(coalesce(NEW.document,''), '\D', '', 'g'), '');
  NEW.organization := nullif(btrim(NEW.organization), '');
  NEW.notes := nullif(btrim(NEW.notes), '');
  IF TG_OP = 'UPDATE' THEN
    NEW.company_id := OLD.company_id;
    NEW.created_at := OLD.created_at;
    NEW.created_by := OLD.created_by;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.customers_before_write() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER customers_before_write BEFORE INSERT OR UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.customers_before_write();

ALTER TABLE public.conversations ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;
CREATE INDEX conversations_customer_idx ON public.conversations (customer_id);