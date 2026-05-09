# Normalitec Portal

Aplicación Angular para el sitio público y el portal de clientes de Normalitec.

## Estructura del proyecto

```
├── src/                 # Aplicación Angular principal
│   ├── app/             # Componentes, servicios y rutas
│   ├── environments/    # Configuración por entorno
│   └── styles/          # Estilos globales
├── content/             # Assets estáticos (imágenes, videos)
├── pages/               # Páginas HTML estáticas (sitio legacy)
├── css/                 # Estilos del sitio legacy
├── supabase/            # Configuración de Supabase (SQL, Edge Functions)
├── docs/                # Documentación y referencias visuales
├── index.html           # Página principal (sitio legacy)
├── angular.json         # Configuración de Angular
├── package.json         # Dependencias del proyecto
└── tsconfig.json        # Configuración de TypeScript
```

## Requisitos

- Node.js >= 18
- npm >= 9
- Angular CLI >= 18

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

## Build de producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/`.

## Supabase

El portal de clientes usa Supabase Auth y tablas del esquema `ntec`.
Los formularios corporativos se conectan a Supabase Edge Functions.

Para configurar las variables de entorno, copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

## Notas

- El sitio legacy (`index.html`, `pages/`, `css/`) está siendo migrado gradualmente a Angular
- Los archivos en `docs/` son referencias de diseño y no forman parte de la aplicación
