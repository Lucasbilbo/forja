# Forja — Plan del producto

## Visión
OS personal gamificado exclusivo para Lucas. La vida real se convierte en un RPG medieval que evoluciona visualmente con el nivel del personaje. Tres dimensiones: Cuerpo, Mente, Ejecución.

## Estado actual

### ✅ Completado (v0.1)
- Setup: React + Vite + Supabase + Netlify Functions + Vitest
- Estética medieval: CSS variables, paleta marrón/naranja, fuente Cinzel
- Auth: Login con Google via Supabase
- Pantalla Mundo: vista de los 3 edificios con nivel, stats y misiones del día
- Arena (Cuerpo): misiones manuales, completar → XP + racha
- Torre del Mago (Mente): aprendizajes en curso, historial, sugerencias de IA
- Taller (Ejecución): proyectos activos, misiones por proyecto
- Coach Forja: chat con contexto de las 3 dimensiones
- Sistema XP: 200 XP/nivel, +10% bonus por racha, stats por edificio
- Barra del personaje: nivel, XP, racha, stats
- NavBar inferior: Mundo, Arena, Torre, Taller, Coach
- Toast XP: animación al ganar XP y subir de nivel
- Netlify Function: forja-coach.js con validación de secreto

### 🔄 Pendiente (v0.2)
- [ ] Briefing semanal automático (cada lunes el coach genera reflexión + sugerencia concreta)
- [ ] Integración con TriCoach: sesiones Strava → XP automático en Arena
- [ ] Misiones semanales con más XP
- [ ] Animación de subida de nivel más elaborada
- [ ] Vista de estadísticas / progreso histórico
- [ ] Función backend para guardar sugerencias de aprendizaje de la IA

### 🔮 Futuro (v0.3+)
- [ ] Evolución visual según nivel (estética pueblo → ciudad → futuro)
- [ ] Sistema de logros / achievements
- [ ] Proyectos con milestones
- [ ] Notificaciones push (si llevas X días sin actividad)
- [ ] Modo offline básico (PWA)

## Roadmap de fases

### Fase 1 — Base (v0.1) ✅
Fundamentos: auth, 3 edificios, sistema XP, coach

### Fase 2 — Automatización (v0.2)
- Briefing semanal automático del coach
- Integración TriCoach/Strava
- Misiones semanales

### Fase 3 — Profundidad (v0.3)
- Evolución visual por nivel
- Logros y achievements
- Estadísticas históricas

## Stack técnico
- Frontend: React 19 + Vite 8 (JavaScript)
- Auth + DB: Supabase (tablas forja_*)
- Backend: Netlify Functions (CommonJS)
- AI: Claude claude-sonnet-4-20250514 via Anthropic API
- Tests: Vitest + Testing Library

## Schema Supabase
Ver CLAUDE.md para el schema completo.

## Proyectos activos en el Taller
- TriCoach — entrenador IA para triatletas
- Forja — este proyecto (OS personal gamificado)
