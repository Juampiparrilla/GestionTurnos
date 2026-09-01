# Gestión de Turnos

Aplicación web para que negocios con uno o varios locales organicen los turnos de trabajo de sus empleados: quién trabaja qué día, en qué horario, y quién cubre feriados y domingos. Reemplaza la planilla o el cuaderno que se usa hoy para armar los turnos. También incluye un módulo de **Productos** para llevar el catálogo, los costos y los precios de venta del negocio.

Es **multi-tenant**: cada empresa que la usa está completamente aislada de las demás (a nivel de base de datos, no solo de interfaz).

Producción: [gestion-turnos-nu.vercel.app](https://gestion-turnos-nu.vercel.app)

## Cómo se organiza

- Cada empresa (**organización**) tiene **Horarios** — un horario es un local o punto de trabajo (ej. "Magnolia II").
- Cada horario tiene sus propios **Turnos** configurables (ej. Mañana 08:30-13:30, Tarde 16:30-21:30).
- Para cada turno y día de la semana se arma una **grilla semanal tipo** (recurrente, no fechas puntuales): quién trabaja, o si ese turno está Feriado, Cerrado o Sin asignar.
- Aparte de la grilla semanal hay dos registros de **fechas reales** independientes — **Feriados** y **Domingos** — donde se anota fecha concreta + quién cubre ese día, con historial de quién hizo el último cambio y cuándo.
- Un resumen por persona muestra cuántos turnos, domingos y feriados tiene cada uno. El horario se puede descargar como imagen para compartir por WhatsApp.
- No hay registro público de usuarios: un admin crea la cuenta y genera un link de invitación que comparte manualmente (por WhatsApp), sin depender de email. Lo mismo para restablecer una contraseña olvidada.

## Productos

Catálogo de productos del negocio, con **Marcas**, **Categorías** y **Proveedores** como entidades propias (ABM completo: crear, editar, desactivar/reactivar y borrar en forma definitiva).

- Un producto se vende por **Kg** o por **Unidad**. Por Kg tiene **tres pistas de precio independientes** — bolsa cerrada, bolsa abierta (venta suelta por kg) y por mayor —, cada una con su % de ganancia o un precio fijado a mano; el precio por kg se calcula solo a partir de la bolsa abierta. Por Unidad solo tiene precio unitario y por mayor — no aplica "bolsa abierta" a algo que no se vende suelto (ej. un sachet, un accesorio).
- Un producto con varias cantidades (ej. 15 kg y 25 kg) son simplemente dos filas del catálogo con el mismo nombre y marca, no una entidad "presentación" aparte. Al escribir el nombre, se sugieren productos ya cargados con nombres parecidos (autocompletado nativo), para evitar cargar el mismo dos veces con una pequeña diferencia de tipeo.
- Cada producto recibe un **código único** autogenerado a partir de su nombre, para identificarlo rápido en listados, reportes y PDFs.
- El costo se puede cargar directo, calcularlo a partir de una compra por varias unidades (ej. "3 bolsas por $18.000" → $6.000 c/u), o a partir de un precio de lista con % de descuento — en cualquiera de los dos casos, si venía en un paquete de varias (ej. una caja de 12), esa cantidad entra en la misma cuenta.
- No se puede cargar dos veces el mismo producto (mismo nombre y misma cantidad) en la misma organización.
- Toggle de **oferta** por producto, visible como ícono en el listado.
- **Ajuste masivo de %** de ganancia por proveedor, sin tocar los productos que tienen el precio fijado manualmente.
- **Importar/actualizar por Excel**: se descarga una plantilla vacía (para crear varios productos de una) o el catálogo actual completo con un ID por fila (para editarlo y volver a subirlo) — cada fila con ID actualiza ese producto puntual sin tocar el resto, cada fila sin ID crea uno nuevo, todo por la misma planilla. Marca, categoría y proveedor se resuelven por nombre y se crean solas si no existen. Cada fila se valida por separado, así un error en una no frena a las demás.
- **Reportes**: filtra el catálogo por categoría, proveedor, marca, cantidad y oferta (con selección múltiple en cada uno, y un botón para limpiar todos los filtros) y por un rango de precio sobre la bolsa cerrada. Genera un PDF horizontal con el resultado, opcionalmente agrupado por categoría/marca/proveedor, con marca de agua y encabezado con el nombre y teléfono del negocio — completo para uso interno, o reducido a nombre + cantidad + los precios que elijas mostrar para compartir con un cliente (por WhatsApp o descarga directa), con una fecha de validez opcional (a tantos días desde hoy). Todo archivo descargado (PDF, plantilla, catálogo) lleva fecha y hora en el nombre, para no confundir descargas viejas con la última.
- Botón **Funcionalidades** en la pantalla principal con el detalle de todo lo anterior.
- Solo Administrador y Super Administrador gestionan y ven costos; el catálogo de solo consulta para Empleado todavía está pendiente.

## Roles

| Rol | Alcance | Qué puede hacer |
|---|---|---|
| **Administrador de Plataforma** | Global, no pertenece a ninguna organización | Da de alta organizaciones nuevas junto con su primer Super Administrador; activa/desactiva organizaciones. Sin acceso operativo a los turnos de ninguna empresa. |
| **Super Administrador** | Una organización | Todo lo que puede un Administrador, más: crear otros Administradores, y es el único que puede asignar ese rol. |
| **Administrador** | Una organización | Gestiona horarios, turnos, asignaciones, feriados, domingos y usuarios (crear, editar, activar/desactivar, invitar, restablecer contraseña, borrar en forma definitiva una vez desactivado). No puede crear organizaciones ni Super Administradores. |
| **Empleado** | Una organización | Solo lectura: ve sus horarios, la grilla semanal, feriados y domingos correspondientes, y puede descargar el horario. |

## Stack

- **Next.js** (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui (sobre Base UI)
- **Supabase**: Postgres + Auth + Row Level Security como única capa de datos y de aislamiento entre organizaciones
- **jsPDF** para generar los PDF de Reportes en el navegador, sin backend
- **exceljs** para la plantilla e importación de productos por Excel (server-side)
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
