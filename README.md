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

### 1. Copiar .env
```bash
cp .env.example .env   # rellenar con claves reales
```

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
