# Diagrama entidad-relación del ERP

Las tablas llevan además `createdAt` y `updatedAt`, que no se dibujan para no saturar el diagrama.

```mermaid
erDiagram
    USUARIO {
        int id PK
        string nombre
        string email UK
        string passwordHash
        string rol "ADMIN|GESTOR|EMPLEADO"
        boolean activo
    }

    TERCERO {
        int id PK
        string tipo "CLIENTE|PROVEEDOR|AMBOS"
        string razonSocial
        string nif
        string email
        string telefono
        string direccion
        string ciudad
        string codigoPostal
        string pais
        int condicionesPago "dias"
        boolean activo
    }

    CATEGORIA {
        int id PK
        string nombre
        string descripcion
    }

    TIPO_IVA {
        int id PK
        string nombre
        decimal porcentaje
    }

    PRODUCTO {
        int id PK
        string referencia UK
        string nombre
        string descripcion
        int categoriaId FK
        int tipoIvaId FK
        decimal precioVenta
        decimal precioCompra
        int stockActual
        int stockMinimo
        boolean esServicio
        boolean activo
    }

    MOVIMIENTO_STOCK {
        int id PK
        int productoId FK
        int usuarioId FK
        int cantidad "positiva o negativa"
        string tipo "COMPRA|VENTA|AJUSTE|ANULACION"
        string motivo
        datetime fecha
        string origenTipo "FACTURA|PEDIDO_COMPRA|AJUSTE"
        int origenId "sin FK, referencia logica"
    }

    SERIE_FACTURA {
        int id PK
        string serie
        int anio
        int ultimoNumero "contador correlativo"
    }

    FACTURA {
        int id PK
        string serie
        int numero "se asigna al emitir"
        int clienteId FK
        int usuarioId FK
        date fechaEmision
        date fechaVencimiento
        string estado "BORRADOR|EMITIDA|COBRADA|ANULADA"
        decimal baseImponible
        decimal totalIva
        decimal total
        string observaciones
    }

    LINEA_FACTURA {
        int id PK
        int facturaId FK
        int productoId FK
        string descripcion
        int cantidad
        decimal precioUnitario "copiado del producto"
        decimal descuento
        decimal porcentajeIva "copiado del producto"
        decimal subtotal
    }

    FACTURA_IVA {
        int id PK
        int facturaId FK
        decimal porcentaje
        decimal base
        decimal cuota
    }

    PAGO {
        int id PK
        int facturaId FK
        decimal importe
        date fecha
        string metodo "TRANSFERENCIA|EFECTIVO|TARJETA"
    }

    HISTORIAL_FACTURA {
        int id PK
        int facturaId FK
        int usuarioId FK
        string estadoAnterior
        string estadoNuevo
        datetime fecha
        string comentario
    }

    PEDIDO_COMPRA {
        int id PK
        string numero
        int proveedorId FK
        int usuarioId FK
        date fecha
        date fechaPrevista
        string estado "BORRADOR|ENVIADO|RECIBIDO_PARCIAL|RECIBIDO|CANCELADO"
        decimal total
    }

    LINEA_PEDIDO_COMPRA {
        int id PK
        int pedidoId FK
        int productoId FK
        int cantidadPedida
        int cantidadRecibida
        decimal precioUnitario
        decimal porcentajeIva
    }

    CATEGORIA ||--o{ PRODUCTO : clasifica
    TIPO_IVA ||--o{ PRODUCTO : aplica

    PRODUCTO ||--o{ MOVIMIENTO_STOCK : registra
    USUARIO ||--o{ MOVIMIENTO_STOCK : realiza

    TERCERO ||--o{ FACTURA : "cliente de"
    USUARIO ||--o{ FACTURA : crea
    SERIE_FACTURA ||--o{ FACTURA : numera

    FACTURA ||--|{ LINEA_FACTURA : contiene
    PRODUCTO ||--o{ LINEA_FACTURA : "se vende en"
    FACTURA ||--o{ FACTURA_IVA : desglosa
    FACTURA ||--o{ PAGO : recibe
    FACTURA ||--o{ HISTORIAL_FACTURA : registra
    USUARIO ||--o{ HISTORIAL_FACTURA : ejecuta

    TERCERO ||--o{ PEDIDO_COMPRA : "proveedor de"
    USUARIO ||--o{ PEDIDO_COMPRA : crea
    PEDIDO_COMPRA ||--|{ LINEA_PEDIDO_COMPRA : contiene
    PRODUCTO ||--o{ LINEA_PEDIDO_COMPRA : "se compra en"
```

## Notas de lectura

- **MOVIMIENTO_STOCK** es la fuente de verdad del stock. `PRODUCTO.stockActual` es una copia que se actualiza en la misma transacción.
- **MOVIMIENTO_STOCK.origenTipo y origenId** apuntan a la factura o al pedido que generó el movimiento, pero sin clave foránea, porque el origen puede ser de tablas distintas.
- **FACTURA.serie y numero** se corresponden con una fila de SERIE_FACTURA (serie y año). El número se asigna solo al emitir y tiene restricción única junto con la serie.
- **LINEA_FACTURA** copia precio e IVA del producto en el momento de la venta, para que los cambios posteriores del catálogo no alteren facturas antiguas.
- **TERCERO** unifica clientes y proveedores: una misma empresa puede ser ambas cosas.
