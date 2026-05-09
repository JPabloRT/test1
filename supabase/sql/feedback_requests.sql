create table if not exists ntec.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text not null,
  telefono text not null,
  email text not null,
  motivo text not null,
  comentarios text not null,
  estado text not null default 'recibido',
  created_at timestamptz not null default now()
);

alter table ntec.feedback_requests enable row level security;

grant usage on schema ntec to authenticated, service_role;
grant insert, select on ntec.feedback_requests to service_role;

drop policy if exists "service role manages feedback requests"
on ntec.feedback_requests;

create policy "service role manages feedback requests"
on ntec.feedback_requests
for all
to service_role
using (true)
with check (true);
