create or replace function public.insert_registration_request(
  p_nombre text, p_empresa text, p_telefono text, p_email text, p_comentarios text default ''
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into ntec.registration_requests (nombre, empresa, telefono, email, comentarios, estado)
  values (p_nombre, p_empresa, p_telefono, p_email, p_comentarios, 'recibido')
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.insert_feedback_request(
  p_nombre text, p_empresa text, p_telefono text, p_email text, p_motivo text, p_comentarios text
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into ntec.feedback_requests (nombre, empresa, telefono, email, motivo, comentarios, estado)
  values (p_nombre, p_empresa, p_telefono, p_email, p_motivo, p_comentarios, 'recibido')
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.insert_certificate_status_request(
  p_nombre text, p_empresa text, p_telefono text, p_email text,
  p_titular text, p_numero_cert text, p_fecha_emision text, p_norma text, p_comentarios text default ''
) returns uuid
language plpgsql
security definer
as $$
declare
  v_id uuid;
begin
  insert into ntec.certificate_status_requests (nombre, empresa, telefono, email, titular_certificado, numero_certificado, fecha_emision_certificado, norma_certificada, comentarios, estado)
  values (p_nombre, p_empresa, p_telefono, p_email, p_titular, p_numero_cert, p_fecha_emision, p_norma, p_comentarios, 'recibido')
  returning id into v_id;
  return v_id;
end;
$$;
