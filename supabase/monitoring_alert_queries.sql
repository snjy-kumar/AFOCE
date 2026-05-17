-- Connection usage snapshot
SELECT
  datname,
  usename,
  COUNT(*) AS connection_count
FROM pg_stat_activity
WHERE datname NOT IN ('postgres', 'template0', 'template1')
GROUP BY datname, usename
ORDER BY connection_count DESC;

-- Potentially long-running active queries
SELECT
  pid,
  now() - query_start AS runtime,
  state,
  query
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start IS NOT NULL
ORDER BY runtime DESC
LIMIT 20;

-- RLS coverage reminder check
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

