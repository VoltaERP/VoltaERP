# Proyecto intermodular DAM: ERP

## 1. Contexto

- **Tipo:** proyecto intermodular de DAM, en grupo.
- **Tema:** ERP, designado por el profesor.
- **Equipo:** 5 personas.
- **Fecha límite:** febrero.
- **Metodología:** Scrum (sprints).
- **Tecnologías:** el profesor no exige ninguna en concreto. Stack: backend en Node.js (Express con TypeScript; se descarta NestJS por su curva de aprendizaje), ORM Sequelize, frontend web en Angular y base de datos PostgreSQL.
- **Módulos:** el profesor no exige módulos concretos.

## 2. Alcance

### Módulos del núcleo

1. **Auth y usuarios**
2. **Terceros** (clientes y proveedores)
3. **Catálogo e inventario**
4. **Ventas** (facturación)
5. **Compras** (versión ligera: pedido a proveedor y recepción de mercancía)
6. **Informes y dashboard**

### Fuera de alcance (de momento)

- **Módulo de OCR de gastos** (app Android en Kotlin con ML Kit). Queda como posible ampliación futura si sobra tiempo.

### Ampliaciones posibles

- Compras completo: facturas de proveedor y pagos.
- Facturas rectificativas.
- Presupuestos convertibles en factura.
- Exportación contable.

## 3. Descripción de los módulos

### 3.1 Auth y usuarios
Controla quién entra y qué puede hacer. Cada usuario tiene un rol (ADMIN, GESTOR, EMPLEADO) y según él ve o ejecuta ciertas acciones. Por ejemplo, solo el admin crea usuarios o anula facturas.

### 3.2 Terceros
La agenda de la empresa: clientes y proveedores con NIF, datos fiscales, contacto y condiciones de pago. Desde la ficha de un cliente se ven sus facturas y desde la de un proveedor sus pedidos.

### 3.3 Catálogo e inventario
Productos y servicios con referencia, precio, IVA y categoría. Lleva el stock y cada movimiento (entrada, salida, ajuste) con su motivo. Avisa cuando un producto baja del mínimo.

### 3.4 Ventas
Crea facturas para clientes: se elige cliente, se añaden líneas y el sistema calcula bases, IVA y total. Al emitirla asigna número correlativo, descuenta stock y la bloquea. Después se puede cobrar o anular, todo con historial. Genera el PDF.

### 3.5 Compras
Espejo de ventas: pedido a un proveedor y, cuando llega la mercancía, recepción (total o parcial) que suma stock automáticamente. Cierra el ciclo comprar → almacenar → vender.

### 3.6 Informes y dashboard
Solo lectura. Resume ventas por periodo, facturas pendientes de cobro, productos con poco stock, mejores clientes y valoración del inventario. Es la portada del ERP.

### 3.7 Roles y permisos

| Módulo | ADMIN | GESTOR | EMPLEADO |
|---|---|---|---|
| **Usuarios** | Crear, editar, desactivar y cambiar roles | Sin acceso | Solo su propio perfil |
| **Terceros** | Todo | Crear, editar y desactivar | Consultar |
| **Catálogo** | Todo, incluidas categorías y tipos de IVA | Crear y editar productos y precios | Consultar |
| **Stock** | Ajustes manuales y movimientos | Ajustes manuales y movimientos | Ver stock actual |
| **Ventas** | Todo | Crear, emitir, cobrar, **anular**, PDF e historial | Crear y editar borradores, **emitir**, venta rápida, registrar cobro y PDF. **No anula** |
| **Compras** | Todo | Crear, enviar y cancelar pedidos, y recepcionar | Crear borradores y registrar recepciones |
| **Informes** | Todos | Todos, incluido "facturas emitidas por usuario" | Solo stock bajo |
| **Configuración** | Series de facturas y tipos de IVA | Sin acceso | Sin acceso |

