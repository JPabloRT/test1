-- ============================================================
-- NORMALITEC SC - Configuracion completa de base de datos
-- ============================================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Crear esquema ntec si no existe
create schema if not exists ntec;

-- ============================================================
-- 2. TABLAS PARA SOLICITUDES (Formularios publicos)
-- ============================================================

-- 2a. Solicitudes de registro de clientes
create table if not exists ntec.registration_requests (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text not null,
  telefono text not null,
  email text not null,
  comentarios text default '',
  estado text not null default 'recibido',
  created_at timestamptz not null default now()
);

alter table ntec.registration_requests enable row level security;

-- 2b. Quejas, sugerencias o felicitaciones
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

-- 2c. Solicitudes de estatus de certificado
create table if not exists ntec.certificate_status_requests (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text not null,
  telefono text not null,
  email text not null,
  titular_certificado text not null,
  numero_certificado text not null,
  fecha_emision_certificado text not null,
  norma_certificada text not null,
  comentarios text default '',
  estado text not null default 'recibido',
  created_at timestamptz not null default now()
);

alter table ntec.certificate_status_requests enable row level security;

-- ============================================================
-- 3. TABLAS PARA EL PORTAL DE CLIENTES
-- ============================================================

-- 3a. Clientes
create table if not exists ntec.cliente (
  id_cliente text primary key,
  nombre text not null,
  correo text,
  telefono text,
  direccion_sol text
);

-- 3b. Perfiles de usuario (vinculados a auth.users)
create table if not exists ntec.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  id_cliente text references ntec.cliente(id_cliente),
  created_at timestamptz not null default now()
);

alter table ntec.profiles enable row level security;

-- 3c. Solicitudes de servicios
create table if not exists ntec.solicitud (
  id_sol text primary key,
  id_cliente text not null references ntec.cliente(id_cliente),
  servicio text not null,
  estatus text not null default 'activo',
  etapa_actual text,
  fecha_ingreso timestamptz not null default now()
);

-- 3d. Documentos
create table if not exists ntec.documento (
  id_doc text primary key,
  id_sol text not null references ntec.solicitud(id_sol),
  tipo text not null
);

-- 3e. Fechas de documentos
create table if not exists ntec.fechas (
  id_fecha uuid primary key default gen_random_uuid(),
  id_doc text not null references ntec.documento(id_doc),
  vigencia date
);

-- ============================================================
-- 4. PERMISOS Y POLITICAS RLS
-- ============================================================

-- 4a. Dar acceso al esquema ntec
grant usage on schema ntec to authenticated, service_role, anon;
grant all privileges on all tables in schema ntec to service_role;
grant all privileges on all sequences in schema ntec to service_role;

-- 4b. Permisos para service_role (Edge Functions) en tablas de solicitudes
grant insert, select on ntec.registration_requests to service_role;
grant insert, select on ntec.feedback_requests to service_role;
grant insert, select on ntec.certificate_status_requests to service_role;

-- 4c. Politicas para registration_requests
drop policy if exists "service role manages registration requests" on ntec.registration_requests;
create policy "service role manages registration requests"
  on ntec.registration_requests for all to service_role
  using (true) with check (true);

-- 4d. Politicas para feedback_requests
drop policy if exists "service role manages feedback requests" on ntec.feedback_requests;
create policy "service role manages feedback requests"
  on ntec.feedback_requests for all to service_role
  using (true) with check (true);

-- 4e. Politicas para certificate_status_requests
drop policy if exists "service role manages certificate status requests" on ntec.certificate_status_requests;
create policy "service role manages certificate status requests"
  on ntec.certificate_status_requests for all to service_role
  using (true) with check (true);

-- 4f. Politicas para profiles (usuarios autenticados ven su propio perfil)
drop policy if exists "users can view own profile" on ntec.profiles;
create policy "users can view own profile"
  on ntec.profiles for select
  to authenticated
  using (auth.uid() = id);

-- ============================================================
-- 5. TRIGGER: Crear perfil automaticamente al registrarse
-- ============================================================
create or replace function ntec.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into ntec.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function ntec.handle_new_user();

-- ============================================================
-- 6. INDICES PARA RENDIMIENTO
-- ============================================================
create index if not exists idx_registration_requests_email on ntec.registration_requests(email);
create index if not exists idx_registration_requests_estado on ntec.registration_requests(estado);
create index if not exists idx_feedback_requests_email on ntec.feedback_requests(email);
create index if not exists idx_feedback_requests_estado on ntec.feedback_requests(estado);
create index if not exists idx_certificate_status_requests_email on ntec.certificate_status_requests(email);
create index if not exists idx_profiles_id_cliente on ntec.profiles(id_cliente);
create index if not exists idx_solicitud_id_cliente on ntec.solicitud(id_cliente);
create index if not exists idx_documento_id_sol on ntec.documento(id_sol);

-- ============================================================
-- HECHO. La base de datos esta lista.
-- ============================================================
