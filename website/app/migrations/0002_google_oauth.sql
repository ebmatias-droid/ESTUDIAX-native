-- OAuth attempts are short-lived and one-time; never store authorization codes.
CREATE TABLE IF NOT EXISTS google_oauth_states (
  state_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS google_oauth_states_expires_at_idx
  ON google_oauth_states(expires_at);

-- Tokens are encrypted application-side with GOOGLE_TOKEN_ENCRYPTION_KEY before storage.
-- One Drive connection per anonymous ESTUDIAX browser profile until account auth exists.
CREATE TABLE IF NOT EXISTS google_drive_connections (
  user_id TEXT PRIMARY KEY,
  google_sub TEXT NOT NULL,
  email TEXT,
  encrypted_tokens TEXT NOT NULL,
  granted_scope TEXT NOT NULL,
  token_expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS google_drive_connections_google_sub_idx
  ON google_drive_connections(google_sub);
