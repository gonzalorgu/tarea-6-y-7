import { fakerEN_US as faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
);

// ========== SEEDERS PARA VUELOS ==========

const seedClientes = async (num) => {
  const log = (tablaName, error) => {
    console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
    process.exit(1);
  };

  const mensaje = (stepMessage) => {
    console.log(stepMessage);
  };

  mensaje(`🌱 Preparando ${num} clientes...`);

  const tiposDocumento = ["DNI", "PPN", "RUC", "PASAPORTE"];
  const registros = [];

  for (let i = 0; i < num; i++) {
    const nombre = faker.person.firstName();
    const apellido = faker.person.lastName();
    const tipo = faker.helpers.arrayElement(tiposDocumento);

    registros.push({
      nombre: nombre,
      apellido: apellido,
      tipo_documento: tipo,
      numero_documento: faker.string.numeric(8),
      correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
      telefono: faker.phone.number('+51 9## ### ###')
    });
  }

  mensaje('📤 Enviando clientes a Supabase...');

  const { data, error } = await supabase
    .from('clientes')
    .insert(registros)
    .select('id_cliente');

  if (error) return log('clientes', error);

  mensaje(`✅ ${data.length} clientes insertados correctamente`);
  return data;
};

const seedVuelos = async (num) => {
  const log = (tablaName, error) => {
    console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
    process.exit(1);
  };

  const mensaje = (stepMessage) => {
    console.log(stepMessage);
  };

  mensaje(`🌱 Preparando ${num} vuelos...`);

  const aerolineas = ["LATAM", "AeroMéxico", "Avianca", "VIVA Air", "Sky"];
  const ciudades = ["Lima", "Bogotá", "Quito", "Buenos Aires", "Caracas", "Panamá"];
  const estados = ["Programado", "En vuelo", "Cancelado", "Finalizado"];
  const registros = [];

  for (let i = 0; i < num; i++) {
    const salida = faker.date.soon({ days: 30 });
    const llegada = new Date(salida.getTime() + faker.number.int({ min: 2, max: 12 }) * 3600000);
    const origen = faker.helpers.arrayElement(ciudades);
    let destino = faker.helpers.arrayElement(ciudades);
    
    while (destino === origen) {
      destino = faker.helpers.arrayElement(ciudades);
    }

    registros.push({
      codigo_vuelo: `${faker.airline.airline().iataCode}${faker.airline.flightNumber({ addLeadingZeros: true })}`,
      aerolinea: faker.helpers.arrayElement(aerolineas),
      origen: origen,
      destino: destino,
      fecha_salida: salida.toISOString(),
      fecha_llegada: llegada.toISOString(),
      precio: parseFloat(faker.commerce.price({ min: 100, max: 800, dec: 2 })),
      asientos_disponibles: faker.number.int({ min: 5, max: 150 }),
      estado: faker.helpers.arrayElement(estados)
    });
  }

  mensaje('📤 Enviando vuelos a Supabase...');

  const { data, error } = await supabase
    .from('vuelos')
    .insert(registros)
    .select('id_vuelo');

  if (error) return log('vuelos', error);

  mensaje(`✅ ${data.length} vuelos insertados correctamente`);
  return data;
};

const seedCompras = async (clientesData, vuelosData, num) => {
  const log = (tablaName, error) => {
    console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
    process.exit(1);
  };

  const mensaje = (stepMessage) => {
    console.log(stepMessage);
  };

  mensaje(`🌱 Preparando ${num} compras...`);

  const formasPago = ["Efectivo", "Tarjeta", "Transferencia"];
  const estadosCompra = ["Pagado", "Pendiente", "Cancelado"];
  const registros = [];

  for (let i = 0; i < num; i++) {
    const cantidadPasajeros = faker.number.int({ min: 1, max: 6 });
    const cliente = faker.helpers.arrayElement(clientesData);
    const vuelo = faker.helpers.arrayElement(vuelosData);
    const precioBase = faker.number.int({ min: 200, max: 800 });
    const total = precioBase * cantidadPasajeros;

    registros.push({
      id_cliente: cliente.id_cliente,
      id_vuelo: vuelo.id_vuelo,
      cantidad_pasajeros: cantidadPasajeros,
      forma_pago: faker.helpers.arrayElement(formasPago),
      total: total,
      estado_compra: faker.helpers.arrayElement(estadosCompra)
    });
  }

  mensaje('📤 Enviando compras a Supabase...');

  const { data, error } = await supabase
    .from('compras')
    .insert(registros)
    .select('id_compra');

  if (error) return log('compras', error);

  mensaje(`✅ ${data.length} compras insertadas correctamente`);
  return data;
};