**Por qué este reparto**
- **Admin:** lo estructural (usuarios, configuración, categorías e IVA) y todo lo demás.
- **Gestor:** la administración diaria; también anula, para que un error no dependa de una sola persona, y tiene el informe de facturas por usuario como control a posteriori.
- **Empleado:** cubre el mostrador (emite y usa la venta rápida) y la parte física (recepciones), pero no anula ni toca precios del catálogo.

**Reglas comunes**
- Una factura emitida **nunca se edita ni se borra**: se anula o se rectifica.
- Cada emisión y anulación queda con su usuario en `HistorialFactura` y `MovimientoStock`.
- La seguridad real va en el backend con `requireRole(...)` en cada ruta; Angular solo oculta botones.

**Flujos de venta soportados**
- **Mostrador:** el empleado emite en el momento (atajo de venta rápida) a un tercero genérico "Cliente de contado", sin dar de alta a nadie.
- **Oficina:** se prepara un borrador y otra persona, normalmente un gestor, lo revisa y lo emite.

**Corrección de errores en facturas emitidas**
- Versión mínima: se anula la factura (conserva su número, así no hay huecos), se devuelve el stock con movimientos `ANULACION` y se emite una nueva.
- Ampliación: factura rectificativa, con `facturaRectificadaId` en `Factura` y una serie propia ("R") en `SerieFactura`.

### Dependencias entre módulos
Terceros y Catálogo son la base. Ventas y Compras consumen esa base y mueven el stock. Informes lee de todos.

## 4. Endpoints del backend (REST, prefijo `/api`)

