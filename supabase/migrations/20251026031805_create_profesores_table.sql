CREATE TABLE clientes (
  id_cliente SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  tipo_documento VARCHAR(20) NOT NULL,
  numero_documento VARCHAR(20) UNIQUE NOT NULL,
  correo VARCHAR(100),
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vuelos (
  id_vuelo SERIAL PRIMARY KEY,
  codigo_vuelo VARCHAR(10) UNIQUE NOT NULL,
  aerolinea VARCHAR(100) NOT NULL,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  fecha_salida TIMESTAMP NOT NULL,
  fecha_llegada TIMESTAMP NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  asientos_disponibles INT NOT NULL CHECK (asientos_disponibles >= 0),
  estado VARCHAR(20) DEFAULT 'Programado' CHECK (estado IN ('Programado','En vuelo','Cancelado','Finalizado'))
);

CREATE TABLE compras (
  id_compra SERIAL PRIMARY KEY,
  id_cliente INT NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  id_vuelo INT NOT NULL REFERENCES vuelos(id_vuelo) ON DELETE CASCADE,
  fecha_compra TIMESTAMP DEFAULT NOW(),
  cantidad_pasajeros INT NOT NULL CHECK (cantidad_pasajeros > 0),
  forma_pago VARCHAR(20) DEFAULT 'Tarjeta' CHECK (forma_pago IN ('Efectivo','Tarjeta','Transferencia')),
  total DECIMAL(10,2) NOT NULL,
  estado_compra VARCHAR(20) DEFAULT 'Pagado' CHECK (estado_compra IN ('Pagado','Pendiente','Cancelado'))
);

CREATE TABLE detallepasajeros (
  id_detalle SERIAL PRIMARY KEY,
  id_compra INT NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
  nombre_pasajero VARCHAR(100) NOT NULL,
  apellido_pasajero VARCHAR(100) NOT NULL,
  documento_pasajero VARCHAR(20) NOT NULL,
  asiento VARCHAR(5) NOT NULL,
  UNIQUE(id_compra, asiento)
);

CREATE TABLE salida (
  id_salida SERIAL PRIMARY KEY,
  id_vuelo INT NOT NULL REFERENCES vuelos(id_vuelo) ON DELETE CASCADE,
  fecha_hora_salida TIMESTAMP NOT NULL,
  puerta VARCHAR(10),
  estado VARCHAR(20) DEFAULT 'Embarque' CHECK (estado IN ('Embarque','Despegó'))
);

CREATE TABLE llegada (
  id_llegada SERIAL PRIMARY KEY,
  id_vuelo INT NOT NULL REFERENCES vuelos(id_vuelo) ON DELETE CASCADE,
  fecha_hora_llegada TIMESTAMP NOT NULL,
  puerta VARCHAR(10),
  estado VARCHAR(20) DEFAULT 'Aterrizando' CHECK (estado IN ('Aterrizando','Aterrizó'))
);

CREATE INDEX idx_compras_cliente ON compras(id_cliente);
CREATE INDEX idx_compras_vuelo ON compras(id_vuelo);
CREATE INDEX idx_detalle_compra ON detallepasajeros(id_compra);
CREATE INDEX idx_salida_vuelo ON salida(id_vuelo);
CREATE INDEX idx_llegada_vuelo ON llegada(id_vuelo);