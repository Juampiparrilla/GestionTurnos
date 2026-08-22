# Gestión de Turnos

Aplicación web para que negocios con uno o varios locales organicen los turnos de trabajo de sus empleados: quién trabaja qué día, en qué horario, y quién cubre feriados y domingos. Reemplaza la planilla o el cuaderno que se usa hoy para armar los turnos.

Es **multi-tenant**: cada empresa que la usa está completamente aislada de las demás (a nivel de base de datos, no solo de interfaz).

Producción: [gestion-turnos-nu.vercel.app](https://gestion-turnos-nu.vercel.app)

## Cómo se organiza

- Cada empresa (**organización**) tiene **Horarios** — un horario es un local o punto de trabajo (ej. "Magnolia II").
- Cada horario tiene sus propios **Turnos** configurables (ej. Mañana 08:30-13:30, Tarde 16:30-21:30).
- Para cada turno y día de la semana se arma una **grilla semanal tipo** (recurrente, no fechas puntuales): quién trabaja, o si ese turno está Feriado, Cerrado o Sin asignar.
- Aparte de la grilla semanal hay dos registros de **fechas reales** independientes — **Feriados** y **Domingos** — donde se anota fecha concreta + quién cubre ese día, con historial de quién hizo el último cambio y cuándo.
- Un resumen por persona muestra cuántos turnos, domingos y feriados tiene cada uno. El horario se puede descargar como imagen para compartir por WhatsApp.
- No hay registro público de usuarios: un admin crea la cuenta y genera un link de invitación que comparte manualmente (por WhatsApp), sin depender de email. Lo mismo para restablecer una contraseña olvidada.

## Roles

| Rol | Alcance | Qué puede hacer |
|---|---|---|
| **Administrador de Plataforma** | Global, no pertenece a ninguna organización | Da de alta organizaciones nuevas junto con su primer Super Administrador; activa/desactiva organizaciones. Sin acceso operativo a los turnos de ninguna empresa. |
| **Super Administrador** | Una organización | Todo lo que puede un Administrador, más: crear otros Administradores, y es el único que puede asignar ese rol. |
| **Administrador** | Una organización | Gestiona horarios, turnos, asignaciones, feriados, domingos y usuarios (crear, editar, activar/desactivar, invitar, restablecer contraseña). No puede crear organizaciones ni Super Administradores. |
| **Empleado** | Una organización | Solo lectura: ve sus horarios, la grilla semanal, feriados y domingos correspondientes, y puede descargar el horario. |

## Stack

- **Next.js** (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui (sobre Base UI)
- **Supabase**: Postgres + Auth + Row Level Security como única capa de datos y de aislamiento entre organizaciones
- Deploy en **Vercel**, auto-deploy sobre `main`

La seguridad no depende del frontend: todo el aislamiento entre organizaciones y los permisos por rol están reforzados con RLS y funciones de base de datos, no solo con lo que muestra la interfaz.

## Desarrollo local

```bash
npm install
npm run dev
```

Necesita un archivo `.env.local` con las credenciales del proyecto de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

Las migraciones de base de datos están en `supabase/migrations/`, en orden — se corren manualmente en el SQL Editor de Supabase.

### Scripts

```bash
npm run dev              # servidor de desarrollo
npm run build             # build de producción
npm run test               # tests (Vitest)
npm run lint                # ESLint
npm run bootstrap           # crea la primera organización + su Super Administrador
npm run bootstrap:platform  # crea un Administrador de Plataforma
```

`bootstrap` y `bootstrap:platform` son para desarrollo/recuperación técnica: el alta normal de una organización nueva se hace desde `/platform` una vez que existe al menos un Administrador de Plataforma.
