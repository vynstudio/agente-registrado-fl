-- Nobody becomes admin by signing in any more: the browser no longer calls claim_first_admin(),
-- and signed-up users can't call it directly. Admins come from grant_google_admin (005) or are
-- granted on the Users page. The function is kept (no data changes); only the right to run it is removed.
revoke execute on function public.claim_first_admin() from public, anon, authenticated;
