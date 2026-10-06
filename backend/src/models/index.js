import Usuario from './Usuario.js';
import Tercero from './Tercero.js';
import Categoria from './Categoria.js';
import TipoIva from './TipoIva.js';
import Producto from './Producto.js';
import MovimientoStock from './MovimientoStock.js';
import SerieFactura from './SerieFactura.js';
import Factura from './Factura.js';
import LineaFactura from './LineaFactura.js';
import FacturaIva from './FacturaIva.js';
import Pago from './Pago.js';
import HistorialFactura from './HistorialFactura.js';
import PedidoCompra from './PedidoCompra.js';
import LineaPedidoCompra from './LineaPedidoCompra.js';

Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

TipoIva.hasMany(Producto, { foreignKey: 'tipoIvaId', as: 'productos' });
Producto.belongsTo(TipoIva, { foreignKey: 'tipoIvaId', as: 'tipoIva' });

Producto.hasMany(MovimientoStock, { foreignKey: 'productoId', as: 'movimientos' });
MovimientoStock.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Usuario.hasMany(MovimientoStock, { foreignKey: 'usuarioId', as: 'movimientosStock' });
MovimientoStock.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Tercero.hasMany(Factura, { foreignKey: 'clienteId', as: 'facturas' });
Factura.belongsTo(Tercero, { foreignKey: 'clienteId', as: 'cliente' });

Usuario.hasMany(Factura, { foreignKey: 'usuarioId', as: 'facturas' });
Factura.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Factura.hasMany(LineaFactura, { foreignKey: 'facturaId', as: 'lineas', onDelete: 'CASCADE' });
LineaFactura.belongsTo(Factura, { foreignKey: 'facturaId', as: 'factura' });

Producto.hasMany(LineaFactura, { foreignKey: 'productoId', as: 'lineasFactura' });
LineaFactura.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

Factura.hasMany(FacturaIva, { foreignKey: 'facturaId', as: 'desgloseIva', onDelete: 'CASCADE' });
FacturaIva.belongsTo(Factura, { foreignKey: 'facturaId', as: 'factura' });

Factura.hasMany(Pago, { foreignKey: 'facturaId', as: 'pagos', onDelete: 'RESTRICT' });
Pago.belongsTo(Factura, { foreignKey: 'facturaId', as: 'factura' });

Factura.hasMany(HistorialFactura, { foreignKey: 'facturaId', as: 'historial', onDelete: 'CASCADE' });
HistorialFactura.belongsTo(Factura, { foreignKey: 'facturaId', as: 'factura' });

Usuario.hasMany(HistorialFactura, { foreignKey: 'usuarioId', as: 'historialFacturas' });
HistorialFactura.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

Tercero.hasMany(PedidoCompra, { foreignKey: 'proveedorId', as: 'pedidosCompra' });
PedidoCompra.belongsTo(Tercero, { foreignKey: 'proveedorId', as: 'proveedor' });

Usuario.hasMany(PedidoCompra, { foreignKey: 'usuarioId', as: 'pedidosCompra' });
PedidoCompra.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

PedidoCompra.hasMany(LineaPedidoCompra, { foreignKey: 'pedidoId', as: 'lineas', onDelete: 'CASCADE' });
LineaPedidoCompra.belongsTo(PedidoCompra, { foreignKey: 'pedidoId', as: 'pedido' });

Producto.hasMany(LineaPedidoCompra, { foreignKey: 'productoId', as: 'lineasPedidoCompra' });
LineaPedidoCompra.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

export {
    Usuario,
    Tercero,
    Categoria,
    TipoIva,
    Producto,
    MovimientoStock,
    SerieFactura,
    Factura,
    LineaFactura,
    FacturaIva,
    Pago,
    HistorialFactura,
    PedidoCompra,
    LineaPedidoCompra
};