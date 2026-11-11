CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TYPE public.company_role AS ENUM ('owner', 'admin', 'agent');

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role public.company_role NOT NULL DEFAULT 'agent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;

CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company_id AND user_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.has_company_role(_company_id uuid, _roles public.company_role[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company_id AND user_id = auth.uid() AND role = ANY(_roles))
$$;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read company" ON public.companies FOR SELECT TO authenticated USING (public.is_company_member(id));
CREATE POLICY "admins update company" ON public.companies FOR UPDATE TO authenticated USING (public.has_company_role(id, ARRAY['owner','admin']::public.company_role[]));

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read members" ON public.company_members FOR SELECT TO authenticated USING (public.is_company_member(company_id));

CREATE OR REPLACE FUNCTION public.create_company(_name text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.companies (name, created_by) VALUES (trim(_name), auth.uid()) RETURNING id INTO _id;
  INSERT INTO public.company_members (company_id, user_id, role) VALUES (_id, auth.uid(), 'owner');
  RETURN _id;
END $$;
REVOKE EXECUTE ON FUNCTION public.create_company(text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_company(text) TO authenticated;

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 120),
  customer_contact text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read conversations" ON public.conversations FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "members insert conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "members update conversations" ON public.conversations FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('inbound','outbound')),
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  ai_suggestion text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read messages" ON public.messages FOR SELECT TO authenticated USING (public.is_company_member(company_id));
CREATE POLICY "members insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.is_company_member(company_id));
CREATE POLICY "members update messages" ON public.messages FOR UPDATE TO authenticated USING (public.is_company_member(company_id)) WITH CHECK (public.is_company_member(company_id));

-- Force message.company_id to match its conversation and bump conversation activity.
CREATE OR REPLACE FUNCTION public.messages_sync_company() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  SELECT company_id INTO NEW.company_id FROM public.conversations WHERE id = NEW.conversation_id;
  IF NEW.company_id IS NULL THEN RAISE EXCEPTION 'conversation not found'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER messages_sync_company BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.messages_sync_company();

CREATE OR REPLACE FUNCTION public.messages_touch_conversation() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;
CREATE TRIGGER messages_touch_conversation AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.messages_touch_conversation();