**Auth y usuarios**
- `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- `/usuarios`: CRUD + `PATCH /usuarios/{id}/rol` y `/activo`

**Terceros**
- `/clientes` y `/proveedores`: CRUD con búsqueda y paginación (`?q=&page=`)
- `GET /clientes/{id}/facturas`, `GET /proveedores/{id}/pedidos`

**Catálogo e inventario**
- `/productos`: CRUD + `GET /productos?stockBajo=true`
- `/categorias` y `/tipos-iva`: CRUD
- `GET /productos/{id}/movimientos`
- `POST /stock/ajuste`

**Ventas**
- `/facturas`: CRUD mientras esté en borrador (líneas incluidas en el body)
- `POST /facturas/{id}/emitir`, `/anular`, `/pago`
- `POST /facturas/venta-rapida`: crea y emite en una sola transacción (mostrador)
- `GET /facturas/{id}/pdf`, `GET /facturas/{id}/historial`
- Opcional: `/presupuestos` + `POST /presupuestos/{id}/convertir`

**Compras**
- `/pedidos-compra`: CRUD en borrador
- `POST /pedidos-compra/{id}/enviar`, `/recepcion`, `/cancelar`
- Fase 2: `/facturas-proveedor` y pagos

**Informes (solo GET)**
- `/informes/ventas?desde=&hasta=&agrupar=mes`
- `/informes/facturas-pendientes`
- `/informes/stock-bajo`, `/informes/valoracion-stock`
- `/informes/top-clientes`, `/informes/top-productos`
- `/dashboard/resumen`

**Transversal:** validación con códigos de error coherentes, roles por endpoint (middleware de autorización), paginación común y auditoría (quién creó o cambió qué).

Las acciones de negocio (`emitir`, `recepcion`, `anular`) son `POST` sobre el recurso, no `PUT`, porque disparan efectos en cadena (stock, numeración, historial).

## 5. Gestión del stock

Se combinan dos elementos:

1. **Tabla `MovimientoStock` (fuente de verdad).** Cada entrada, salida o ajuste es una fila nueva que nunca se edita ni se borra: producto, cantidad (+/-), tipo, motivo, usuario, fecha y documento de origen. El stock real es la suma de los movimientos.
2. **Campo `stockActual` en `Producto` (copia para lectura rápida).** Se actualiza en la misma transacción que inserta el movimiento (`stock_actual = stock_actual + :cantidad`).

Reglas:
- Las correcciones se hacen con un movimiento inverso, nunca borrando.
- Anular una factura genera movimientos de entrada que compensan los de salida.
- Usar una transacción del ORM (`sequelize.transaction`) para que movimiento y `stockActual` se guarden juntos o ninguno.
- Un test o endpoint de comprobación puede verificar que `stockActual` coincide con la suma de movimientos.

### Concurrencia al emitir facturas

Los dos problemas se resuelven en la base de datos, dentro de la misma transacción que emite la factura.

**Numeración correlativa sin huecos**
- Tabla `SerieFactura` (serie, año, `ultimoNumero`).
- Al emitir, dentro de la transacción: `UPDATE serie_factura SET ultimo_numero = ultimo_numero + 1 WHERE ... RETURNING ultimo_numero`. Postgres bloquea esa fila, así que una segunda emisión espera a que termine la primera.
- Si algo falla después (por ejemplo, no hay stock), el rollback devuelve el contador y no queda ningún hueco.
- No usar una `SEQUENCE` de Postgres: no es transaccional y un rollback dejaría un número quemado.
- El número se asigna solo al emitir, nunca en borrador. Restricción única sobre (serie, numero) como red de seguridad.
- Coste: las emisiones de una misma serie se hacen de una en una, algo que en una pyme no se nota.

**Stock con emisiones simultáneas**
- Si falta stock al emitir, la factura se rechaza.
- Descuento con una sola sentencia condicional: `UPDATE producto SET stock_actual = stock_actual - :n WHERE id = :id AND stock_actual >= :n`.
- Si no se modifica ninguna fila, no había stock suficiente: se lanza un error y se deshace toda la transacción (factura, contador y movimientos).
- Al ser atómico, la segunda emisión ve el stock ya descontado por la primera y falla limpiamente.
- En facturas con varias líneas, procesarlas siempre en el mismo orden (por ejemplo, por `id` de producto) para evitar deadlocks.
- `CHECK (stock_actual >= 0)` en la tabla como última defensa: nunca se permite stock negativo.
- El insert en `MovimientoStock` va en la misma transacción.

**Cómo probarlo:** un test que lance dos emisiones a la vez con `Promise.all` contra el último producto en stock. Debe pasar una y fallar la otra, y los números emitidos deben ser correlativos.

## 6. Modelo de datos

Todas las entidades llevan `id`, `createdAt` y `updatedAt`.

| Entidad | Atributos |
|---|---|
| **Usuario** | nombre, email (único), passwordHash, rol (ADMIN, GESTOR, EMPLEADO), activo |
| **Tercero** | tipo (CLIENTE, PROVEEDOR, AMBOS), razonSocial, nif, email, telefono, direccion, ciudad, codigoPostal, pais, condicionesPago (días), activo |
| **Categoria** | nombre, descripcion |
| **TipoIva** | nombre, porcentaje (21, 10, 4, 0) |
| **Producto** | referencia (única), nombre, descripcion, categoria (FK), tipoIva (FK), precioVenta, precioCompra, stockActual, stockMinimo, esServicio, activo |
| **MovimientoStock** | producto (FK), cantidad (+/-), tipo (COMPRA, VENTA, AJUSTE, ANULACION), motivo, usuario (FK), fecha, origenTipo, origenId |
| **Factura** | numero, serie, cliente (FK), fechaEmision, fechaVencimiento, estado (BORRADOR, EMITIDA, COBRADA, ANULADA), baseImponible, totalIva, total, observaciones, usuario (FK) |
| **SerieFactura** | serie, anio, ultimoNumero (contador para la numeración correlativa) |
| **LineaFactura** | factura (FK), producto (FK), descripcion, cantidad, precioUnitario, descuento, porcentajeIva, subtotal |
| **FacturaIva** | factura (FK), porcentaje, base, cuota |
| **Pago** | factura (FK), importe, fecha, metodo (TRANSFERENCIA, EFECTIVO, TARJETA) |
| **HistorialFactura** | factura (FK), estadoAnterior, estadoNuevo, usuario (FK), fecha, comentario |
| **PedidoCompra** | numero, proveedor (FK), fecha, fechaPrevista, estado (BORRADOR, ENVIADO, RECIBIDO_PARCIAL, RECIBIDO, CANCELADO), total, usuario (FK) |
| **LineaPedidoCompra** | pedido (FK), producto (FK), cantidadPedida, cantidadRecibida, precioUnitario, porcentajeIva |

### Relaciones clave
- Tercero 1-N Factura y PedidoCompra.
- Factura 1-N LineaFactura, FacturaIva, Pago e HistorialFactura.
- Producto 1-N MovimientoStock.
- Categoria y TipoIva 1-N Producto.

### Cómo se lee una factura
- **Factura:** la cabecera (número, cliente, fecha, estado, totales).
- **LineaFactura:** las filas de productos vendidos.
- **FacturaIva:** el resumen de impuestos por tipo, al pie.
- **Pago:** cada cobro del cliente (permite pagos parciales).
- **HistorialFactura:** registro de cambios de estado (quién y cuándo).

Ejemplo: 2 teclados a 50 € (IVA 21%) y 1 libro a 20 € (IVA 4%) dan base 120 €, IVA 22,80 € y total 142,80 €, con 2 líneas y 2 filas de desglose de IVA.

### Decisiones de diseño
- **Modelo cerrado tal como está descrito arriba**, con la facturación completa (factura, líneas, desglose de IVA, pagos e historial).
- Precio e IVA se **copian en las líneas** para que las facturas antiguas no cambien si el producto cambia de precio.
- Tercero unificado (clientes y proveedores en una tabla); alternativa válida: tablas separadas.

## 7. Cuestiones abiertas

- Acordar en el sprint 0 la estructura común del backend: TypeScript, una carpeta por módulo (rutas, controlador, servicio y validación), lógica de negocio en los servicios, middleware común de autenticación, roles y errores, y linter/formateador compartidos.
- Compras entra de momento en versión ligera (pedido + recepción, que suma stock). Facturas de proveedor y pagos quedan para una segunda fase si da tiempo.

## 8. Próximos pasos

1. Diagrama entidad-relación (draw.io, dbdiagram.io o similar) revisado por los 5 antes de programar.
2. Modelos de Sequelize a partir del diagrama.
3. Reparto por dependencias: primero Auth, Terceros y Catálogo; después Ventas y Compras en paralelo; Informes al final.
4. Planificar los sprints (sprint 0: diseño, modelo de datos y entorno; sprints finales: pruebas y memoria).

## 9. Anexo: trabajo previo sobre el escáner de facturas (OCR)

Antes de que el profesor asignara el ERP se diseñó un escáner de facturas para autónomos. Queda fuera del ERP de momento, pero se conserva por si se retoma:

- App Android en Kotlin con ML Kit; OCR en el móvil.
- Estados de factura: subida, pendiente de revisión, validada, exportada y un único estado "rechazada" con campo de motivo (ilegible, duplicada, no deducible).
- Panel del gestor en Angular, con la imagen de la factura visible mientras se comprueba.
- Duplicados: rechazo automático solo si la imagen es idéntica (`hash_imagen`); si solo se parece, queda en revisión con `duplicada_de` como aviso. Campo `validada_auto` en la tabla de facturas.
- Entidades previstas: Usuario, Cliente, Proveedor, Factura, FacturaIva, HistorialFactura, Categoria, ReglaCategoria y Exportacion.
- Prueba con una factura real: el NIF del proveedor no se leyó por estar en el pie, fuera del encuadre. Solución: exigir que la foto cubra todo el documento y usar una búsqueda de NIF por proveedor conocido como respaldo. El escáner de documentos de ML Kit funcionó bien (detecta bordes y encuadra correctamente).
