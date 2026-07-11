create table if not exists ntec.registration_requests (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text not null,
  telefono text not null,
  email text not null,
  comentarios text,
  estado text not null default 'recibido',
  created_at timestamptz not null default now()
);

alter table ntec.registration_requests enable row level security;

grant usage on schema ntec to authenticated, service_role;
grant insert, select on ntec.registration_requests to service_role;

drop policy if exists "service role manages registration requests"
on ntec.registration_requests;

create policy "service role manages registration requests"
on ntec.registration_requests
for all
to service_role
using (true)
with check (true);
