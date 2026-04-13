CREATE TABLE IF NOT EXISTS public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  nome text,
  tipo text NOT NULL,
  dados jsonb,
  enviar_em timestamptz NOT NULL,
  enviado boolean DEFAULT false,
  enviado_em timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tipo)
);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
