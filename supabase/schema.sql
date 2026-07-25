-- Histórico propio de lecturas diarias. Lo alimenta la función
-- programada de Netlify; lo lee el frontend para las comparativas.
create table if not exists lectures_embassaments (
  id bigint generated always as identity primary key,
  estaci text not null,
  dia date not null,
  nivell_absolut numeric,
  volum numeric,
  percentatge numeric,
  creat_el timestamptz not null default now(),
  unique (estaci, dia)
);

create index if not exists lectures_embassaments_dia_idx
  on lectures_embassaments (dia desc);

alter table lectures_embassaments enable row level security;

-- Lectura pública (la usa la clave "anon" desde el frontend).
create policy "Lectura pública" on lectures_embassaments
  for select
  using (true);

-- Nada de insert/update/delete con la clave anon: solo la
-- "service role" (usada por la función programada) puede escribir,
-- y esa clave ya salta el RLS por defecto en Supabase.
