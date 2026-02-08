
-- VPS Nodes table
CREATE TABLE public.vps_nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  persona TEXT NOT NULL,
  model TEXT NOT NULL,
  ip TEXT NOT NULL DEFAULT '',
  port TEXT NOT NULL DEFAULT '11434',
  status TEXT NOT NULL DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vps_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "VPS nodes are publicly readable"
ON public.vps_nodes FOR SELECT
USING (true);

-- Branding config table
CREATE TABLE public.branding_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Sovereign AI',
  logo_url TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT 'AI-Powered Trading Intelligence',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.branding_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Branding config is publicly readable"
ON public.branding_config FOR SELECT
USING (true);

-- Insert default VPS nodes
INSERT INTO public.vps_nodes (id, label, persona, model, ip, port, status) VALUES
('vps1', 'VPS 1 — Analyst', 'analyst', 'deepseek-r1', '', '11434', 'offline'),
('vps2', 'VPS 2 — Risk Manager', 'risk', 'llama3', '', '11434', 'offline'),
('vps3', 'VPS 3 — Strategist', 'strategist', 'mistral', '', '11434', 'offline');

-- Insert default branding
INSERT INTO public.branding_config (site_name, logo_url, tagline) VALUES
('Sovereign AI', '', 'AI-Powered Trading Intelligence');

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vps_nodes_updated_at
BEFORE UPDATE ON public.vps_nodes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_branding_config_updated_at
BEFORE UPDATE ON public.branding_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
