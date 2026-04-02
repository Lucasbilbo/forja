# Forja — Contexto del proyecto

## Qué es esto
OS personal gamificado estilo RPG medieval. La vida real se convierte en un juego:
- 🏟️ Arena (Cuerpo) — entrenamiento, conectada a TriCoach/Strava
- 🧙 Torre del Mago (Mente) — aprendizaje, libros, cursos
- ⚒️ Taller (Ejecución) — proyectos, features, hábitos

Uso personal exclusivo de Lucas.

## Stack
- Frontend: React + Vite (JavaScript, NO TypeScript)
- Auth + DB: Supabase (misma cuenta que TriCoach, tablas forja_*)
- Backend: Netlify Functions (CommonJS — require/exports.handler, NUNCA import/export)
- Tests: Vitest

## Reglas críticas

### Netlify Functions
- CommonJS SIEMPRE: `const x = require('x')` y `exports.handler = async (event) => {}`
- Validar siempre el header `x-forja-secret` contra `process.env.FORJA_SECRET`
- Modelo Claude fijo: `claude-sonnet-4-20250514`
- Solo `console.error` para errores reales, nunca console.log en producción

Template mínimo:
```javascript
const FUNCTION_SECRET = process.env.FORJA_SECRET;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, x-forja-secret', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  const secret = event.headers['x-forja-secret'];
  if (FUNCTION_SECRET && secret !== FUNCTION_SECRET) return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  let parsed;
  try { parsed = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'JSON inválido' }) }; }
  // ...
};
```

### Supabase
- Tablas con prefijo `forja_`: forja_profile, forja_misiones, forja_aprendizaje, forja_proyectos, forja_mensajes
- En funciones backend: usar REST API con https nativo (NO @supabase/supabase-js)
- En frontend: usar el cliente de src/lib/supabase.js

### Frontend
- Estética medieval: CSS variables en src/index.css
- Paleta: marrones (#1a1208 fondo), naranjas (#c8820a primario), NO negro absoluto
- Fuentes: Cinzel (serif, títulos) + Source Sans 3 (sans, datos)
- Sin librerías UI externas

### Tests
- `npm test` al terminar siempre
- Tests en src/test/*.test.js

## Sistema de XP
- 200 XP = 1 nivel
- Edificios: Arena (+stat_cuerpo), Torre (+stat_mente), Taller (+stat_ejecucion)
- Racha activa = +10% XP bonus
- nivel visual: 1-5 medieval, 6-10 pueblo, 11-20 ciudad, 21+ futuro

## Schema Supabase
### forja_profile
id, user_id, nombre, nivel, xp_total, xp_actual, racha, ultima_actividad,
stat_cuerpo, stat_mente, stat_ejecucion, created_at

### forja_misiones
id, user_id, edificio (arena|torre|taller), titulo, descripcion,
xp_recompensa, completada, fecha, tipo (diaria|semanal|especial), created_at

### forja_aprendizaje
id, user_id, titulo, tipo (libro|curso|concepto|video), fuente,
completado, sugerido_por_ia, fecha_sugerencia, fecha_completado, notas, created_at

### forja_proyectos
id, user_id, nombre, descripcion, activo, xp_acumulado, created_at

### forja_mensajes
id, user_id, role, content, created_at

## Variables de entorno
Frontend (VITE_*): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_FORJA_SECRET
Backend: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY, FORJA_SECRET

## Flujo de trabajo
1. `netlify dev` para desarrollo → http://localhost:8889
2. `npm test` → `npm run build` al terminar

## Eficiencia
- Sin preámbulos, ejecutar directamente
- Resumen breve al terminar
- No leer archivos que no sean necesarios
- No explorar el proyecto entero si sabes el archivo exacto
