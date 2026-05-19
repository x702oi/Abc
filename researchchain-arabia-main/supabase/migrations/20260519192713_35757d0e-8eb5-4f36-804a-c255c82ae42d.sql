
-- =============== ENUMS ===============
CREATE TYPE public.app_role AS ENUM ('researcher', 'participant', 'admin');
CREATE TYPE public.study_status AS ENUM ('draft', 'open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE public.payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- =============== PROFILES ===============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  nationality TEXT,
  age INT,
  gender TEXT,
  wallet_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  trust_score INT NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============== USER ROLES (separate table) ===============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer role checker (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- =============== RESEARCH STUDIES ===============
CREATE TABLE public.research_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  reward_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  target_demographics JSONB NOT NULL DEFAULT '{}'::jsonb,
  status study_status NOT NULL DEFAULT 'open',
  total_participants INT NOT NULL DEFAULT 0,
  max_participants INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_studies ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_studies_researcher ON public.research_studies(researcher_id);
CREATE INDEX idx_studies_status ON public.research_studies(status);

-- =============== APPLICATIONS ===============
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES public.research_studies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_status application_status NOT NULL DEFAULT 'pending',
  submission_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE (study_id, participant_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_app_study ON public.applications(study_id);
CREATE INDEX idx_app_participant ON public.applications(participant_id);

-- =============== PAYMENTS ===============
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES public.research_studies(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'completed',
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pay_participant ON public.payments(participant_id);
CREATE INDEX idx_pay_study ON public.payments(study_id);

-- =============== CONSENT LEDGER ===============
CREATE TABLE public.consent_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  study_id UUID NOT NULL REFERENCES public.research_studies(id) ON DELETE CASCADE,
  blockchain_hash TEXT NOT NULL,
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_ledger ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_consent_participant ON public.consent_ledger(participant_id);

-- =============== NOTIFICATIONS ===============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notif_user ON public.notifications(user_id);

-- =============== TIMESTAMP TRIGGER ===============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_studies_updated BEFORE UPDATE ON public.research_studies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============== AUTO PROFILE ON SIGNUP ===============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email, nationality, age, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'nationality',
    NULLIF(NEW.raw_user_meta_data->>'age','')::int,
    NEW.raw_user_meta_data->>'gender'
  );
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'participant');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, user_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============== RLS POLICIES ===============

-- profiles
CREATE POLICY "profiles_read_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_read_public_name" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles
CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- research_studies
CREATE POLICY "studies_read_all" ON public.research_studies FOR SELECT USING (true);
CREATE POLICY "studies_insert_researcher" ON public.research_studies FOR INSERT
  WITH CHECK (auth.uid() = researcher_id AND public.has_role(auth.uid(), 'researcher'));
CREATE POLICY "studies_update_own" ON public.research_studies FOR UPDATE USING (auth.uid() = researcher_id);
CREATE POLICY "studies_delete_own" ON public.research_studies FOR DELETE USING (auth.uid() = researcher_id);

-- applications
CREATE POLICY "apps_read_participant" ON public.applications FOR SELECT USING (auth.uid() = participant_id);
CREATE POLICY "apps_read_researcher" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.research_studies s WHERE s.id = study_id AND s.researcher_id = auth.uid())
);
CREATE POLICY "apps_insert_participant" ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = participant_id AND public.has_role(auth.uid(), 'participant'));
CREATE POLICY "apps_update_researcher" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.research_studies s WHERE s.id = study_id AND s.researcher_id = auth.uid())
);

-- payments
CREATE POLICY "pay_read_participant" ON public.payments FOR SELECT USING (auth.uid() = participant_id);
CREATE POLICY "pay_read_researcher" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.research_studies s WHERE s.id = study_id AND s.researcher_id = auth.uid())
);
CREATE POLICY "pay_insert_researcher" ON public.payments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.research_studies s WHERE s.id = study_id AND s.researcher_id = auth.uid())
);

-- consent_ledger
CREATE POLICY "consent_read_own" ON public.consent_ledger FOR SELECT USING (auth.uid() = participant_id);
CREATE POLICY "consent_read_researcher" ON public.consent_ledger FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.research_studies s WHERE s.id = study_id AND s.researcher_id = auth.uid())
);
CREATE POLICY "consent_insert_self" ON public.consent_ledger FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- notifications
CREATE POLICY "notif_read_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_self" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime on notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
