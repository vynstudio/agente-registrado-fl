-- hello@toromovers.com becomes an admin the first time it signs in with Google (admin login
-- "Continue with Google"). Only Google sign-ins count, so an email/password signup with that
-- address gets nothing. The Google client only accepts @toromovers.com Workspace accounts.
create or replace function public.grant_google_admin() returns trigger
  language plpgsql security definer
  set search_path to 'public'
  as $$
begin
  if lower(new.email) = 'hello@toromovers.com' and new.raw_app_meta_data->>'provider' = 'google' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists grant_google_admin on auth.users;
create trigger grant_google_admin after insert on auth.users
  for each row execute function public.grant_google_admin();
