# VoltaERP

Proyecto intermodular de DAM. ERP web para una pequeña empresa con gestión de clientes y proveedores, catálogo e inventario, facturación de ventas, compras (versión ligera) e informes.

- **Equipo:** 5 personas
- **Entrega:** febrero
- **Organización del trabajo:** Jira (sprints de dos semanas)

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express + TypeScript |
| ORM | Sequelize |
| Base de datos | Base de datos online (servicio gestionado, compartida por el equipo) |
| Frontend | Angular |
| Documentación de la API | Swagger / OpenAPI |

## Estructura del repositorio

```
.
├── backend/             # API REST (Node.js, Express, Sequelize)
├── frontend/            # Aplicación web (Angular)
├── docs/                # Documentación: proyecto-erp.md, diagrama ER...
├── .env.example         # Variables de entorno de ejemplo
└── README.md
```

## Requisitos previos

- Node.js (versión LTS) y npm
- Git
- Angular CLI (`npm install -g @angular/cli`)

## Puesta en marcha

### 1. Variables de entorno

```bash
cp .env.example backend/.env
```

Edita `backend/.env` y rellena la cadena de conexión a la base de datos online (`DATABASE_URL`) y el resto de valores. Las credenciales reales **se comparten por un canal privado del equipo, nunca en el repositorio**. **Nunca subas ficheros `.env` a Git.**

### 2. Base de datos

La base de datos está alojada online y es común para todo el equipo, así que no hay nada que levantar en local. Solo hace falta que `DATABASE_URL` sea correcta.

Como es compartida:

- Las **migraciones** las lanza una sola persona cuando se fusiona un cambio de esquema a `develop`; el resto hace `git pull` y las aplica una vez.
- **No ejecutar `db:seed` ni deshacer migraciones** sin avisar al equipo, porque afecta a los datos de todos.
- Las **pruebas automáticas** no deben usar esta base de datos (usar una aparte).

### 3. Backend

```bash
cd backend
npm install
npm run db:migrate    # aplica las migraciones pendientes (coordinado con el equipo)
npm run db:seed       # datos iniciales: roles, IVA, series, cliente de contado, admin de prueba (solo una vez)
npm run dev           # arranca la API en modo desarrollo
```

La documentación Swagger de la API estará disponible en `/api/docs` cuando esté configurada.

### 4. Frontend

```bash
cd frontend
npm install
ng serve
```

La aplicación se abre en `http://localhost:4200`.

> Los nombres exactos de los scripts (`db:migrate`, `db:seed`, `dev`) se ajustarán cuando se monte el backend. Mantener esta sección actualizada.

## Módulos

1. Auth y usuarios
2. Terceros (clientes y proveedores)
3. Catálogo e inventario
4. Ventas (facturación)
5. Compras (versión ligera: pedido y recepción de mercancía)
6. Informes y dashboard


## Roles

| Rol | Resumen |
|---|---|
| **ADMIN** | Gestión de usuarios y configuración, y acceso total |
| **GESTOR** | Administración diaria: terceros, catálogo, ventas (emitir, cobrar y anular), compras e informes |
| **EMPLEADO** | Consulta, borradores, emisión de facturas y venta rápida, y recepción de compras. No anula |

La tabla completa de permisos está en [`docs/proyecto-erp.md`](docs/proyecto-erp.md).

## Flujo de trabajo con Git

### Ramas

- `main`: versión estable, lo que se entrega. Solo recibe cambios desde `develop` al cerrar un sprint.
- `develop`: rama de integración. Todo el trabajo se fusiona aquí.
- `feature/ERP-<n>-descripcion-corta`: una rama por historia de Jira (por ejemplo `feature/ERP-12-emitir-factura`).
- `fix/ERP-<n>-descripcion-corta`: correcciones de errores.

`main` y `develop` están protegidas: no se hace push directo, todo entra por pull request con al menos dos aprobaciones.

### Commits

Formato: `tipo(ámbito): descripción breve (ERP-n)`

Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

```
feat(ventas): emitir factura con numeración correlativa (ERP-12)
fix(stock): evitar stock negativo al emitir (ERP-15)
docs(readme): añadir instrucciones de instalación (ERP-3)
```

### Pull requests

1. Crear la rama desde `develop` actualizado.
2. Hacer commits pequeños y frecuentes.
3. Abrir PR hacia `develop` con el código de la historia en el título.
4. Esperar la revisión de otra persona y resolver todos sus comentarios.
5. Fusionar y borrar la rama.

Ramas cortas: si una historia dura más de unos pocos días, dividirla.

## Definición de terminado

Una historia está terminada cuando:

- [ ] Funciona de extremo a extremo (backend y frontend)
- [ ] Tiene pruebas mínimas
- [ ] Respeta los permisos de rol definidos
- [ ] Otra persona la ha revisado en el PR
- [ ] Está fusionada en `develop`
- [ ] La documentación (README, Swagger) está actualizada si ha cambiado algo

## Reglas importantes del dominio

- Una factura emitida **nunca se edita ni se borra**: se anula o se rectifica.
- El stock solo cambia mediante movimientos (`MovimientoStock`), dentro de una transacción.
- Si falta stock al emitir una factura, se rechaza.
- La numeración de facturas es correlativa y sin huecos (contador en `SerieFactura`, dentro de la transacción de emisión).

## Documentación

- [`docs/proyecto-erp.md`](docs/proyecto-erp.md): alcance, módulos, endpoints, modelo de datos, roles y decisiones de diseño.
