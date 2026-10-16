-- Store only keyed hashes of client IP + endpoint scope, never raw IP addresses.
-- Buckets are short-lived and stale rows are periodically removed by the app.
CREATE TABLE IF NOT EXISTS api_rate_limits (
  key_hash TEXT PRIMARY KEY,
  minute_bucket INTEGER NOT NULL,
  minute_count INTEGER NOT NULL,
  hour_bucket INTEGER NOT NULL,
  hour_count INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS api_rate_limits_updated_at_idx
  ON api_rate_limits(updated_at);
