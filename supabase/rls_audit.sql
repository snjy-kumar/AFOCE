SELECT
  schemaname,
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity THEN 'RLS enabled'
    ELSE 'RLS missing'
  END AS status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

