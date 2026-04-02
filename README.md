# Forja — OS Personal Gamificado

OS personal gamificado para uso exclusivo de Lucas. La vida real se convierte en un RPG medieval.

## Los 3 dominios
- 🏟️ **Arena** (Cuerpo) — Entrenamiento, conectado a TriCoach / Strava
- 🧙 **Torre del Mago** (Mente) — Aprendizaje, libros, cursos, conceptos
- ⚒️ **Taller** (Ejecución) — Proyectos activos, features, hábitos

## Sistema de XP
- 200 XP = 1 nivel · Racha activa = +10% bonus
- Nivel visual: medieval (1-5) → pueblo (6-10) → ciudad (11-20) → futuro (21+)

## Setup

### 1. Variables de entorno

**Frontend (`VITE_*` en `.env`):**

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon de Supabase |
| `VITE_FORJA_SECRET` | Secreto compartido para autenticar las Netlify Functions |

**Backend (Netlify env vars):**

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_SERVICE_KEY` | Clave de servicio de Supabase |
| `ANTHROPIC_API_KEY` | API key de Anthropic para el Coach Forja |
| `FORJA_SECRET` | Secreto compartido para validar llamadas al backend |
| `INTERVALS_ATHLETE_ID` | ID del atleta en Intervals.icu (p.ej. `i12345`) |
| `INTERVALS_API_KEY` | API key de Intervals.icu (se encuentra en Configuración → API) |

### 2. Supabase — crear tablas
Ver el SQL completo en el README extendido o en forja_plan.md.

Tablas necesarias: `forja_profile`, `forja_misiones`, `forja_aprendizaje`, `forja_proyectos`, `forja_mensajes`

### 3. Instalar y ejecutar
```bash
npm install
netlify dev   # http://localhost:8889
```

### 4. Tests y build
```bash
npm test && npm run build
```
