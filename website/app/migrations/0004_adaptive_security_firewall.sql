-- Stores keyed IP digests only; never store visitor IP addresses or full request URLs.
CREATE TABLE IF NOT EXISTS security_ip_blocks (
  ip_hash TEXT PRIMARY KEY,
  reason_code TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS security_ip_blocks_expires_at_idx ON security_ip_blocks(expires_at);

CREATE TABLE IF NOT EXISTS security_signals (
  ip_hash TEXT PRIMARY KEY,
  window_bucket INTEGER NOT NULL,
  signal_count INTEGER NOT NULL,
  last_signal TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS security_signals_updated_at_idx ON security_signals(updated_at);

-- Minimal aggregate CSP telemetry; excludes IP addresses, full URLs and report bodies.
CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  detail_code TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS security_events_created_at_idx ON security_events(created_at);
