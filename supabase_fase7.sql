
-- ══════════════════════════════════════════
-- SQL PENDENTE — rodar no Supabase
-- ══════════════════════════════════════════

-- 1. Tabela de pagamentos (caso não exista)
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  valor integer,
  status text DEFAULT 'pending',
  descricao text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "users_own_pagamentos" ON public.pagamentos 
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_plano ON public.usuarios(plano);
CREATE INDEX IF NOT EXISTS idx_usuarios_updated ON public.usuarios(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON public.notificacoes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adesao_user_data ON public.adesao_diaria(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_tracker_user ON public.tracker_entries(user_id, data DESC);

-- 3. Função para deletar conta (caso não exista)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS json AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = auth.uid();
  DELETE FROM public.notificacoes WHERE user_id = auth.uid();
  DELETE FROM public.adesao_diaria WHERE user_id = auth.uid();
  DELETE FROM public.tracker_entries WHERE user_id = auth.uid();
  DELETE FROM public.pagamentos WHERE user_id = auth.uid();
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
