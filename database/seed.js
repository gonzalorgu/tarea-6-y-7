import { fakerEN_US as faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SERVICE_ROLE_KEY
);

const logError = (tablaName, error) => {
  console.error(`❌ Ha ocurrido un error en la tabla '${tablaName}' con código ${error.code}: ${error.message}`);
  process.exit(1);
};

// =================== Clientes ===================
const seedClientes = async (num) => {
  console.log(`🌱 Preparando ${num} clientes...`);

  const tiposDocumento = ["DNI", "PPN", "RUC", "PASAPORTE"];
  const registros = [];

  for (let i = 0; i < num; i++) {
    const nombre = faker.person.firstName();
    const apellido = faker.person.lastName();
    const tipo = faker.helpers.arrayElement(tiposDocumento);

    registros.push({
      nombre,
      apellido,
      tipo_documento: tipo,
      numero_documento: faker.string.numeric(8),
      correo: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@email.com`,
      telefono: faker.phone.number('+51 9## ### ###')
    });
  }

  console.log('📤 Enviando clientes a Supabase...');
  const { data, error } = await supabase
    .from('clientes')
    .insert(registros)
    .select('id_cliente');

  if (error) logError('clientes', error);
  console.log(`✅ ${data.length} clientes insertados`);
  return data;
};

// =================== Vuelos ===================
const seedVuelos = async (num) => {
  console.log(`🌱 Preparando ${num} vuelos...`);

  const aerolineas = ["LATAM", "AeroMéxico", "Avianca", "VIVA Air", "Sky"];
  const ciudades = ["Lima", "Bogotá", "Quito", "Buenos Aires", "Caracas", "Panamá"];
  const estados = ["Programado", "En vuelo", "Cancelado", "Finalizado"];

  const registros = [];
  const codigosExistentes = new Set();

  for (let i = 0; i < num; i++) {
    const salida = faker.date.soon({ days: 30 });
    const llegada = new Date(salida.getTime() + faker.number.int({ min: 2, max: 12 }) * 3600000);
    const origen = faker.helpers.arrayElement(ciudades);
    let destino = faker.helpers.arrayElement(ciudades);
    while (destino === origen) destino = faker.helpers.arrayElement(ciudades);

    // ✅ Generar código de vuelo seguro
    let codigo;
    do {
      codigo = `${faker.string.alpha({ length: 2, casing: 'upper' })}${faker.number.int({ min: 100, max: 999 })}`;
    } while (codigosExistentes.has(codigo));
    codigosExistentes.add(codigo);

    registros.push({
      codigo_vuelo: codigo,
      aerolinea: faker.helpers.arrayElement(aerolineas),
      origen,
      destino,
      fecha_salida: salida.toISOString(),
      fecha_llegada: llegada.toISOString(),
      precio: parseFloat(faker.commerce.price({ min: 100, max: 800, dec: 2 })),
      asientos_disponibles: faker.number.int({ min: 5, max: 150 }),
      estado: faker.helpers.arrayElement(estados)
    });
  }

  console.log('📤 Enviando vuelos a Supabase...');
  const { data, error } = await supabase
    .from('vuelos')
    .insert(registros)
    .select('id_vuelo, fecha_salida, fecha_llegada');

  if (error) logError('vuelos', error);
  console.log(`✅ ${data.length} vuelos insertados`);
  return data;
};

// =================== Compras ===================
const seedCompras = async (clientesData, vuelosData, num) => {
  console.log(`🌱 Preparando ${num} compras...`);

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
      total,
      estado_compra: faker.helpers.arrayElement(estadosCompra)
    });
  }

  console.log('📤 Enviando compras a Supabase...');
  const { data, error } = await supabase
    .from('compras')
    .insert(registros)
    .select('id_compra, cantidad_pasajeros, id_vuelo');

  if (error) logError('compras', error);
  console.log(`✅ ${data.length} compras insertadas`);
  return data;
};

// =================== Detalle Pasajeros ===================
const seedDetallePasajeros = async (comprasData) => {
  console.log(`🌱 Preparando detalles de pasajeros...`);

  const asientosDisponibles = [
    "1A","1B","1C","1D","1E","1F",
    "2A","2B","2C","2D","2E","2F",
    "3A","3B","3C","3D","3E","3F",
    "4A","4B","4C","4D","4E","4F",
    "5A","5B","5C","5D","5E","5F",
    "6A","6B","6C","6D","6E","6F",
    "7A","7B","7C","7D","7E","7F",
    "8A","8B","8C","8D","8E","8F",
    "9A","9B","9C","9D","9E","9F",
    "10A","10B","10C","10D","10E","10F"
  ];

  const registros = [];
  const asientosPorVuelo = {};

  for (const compra of comprasData) {
    if (!asientosPorVuelo[compra.id_vuelo]) {
      asientosPorVuelo[compra.id_vuelo] = [...asientosDisponibles];
    }

    const asientosDisponiblesVuelo = asientosPorVuelo[compra.id_vuelo];

    for (let i = 0; i < compra.cantidad_pasajeros && asientosDisponiblesVuelo.length > 0; i++) {
      const asientoIndex = faker.number.int({ min: 0, max: asientosDisponiblesVuelo.length - 1 });
      const asiento = asientosDisponiblesVuelo.splice(asientoIndex, 1)[0];

      registros.push({
        id_compra: compra.id_compra,
        nombre_pasajero: faker.person.firstName(),
        apellido_pasajero: faker.person.lastName(),
        documento_pasajero: faker.string.numeric(8),
        asiento
      });
    }
  }

  console.log('📤 Enviando detalles de pasajeros a Supabase...');
  const { data, error } = await supabase
    .from('detallepasajeros')
    .insert(registros)
    .select('id_detalle');

  if (error) logError('detallepasajeros', error);
  console.log(`✅ ${data.length} pasajeros insertados`);
  return data;
};

// =================== Salidas ===================
const seedSalidas = async (vuelosData) => {
  console.log(`🌱 Preparando salidas de vuelos...`);

  const estados = ["Embarque", "Despegó"];
  const puertas = ["A1","A2","B1","B2","C1","C2"];
  const registros = vuelosData.map(vuelo => ({
    id_vuelo: vuelo.id_vuelo,
    fecha_hora_salida: vuelo.fecha_salida,
    puerta: faker.helpers.arrayElement(puertas),
    estado: faker.helpers.arrayElement(estados)
  }));

  console.log('📤 Enviando salidas a Supabase...');
  const { data, error } = await supabase
    .from('salida')
    .insert(registros)
    .select('id_salida');

  if (error) logError('salida', error);
  console.log(`✅ ${data.length} salidas insertadas`);
  return data;
};

// =================== Llegadas ===================
const seedLlegadas = async (vuelosData) => {
  console.log(`🌱 Preparando llegadas de vuelos...`);

  const estados = ["Aterrizando", "Aterrizó"];
  const puertas = ["A1","A2","B1","B2","C1","C2"];
  const registros = vuelosData.map(vuelo => ({
    id_vuelo: vuelo.id_vuelo,
    fecha_hora_llegada: vuelo.fecha_llegada,
    puerta: faker.helpers.arrayElement(puertas),
    estado: faker.helpers.arrayElement(estados)
  }));

  console.log('📤 Enviando llegadas a Supabase...');
  const { data, error } = await supabase
    .from('llegada')
    .insert(registros)
    .select('id_llegada');

  if (error) logError('llegada', error);
  console.log(`✅ ${data.length} llegadas insertadas`);
  return data;
};

// =================== EJECUCION PRINCIPAL ===================
const envioData = async (cantidad) => {
  console.log('🚀 Iniciando seeder...');
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
