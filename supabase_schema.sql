-- ========================================================
-- SCRIPT DE CRIAÇÃO DAS TABELAS PARA O SGS (SUPABASE)
-- Execute este script no SQL Editor do seu Dashboard Supabase:
-- https://supabase.com/dashboard/project/ltpdxpiqjqtixtzllble/sql/new
-- ========================================================

-- 1. TABELA DE SALÕES (salons)
CREATE TABLE IF NOT EXISTS public.salons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  slug TEXT UNIQUE NOT NULL,
  city TEXT DEFAULT 'Luanda',
  province TEXT DEFAULT 'Luanda',
  municipality TEXT DEFAULT 'Talatona',
  address TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved'
  owner_id TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 1,
  cover_image TEXT,
  avatar_image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  media_gallery JSONB DEFAULT '[]'::jsonb,
  stylists JSONB DEFAULT '[]'::jsonb,
  template_id TEXT DEFAULT 'luxe-pink',
  theme_color TEXT DEFAULT '#e11d48',
  text_color TEXT DEFAULT '#ffffff',
  font_family TEXT DEFAULT 'serif',
  footer_text TEXT,
  instagram TEXT,
  facebook TEXT,
  plan_id TEXT,
  plan_name TEXT,
  plan_status TEXT DEFAULT 'sem_plano', -- 'sem_plano' | 'aguardando_comprovativo' | 'em_analise' | 'ativo' | 'expirado'
  plan_expires_at TIMESTAMPTZ,
  payment_proof JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE SERVIÇOS (services)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price NUMERIC NOT NULL,
  image TEXT,
  video_url TEXT,
  media_type TEXT DEFAULT 'image', -- 'image' | 'video'
  active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'Geral',
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PRODUTOS (products)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  category TEXT DEFAULT 'Cabelo',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE AGENDAMENTOS (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_avatar TEXT,
  status TEXT DEFAULT 'Pendente', -- 'Confirmado' | 'Pendente' | 'Concluído'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE PLANOS DE SUBSCRIÇÃO (subscription_plans)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_cycle TEXT NOT NULL, -- 'mensal' | 'semestral' | 'anual'
  description TEXT,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONFIGURAÇÃO DE POLÍTICAS DE ACESSO PÚBLICO (Row Level Security / RLS)
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Permitir leitura e escrita pública para demonstrador / protótipo SaaS
DROP POLICY IF EXISTS "Permitir Leitura Publica Salons" ON public.salons;
DROP POLICY IF EXISTS "Permitir Escrita Publica Salons" ON public.salons;
CREATE POLICY "Permitir Leitura Publica Salons" ON public.salons FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Publica Salons" ON public.salons FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir Leitura Publica Services" ON public.services;
DROP POLICY IF EXISTS "Permitir Escrita Publica Services" ON public.services;
CREATE POLICY "Permitir Leitura Publica Services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Publica Services" ON public.services FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir Leitura Publica Products" ON public.products;
DROP POLICY IF EXISTS "Permitir Escrita Publica Products" ON public.products;
CREATE POLICY "Permitir Leitura Publica Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Publica Products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir Leitura Publica Bookings" ON public.bookings;
DROP POLICY IF EXISTS "Permitir Escrita Publica Bookings" ON public.bookings;
CREATE POLICY "Permitir Leitura Publica Bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Publica Bookings" ON public.bookings FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir Leitura Publica Plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Permitir Escrita Publica Plans" ON public.subscription_plans;
CREATE POLICY "Permitir Leitura Publica Plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Permitir Escrita Publica Plans" ON public.subscription_plans FOR ALL USING (true);
