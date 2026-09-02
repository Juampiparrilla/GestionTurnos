# Gestión de Turnos

Aplicación web para que negocios con uno o varios locales organicen los turnos de trabajo de sus empleados: quién trabaja qué día, en qué horario, y quién cubre feriados y domingos. Reemplaza la planilla o el cuaderno que se usa hoy para armar los turnos. También incluye un módulo de **Productos** para llevar el catálogo, los costos y los precios de venta del negocio, y un módulo de **Caja** para registrar ingresos y egresos de dinero por local y turno.

Es **multi-tenant**: cada empresa que la usa está completamente aislada de las demás (a nivel de base de datos, no solo de interfaz).

Si tenés una pestaña abierta en la compu y cargás algo desde el celular, no hace falta apretar F5: al volver a esa pestaña (cambiar de ventana o app y volver) se actualiza sola.

Producción: [gestion-turnos-nu.vercel.app](https://gestion-turnos-nu.vercel.app)

## Cómo se organiza

- Cada empresa (**organización**) tiene **Horarios** — un horario es un local o punto de trabajo (ej. "Magnolia II").
- Cada horario tiene sus propios **Turnos** configurables (ej. Mañana 08:30-13:30, Tarde 16:30-21:30).
- Para cada turno y día de la semana se arma una **grilla semanal tipo** (recurrente, no fechas puntuales): quién trabaja, o si ese turno está Feriado, Cerrado o Sin asignar.
- Aparte de la grilla semanal hay dos registros de **fechas reales** independientes — **Feriados** y **Domingos** — donde se anota fecha concreta + quién cubre ese día, con historial de quién hizo el último cambio y cuándo.
- Un resumen por persona muestra cuántos turnos, domingos y feriados tiene cada uno. El horario se puede descargar como imagen para compartir por WhatsApp.
- No hay registro público de usuarios: un admin crea la cuenta y genera un link de invitación que comparte manualmente (por WhatsApp), sin depender de email. Lo mismo para restablecer una contraseña olvidada.

## Productos

Catálogo de productos del negocio, con **Marcas**, **Categorías** y **Proveedores** como entidades propias (ABM completo: crear, editar, desactivar/reactivar y borrar en forma definitiva). En las tres, cada fila se puede desplegar para ver sus productos (cargados bajo demanda) y reasignar cualquiera a otra marca/categoría/proveedor ahí mismo, sin pasar por el formulario completo de edición.

- Un producto se vende por **Kg** o por **Unidad**. Por Kg tiene **tres pistas de precio independientes** — bolsa cerrada, bolsa abierta (venta suelta por kg) y por mayor —, cada una con su % de ganancia o un precio fijado a mano; el precio de Bolsa abierta se calcula sobre la bolsa entera (misma base que la cerrada) y el formulario muestra al lado a cuánto equivale el kg suelto. Por Unidad solo tiene precio unitario y por mayor — no aplica "bolsa abierta" a algo que no se vende suelto (ej. un sachet, un accesorio). La cantidad admite decimales por Kg (ej. 0.5) pero nunca por Unidad, donde tiene que ser un número entero.
- Un producto con varias cantidades (ej. 15 kg y 25 kg) son simplemente dos filas del catálogo con el mismo nombre y marca, no una entidad "presentación" aparte. Al escribir el nombre, se sugieren productos ya cargados con nombres parecidos, para evitar cargar el mismo dos veces con una pequeña diferencia de tipeo.
- El formulario de "Crear producto" se puede **anclar** (ícono de pin en el título) para que quede abierto después de guardar, en vez de cerrarse, así se pueden cargar varios productos seguidos sin volver a abrirlo cada vez. Crear, editar, desactivar/reactivar o borrar un producto (y lo mismo para Marcas, Categorías y Proveedores) siempre confirma con un mensaje de éxito o de error.
- El listado de productos, además de buscar por nombre, tiene los mismos filtros que Reportes (categoría, proveedor, marca, cantidad, oferta y precio, con selección múltiple), colapsados detrás de un botón "Aplicar filtros".
- Cada producto recibe un **código único** autogenerado a partir de su nombre, para identificarlo rápido en el listado y en Reportes (no aparece en los PDF).
- El costo se puede cargar directo, calcularlo a partir de una compra por varias unidades (ej. "3 bolsas por $18.000" → $6.000 c/u), o a partir de un precio de lista con % de descuento — en cualquiera de los dos casos, si venía en un paquete de varias (ej. una caja de 12), esa cantidad entra en la misma cuenta.
- No se puede cargar dos veces el mismo producto (mismo nombre y misma cantidad) en la misma organización.
- Toggle de **oferta** por producto, visible como ícono en el listado.
- **Ajuste masivo de %** de ganancia por proveedor, sin tocar los productos que tienen el precio fijado manualmente.
- **Actualizar costos**: buscá o filtrá (mismos filtros que Reportes) para encontrar los productos y tildalos a mano -- de a uno o todos los que quedaron filtrados con un solo botón, la selección se mantiene entre búsquedas -- y aplicales de una un % de aumento (solo el número, ej. 15) o baja (con el signo "-" adelante, ej. -15) sobre el costo actual, por ejemplo cuando un proveedor sube toda su lista un 15%. Las tres pistas de precio se recalculan solas con el % de ganancia que ya tenía cada una, sin tocar las fijadas manualmente.
- **Importar/actualizar por Excel**: se descarga una plantilla vacía (para crear varios productos de una) o el catálogo actual completo con un ID por fila (para editarlo y volver a subirlo) — cada fila con ID actualiza ese producto puntual sin tocar el resto, cada fila sin ID crea uno nuevo, todo por la misma planilla. Marca, categoría y proveedor se resuelven por nombre y se crean solas si no existen. Cada fila se valida por separado, así un error en una no frena a las demás.
- **Reportes**: filtra el catálogo por categoría, proveedor, marca, cantidad y oferta (con selección múltiple en cada uno, y un botón para limpiar todos los filtros) y por un rango de precio sobre la bolsa cerrada. Genera un PDF horizontal con el resultado, con cada producto numerado en la primera columna, opcionalmente agrupado por categoría/marca/proveedor (cada grupo separado con una fila en negro que nunca queda sola al pie de una hoja, y con la numeración arrancando de nuevo en cada grupo), con marca de agua del nombre del negocio y encabezado con nombre y teléfono — completo para uso interno, o reducido a nombre + cantidad + los precios que elijas mostrar para compartir con un cliente (por WhatsApp o descarga directa), con una fecha de validez opcional (a tantos días desde hoy). Todo archivo descargado (PDF, plantilla, catálogo) lleva fecha y hora en el nombre, para no confundir descargas viejas con la última.
- La flecha junto al título de cada pantalla (Productos, Marcas, Categorías, Proveedores, Actualizar costos, Reportes) abre un menú para saltar directo a cualquier otra sección o al inicio, sin volver primero al menú principal.
- Botón **Funcionalidades** en la pantalla principal con el detalle de todo lo anterior.
- Solo Administrador y Super Administrador gestionan y ven costos; el catálogo de solo consulta para Empleado todavía está pendiente.

## Caja

Registro de ingresos y egresos de dinero de cada local, pensado para cargarse rápido desde el celular al cerrar un turno. Reutiliza los **Horarios** (locales) y **Turnos** de la sección anterior — Caja no tiene su propia noción de local ni turno.

- **Dashboard** (`/caja`): tarjetas de Ingresos, Egresos, Balance (Ingresos − Egresos, nunca guardado, siempre calculado) y Promedio diario (ingresos del período / cantidad de días con al menos un ingreso), un gráfico de líneas con los ingresos por día, el día con más y con menos ingresos, y un resumen de ingresos por turno. Todo filtrable por período (Hoy, Ayer, Últimos 7/30 días, Este mes, Mes anterior o un rango a elección), local, turno y tipo, colapsado detrás de un botón "Filtros" con su "Limpiar filtros", como en Productos.
- **Movimientos** (`/caja/movimientos`): listado filtrable por fecha, local, turno, tipo y etiqueta, con un botón "+ Nuevo movimiento" arriba de los filtros que abre el alta en un panel lateral (se puede **anclar** para cargar varios seguidos, igual que "Crear producto" en Productos): Tipo (Ingreso ↑ / Egreso ↓) → Etiqueta (filtrada según el tipo elegido; se puede crear una nueva sin salir del formulario) → Importe → Fecha → Local → Turno (o "Sin turno") → Observación opcional. El campo Importe admite sumar varias ventas con `+` o restar con `-` (ej. `5000+3000+1500`), mostrando el total calculado en vivo. Un Administrador o Super Administrador puede editar cualquier campo de un movimiento (por si se cargó mal) o anularlo con un motivo opcional — un movimiento anulado no se borra, queda visible en el historial marcado como "Anulado" y deja de contar en los totales.
- **Etiquetas** (`/caja/etiquetas`, solo Administrador/Super Administrador): ABM para clasificar los movimientos (ej. "Venta del Día", "Pago del Mes", "Compra Mercadería"). Una etiqueta ya usada en algún movimiento no se puede borrar ni cambiar de tipo (Ingreso/Egreso) — se desactiva en su lugar, y sigue apareciendo en el historial.
- **Deudas** (`/caja/deudas`, solo Administrador/Super Administrador): plata que le prestaron al negocio (ej. para pagar el alquiler) — no es una venta ni un gasto real, así que se registra separada y nunca cuenta en los totales ni en el gráfico de Caja. Cada deuda tiene fecha, a quién se le debe (texto libre, no hace falta que sea un Proveedor registrado), importe y observación opcional, con estado **Pendiente → Pagada o Anulada** (con motivo opcional). Solo se puede editar mientras está Pendiente; una vez pagada o anulada queda fija como historial.
- Un Empleado ve y carga movimientos solo de los locales donde está asignado (igual criterio que en Horarios); editar y anular movimientos, y toda la sección de Deudas, es exclusivo de Administrador/Super Administrador.
- Todos los importes se muestran en formato argentino (`$ 185.000`) pero se guardan como número puro, sin signos.

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
- **recharts** para el gráfico de ingresos por día en el Dashboard de Caja
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