const seedDetallePasajeros = async (comprasData) => {
  const log = (tablaName, error) => {
    console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
    process.exit(1);
  };

  const mensaje = (stepMessage) => {
    console.log(stepMessage);
  };

  mensaje(`🌱 Preparando detalles de pasajeros...`);

  const asientosDisponibles = [
    "1A", "1B", "1C", "1D", "1E", "1F",
    "2A", "2B", "2C", "2D", "2E", "2F",
    "3A", "3B", "3C", "3D", "3E", "3F",
    "4A", "4B", "4C", "4D", "4E", "4F",
    "5A", "5B", "5C", "5D", "5E", "5F",
    "6A", "6B", "6C", "6D", "6E", "6F",
    "7A", "7B", "7C", "7D", "7E", "7F",
    "8A", "8B", "8C", "8D", "8E", "8F",
    "9A", "9B", "9C", "9D", "9E", "9F",
    "10A", "10B", "10C", "10D", "10E", "10F"
  ];

  const registros = [];

  for (const compra of comprasData) {
    const cantidadPasajeros = faker.number.int({ min: 1, max: 4 });
    
    // Crear una copia de asientos disponibles y mezclarla
    const asientosBarajados = asientosDisponibles.slice().sort(() => Math.random() - 0.5);
    
    // Tomar los primeros N asientos únicos
    for (let i = 0; i < cantidadPasajeros && i < asientosBarajados.length; i++) {
      registros.push({
        id_compra: compra.id_compra,
        nombre_pasajero: faker.person.firstName(),
        apellido_pasajero: faker.person.lastName(),
        documento_pasajero: faker.string.numeric(8),
        asiento: asientosBarajados[i]
      });
    }
  }

  mensaje('📤 Enviando detalles de pasajeros a Supabase...');

  const { data, error } = await supabase
    .from('detallepasajeros')
    .insert(registros)
    .select('id_detalle');

  if (error) return log('detallepasajeros', error);

  mensaje(`✅ ${data.length} pasajeros insertados correctamente`);
  return data;
};

const seedSalidas = async (vuelosData) => {
  const log = (tablaName, error) => {
    console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
    process.exit(1);
  };

  const mensaje = (stepMessage) => {
    console.log(stepMessage);
  };

  mensaje(`🌱 Preparando salidas de vuelos...`);

  const estados = ["Embarque", "Despegó"];
  const puertas = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const registros = [];

  for (const vuelo of vuelosData) {
    registros.push({
      id_vuelo: vuelo.id_vuelo,
      fecha_hora_salida: faker.date.soon().toISOString(),
      puerta: faker.helpers.arrayElement(puertas),
      estado: faker.helpers.arrayElement(estados)
    });
  }

  mensaje('📤 Enviando salidas a Supabase...');

  const { data, error } = await supabase
    .from('salida')
    .insert(registros)
    .select('id_salida');

  if (error) return log('salida', error);

  mensaje(`✅ ${data.length} salidas insertadas correctamente`);
  return data;
};

const seedLlegadas = async (vuelosData) => {
  const log = (tablaName, error) => {
    console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
    process.exit(1);
  };

  const mensaje = (stepMessage) => {
    console.log(stepMessage);
  };

  mensaje(`🌱 Preparando llegadas de vuelos...`);

  const estados = ["Aterrizando", "Aterrizó"];
  const puertas = ["A1", "A2", "B1", "B2", "C1", "C2"];
  const registros = [];

  for (const vuelo of vuelosData) {
    registros.push({
      id_vuelo: vuelo.id_vuelo,
      fecha_hora_llegada: faker.date.soon().toISOString(),
      puerta: faker.helpers.arrayElement(puertas),
      estado: faker.helpers.arrayElement(estados)
    });
  }

  mensaje('📤 Enviando llegadas a Supabase...');

  const { data, error } = await supabase
    .from('llegada')
    .insert(registros)
    .select('id_llegada');

  if (error) return log('llegada', error);

  mensaje(`✅ ${data.length} llegadas insertadas correctamente`);
  return data;
};

// ========== EJECUCION PRINCIPAL ==========

const envioData = async (cantidad) => {
  console.log('🚀 Iniciando seeder de vuelos y clientes...');

  try {
    const clientesData = await seedClientes(cantidad);
    const vuelosData = await seedVuelos(cantidad);
    const comprasData = await seedCompras(clientesData, vuelosData, cantidad * 2);
    await seedDetallePasajeros(comprasData);
    await seedSalidas(vuelosData);
    await seedLlegadas(vuelosData);

    console.log('✅ Seeder completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error);
    process.exit(1);
  }
};

const cantidad = 50;
envioData(cantidad);