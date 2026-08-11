# Embassaments de Catalunya — Astro + Netlify + Supabase

Estat i evolució dels embassaments de les conques internes de Catalunya.
Migrat des del projecte Node/Express original.

## Qué cambia respecto al proyecto anterior

- **Sin Express, sin Puppeteer.** Los datos vienen directos del dataset
  abierto de la ACA (Socrata, con CORS), leídos server-side en cada
  visita — no hace falta un servidor propio corriendo.
- **`index.html` ya no carga el script equivocado**: la lógica está
  unificada en `src/lib/embassaments.js`, usada tanto por la página
  como por la función de sync.
- **Histórico propio en Supabase**: una función programada de Netlify
  guarda cada día las lecturas, así las comparativas ("hace 7/30/365
  días") no dependen de que el dataset de la ACA tenga bien todo el
  histórico en cada carga.

## Puesta en marcha

### 1. Instalar dependencias
```bash
npm install
```

### 2. Crear el proyecto en Supabase
1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. En el editor SQL, ejecuta el contenido de `supabase/schema.sql`.
3. Copia `SUPABASE_URL` y la clave `anon` (Settings → API) a un archivo `.env` local (copia `.env.example`).
4. Copia también la clave `service_role` — esa NO va en `.env` si vas a subir el repo, solo en las variables de entorno de Netlify (paso 4).

### 3. Probar en local
```bash
npm run dev
```
La página cargará los datos en vivo de la ACA. Las comparativas aparecerán vacías hasta que haya al menos un día de histórico — ejecuta el sync manual:
```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run sync
```

### 4. Desplegar en Netlify
1. Sube este repo a GitHub.
2. En Netlify: **Import from Git** → selecciona el repo. Netlify detecta Astro solo (build command y publish dir ya están en `netlify.toml`).
3. En **Site configuration → Environment variables**, añade:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Despliega. La función `sync-embassaments` empezará a ejecutarse sola cada día a las 06:00 UTC (definido en el propio archivo, `netlify/functions/sync-embassaments.mts`).

## Estructura

```
src/
  lib/embassaments.js      → fetch + transform de datos de la ACA
  lib/comparatives.js      → cálculo de deltas vs Supabase
  lib/supabase.js          → clientes de lectura (anon) y escritura (service role)
  components/               → Resum, EmbassamentCard, NivellBar (visual de nivel)
  pages/index.astro         → página principal (SSR)
  pages/api/embassaments.json.js → endpoint JSON con los datos en vivo
netlify/functions/
  sync-embassaments.mts     → cron diario que alimenta el histórico
supabase/schema.sql          → tabla + políticas RLS
```

## Pendiente / ideas para más adelante

- Sparkline de evolución por embassament (ya hay histórico en Supabase para alimentarlo).
- Página individual por embassament (`/embassaments/[slug]`).
- Comparar contra la mitjana de 5/10 anys, como hace el propi ACA.
