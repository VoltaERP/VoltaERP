import 'dotenv/config';
import db from '../config/db.js';
import {
  Usuario,
  Tercero,
  Categoria,
  TipoIva,
  SerieFactura
} from '../models/index.js';

async function seed() {
  console.log('Iniciando carga de datos iniciales...');

  try {
    await db.authenticate();
    console.log('Conexión a la base de datos correcta');

    // 1. Tipos de IVA
    console.log('Creando tipos de IVA...');
    const tiposIva = [
      { nombre: 'General 21%', porcentaje: 21.00 },
      { nombre: 'Reducido 10%', porcentaje: 10.00 },
      { nombre: 'Superreducido 4%', porcentaje: 4.00 },
      { nombre: 'Exento 0%', porcentaje: 0.00 }
    ];

    for (const iva of tiposIva) {
      await TipoIva.findOrCreate({
        where: { nombre: iva.nombre },
        defaults: iva
      });
    }
    console.log('Tipos de IVA creados');

    // 2. Series de Facturación (para el año actual)
    console.log('Creando series de facturación...');
    const anoActual = new Date().getFullYear();
    const series = [
      { serie: 'F', anio: anoActual, ultimoNumero: 0 },
      //{ serie: 'R', anio: anioActual, ultimoNumero: 0 } // Rectificativas
    ];

    for (const s of series) {
      await SerieFactura.findOrCreate({
        where: { serie: s.serie, anio: s.anio },
        defaults: s
      });
    }
    console.log('Series de facturación creadas');

    // 3. Categorías iniciales
    console.log('Creando categorías...');
    const categorias = [
      { nombre: 'General', descripcion: 'Productos generales del catálogo' },
      { nombre: 'Servicios', descripcion: 'Servicios y mano de obra' }
    ];

    for (const cat of categorias) {
      await Categoria.findOrCreate({
        where: { nombre: cat.nombre },
        defaults: cat
      });
    }
    console.log('Categorías creadas');

    // 4. Tercero: Cliente de contado (genérico para ventas rápidas de mostrador)
    console.log('Creando cliente de contado...');
    await Tercero.findOrCreate({
      where: { razonSocial: 'Cliente de contado' },
      defaults: {
        tipo: 'CLIENTE',
        razonSocial: 'Cliente de contado',
        nif: '00000000T',
        email: 'contado@voltaerp.local',
        telefono: '000000000',
        direccion: 'Venta presencial',
        ciudad: 'Local',
        codigoPostal: '00000',
        pais: 'España',
        condicionesPago: 0,
        activo: true
      }
    });
    console.log('Cliente de contado creado');

    // 5. Usuarios iniciales de prueba (uno por cada rol)
    console.log('Creando usuarios iniciales...');
    const usuarios = [
      {
        nombre: 'Administrador',
        email: 'admin@voltaerp.com',
        password: 'admin123',
        rol: 'ADMIN',
        activo: true
      },
      {
        nombre: 'Gestor de Ventas',
        email: 'gestor@voltaerp.com',
        password: 'gestor123',
        rol: 'GESTOR',
        activo: true
      },
      {
        nombre: 'Empleado Mostrador',
        email: 'empleado@voltaerp.com',
        password: 'empleado123',
        rol: 'EMPLEADO',
        activo: true
      }
    ];

    for (const u of usuarios) {
      const existe = await Usuario.findOne({ where: { email: u.email } });
      if (!existe) {
        // Al usar Usuario.create se dispara el hook beforeCreate que hashea la contraseña
        await Usuario.create(u);
        console.log(`Creado usuario [${u.rol}]: ${u.email}`);
      } else {
        console.log(`El usuario ${u.email} ya existía.`);
      }
    }

    console.log('¡Seeders ejecutados con éxito!');
    console.log('----------------------------------------------------');
    console.log('Credenciales de acceso para pruebas:');
    console.log('Admin:    admin@voltaerp.com    / admin123');
    console.log('Gestor:   gestor@voltaerp.com   / gestor123');
    console.log('Empleado: empleado@voltaerp.com / empleado123');
    console.log('----------------------------------------------------');

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar los seeders:', error);
    await db.close();
    process.exit(1);
  }
}

seed();
