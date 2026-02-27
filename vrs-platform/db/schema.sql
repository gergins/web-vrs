CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('deaf', 'interpreter', 'operator')),
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  interpreter_id UUID NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NULL,
  region TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS interpreter_availability (
  id UUID PRIMARY KEY,
  interpreter_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL,
  skillset TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_metrics (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(session_id),
  latency_ms INTEGER NOT NULL,
  packet_loss_pct NUMERIC(5,2) NOT NULL,
  quality_score NUMERIC(5,2) NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  event_id UUID PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  session_id UUID NULL REFERENCES sessions(session_id),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
