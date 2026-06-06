-- Run once on a new Neon database before migrations.
-- Neon supports both extensions on all plans (enable via SQL or dashboard).

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
