# Normalitec Portal

Aplicacion Angular para el sitio publico y el portal de clientes de Normalitec.

## Estructura

- `src/`: aplicacion Angular principal
- `content/`: imagenes y video usados por la app
- `supabase/`: SQL y Edge Functions
- `legacy-site/`: version estatica anterior del sitio
- `docs/`: referencias visuales y notas internas

## Desarrollo local

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

El build queda en:

```text
dist/normalitec-angular/browser
```

## Subir a GitHub arrastrando

Si vas a subir el proyecto desde la interfaz web de GitHub arrastrando archivos, sube solo esto:

- `src/`
- `content/`
- `supabase/`
- `docs/`
- `legacy-site/`
- `.gitignore`
- `angular.json`
- `netlify.toml`
- `package.json`
- `package-lock.json`
- `README.md`
- `tsconfig.json`
- `tsconfig.app.json`

No subas estas carpetas:

- `node_modules/`
- `dist/`
- `.angular/`

## Desplegar en Netlify

Configuracion recomendada:

- Build command: `npm run build`
- Publish directory: `dist/normalitec-angular/browser`

El archivo `netlify.toml` ya deja esto configurado y tambien agrega el redirect necesario para Angular SPA.

## Notas

- El portal de clientes usa Supabase Auth y tablas del esquema `ntec`.
- Los formularios corporativos se conectan a Supabase Edge Functions.
