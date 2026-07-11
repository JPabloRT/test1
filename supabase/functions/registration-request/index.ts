interface RegistrationRequestPayload {
  name: string;
  company: string;
  phone: string;
  email: string;
  comments?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function requireField(value: string | undefined, label: string): string {
  if (!value?.trim()) {
    throw new Error(`El campo ${label} es obligatorio.`);
  }

  return value.trim();
}

async function getGraphAccessToken() {
  const tenantId = Deno.env.get('MS_TENANT_ID');
  const clientId = Deno.env.get('MS_CLIENT_ID');
  const clientSecret = Deno.env.get('MS_CLIENT_SECRET');

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error('Faltan secretos de Microsoft Graph en Supabase.');
  }

  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    },
  );

  if (!tokenResponse.ok) {
    const detail = await tokenResponse.text();
    throw new Error(`No fue posible obtener token de Microsoft Graph: ${detail}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token as string;
}

async function sendNotificationEmail(payload: RegistrationRequestPayload, requestId: string) {
  const graphAccessToken = await getGraphAccessToken();
  const senderUserId = Deno.env.get('MS_SENDER_USER_ID');
  const recipient = Deno.env.get('REGISTRATION_MAILBOX_ADDRESS');

  if (!senderUserId || !recipient) {
    throw new Error('Faltan secretos REGISTRATION_MAILBOX_ADDRESS o MS_SENDER_USER_ID.');
  }

  const html = `
    <h2>Nueva solicitud de registro de cliente</h2>
    <p><strong>Folio interno:</strong> ${requestId}</p>
    <p><strong>Nombre:</strong> ${payload.name}</p>
    <p><strong>Empresa:</strong> ${payload.company}</p>
    <p><strong>Telefono:</strong> ${payload.phone}</p>
    <p><strong>Email:</strong> ${payload.email}</p>
    <p><strong>Comentarios:</strong> ${payload.comments || 'Sin comentarios'}</p>
    <hr>
    <p><em>Para crear el acceso, ingresa al panel de Supabase Auth y registra al usuario con el correo: <strong>${payload.email}</strong></em></p>
  `;

  const graphResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderUserId}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${graphAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: `Nueva solicitud de registro - ${payload.company}`,
          body: {
            contentType: 'HTML',
            content: html,
          },
          toRecipients: [
            {
              emailAddress: {
                address: recipient,
              },
            },
          ],
          replyTo: [
            {
              emailAddress: {
                address: payload.email,
              },
            },
          ],
        },
        saveToSentItems: true,
      }),
    },
  );

  if (!graphResponse.ok) {
    const detail = await graphResponse.text();
    throw new Error(`No fue posible enviar el correo con Microsoft Graph: ${detail}`);
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Faltan secretos de Supabase para procesar la solicitud.');
    }

    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const rawPayload = (await request.json()) as RegistrationRequestPayload;
    const payload: RegistrationRequestPayload = {
      name: requireField(rawPayload.name, 'Nombre'),
      company: requireField(rawPayload.company, 'Empresa'),
      phone: requireField(rawPayload.phone, 'Telefono'),
      email: requireField(rawPayload.email, 'Email'),
      comments: rawPayload.comments?.trim() || '',
    };

    const { data: insertedRequest, error: insertError } = await supabaseAdmin
      .schema('ntec')
      .from('registration_requests')
      .insert({
        nombre: payload.name,
        empresa: payload.company,
        telefono: payload.phone,
        email: payload.email,
        comentarios: payload.comments,
        estado: 'recibido',
      })
      .select('id')
      .single();

    if (insertError || !insertedRequest) {
      throw new Error('No fue posible guardar la solicitud de registro en Supabase.');
    }

    await sendNotificationEmail(payload, insertedRequest.id);

    return new Response(
      JSON.stringify({
        ok: true,
        id: insertedRequest.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: error instanceof Error ? error.message : 'Error desconocido.',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});
