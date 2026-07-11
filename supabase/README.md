# Supabase corporate mail flow

## Objetivo

Recibir solicitudes del formulario "Estatus de un certificado", guardarlas en
Supabase y enviar una notificacion al buzon compartido
`estatusdelcertificado@normalitec.com.mx` usando Microsoft 365 / Graph.

## Archivos

- `supabase/sql/certificate_status_requests.sql`
- `supabase/sql/feedback_requests.sql`
- `supabase/functions/certificate-status-request/index.ts`
- `supabase/functions/feedback-request/index.ts`

## Secrets requeridos en Supabase

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MS_TENANT_ID`
- `MS_CLIENT_ID`
- `MS_CLIENT_SECRET`
- `MS_SENDER_USER_ID`
- `STATUS_MAILBOX_ADDRESS`
- `FEEDBACK_MAILBOX_ADDRESS`
- `REGISTRATION_MAILBOX_ADDRESS`

## Recomendacion de valores

- `STATUS_MAILBOX_ADDRESS=estatusdelcertificado@normalitec.com.mx`
- `FEEDBACK_MAILBOX_ADDRESS=quejasycomentarios@normalitec.com.mx`
- `MS_SENDER_USER_ID`:
  una cuenta corporativa autorizada para enviar via Graph. No tiene que ser el
  buzon compartido; puede ser una cuenta tecnica o institucional.

## Permisos esperados en Microsoft 365

La app de Entra / Azure debe poder enviar correo por Microsoft Graph.
Recomendacion inicial:

- `Mail.Send` con consentimiento de administrador

Despues, el admin puede restringir el acceso de la app al buzon permitido con
una Application Access Policy en Exchange Online si lo considera necesario.

## Flujo

1. Angular envia el formulario a la Edge Function
2. La Edge Function valida el payload
3. Guarda el registro en `ntec.certificate_status_requests`
4. Manda correo al buzon compartido
5. El equipo atiende la solicitud desde Microsoft 365

El mismo patron aplica para reclamaciones, sugerencias o felicitaciones usando
`ntec.feedback_requests` y el buzon
`quejasycomentarios@normalitec.com.mx`.

## Solicitudes de registro de clientes

Archivos:
- `supabase/sql/registration_requests.sql`
- `supabase/functions/registration-request/index.ts`

Secret adicional requerido:
- `REGISTRATION_MAILBOX_ADDRESS`

Flujo:
1. El cliente llena el formulario de registro en `/clients/register`
2. Angular envia los datos a la Edge Function `registration-request`
3. La Edge Function valida, guarda en `ntec.registration_requests` y envia correo
4. El equipo administrador recibe la solicitud y crea manualmente el usuario en
   Supabase Auth usando el correo proporcionado
