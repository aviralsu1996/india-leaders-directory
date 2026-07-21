-- Migration: Sync queue, audit logs, and contacts table
-- Supports scraping pipeline retry queue and admin reporting

-- Contacts table (referenced by dbService.submitContact but missing from schema)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(512),
  message TEXT NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to submit contacts"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow staff to read contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (true);

-- Sync retry queue for scraping pipeline (not auto-executed)
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID REFERENCES public.leaders(id) ON DELETE CASCADE,
  leader_slug VARCHAR(255) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  priority INTEGER DEFAULT 5 NOT NULL,
  status VARCHAR(50) DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  attempts INTEGER DEFAULT 0 NOT NULL,
  max_attempts INTEGER DEFAULT 3 NOT NULL,
  last_error TEXT,
  payload JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON public.sync_queue (status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON public.sync_queue (priority, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sync_queue_leader_slug ON public.sync_queue (leader_slug);

ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to manage sync queue"
  ON public.sync_queue FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('Editor', 'Admin'));

CREATE TRIGGER update_sync_queue_modtime
  BEFORE UPDATE ON public.sync_queue
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column();

-- Audit logs for pipeline operations
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id UUID REFERENCES public.leaders(id) ON DELETE SET NULL,
  leader_slug VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  provider VARCHAR(100),
  status VARCHAR(50) DEFAULT 'info'
    CHECK (status IN ('info', 'success', 'warning', 'error')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_leader_slug ON public.audit_logs (leader_slug);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow staff to read audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow staff to insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
