<template>
  <div class="page-container">
    <!-- HEADER ORDENADO -->
    <div class="header">
      <h2>Registrar Compra</h2>
      <div class="header-actions">
        <button class="volver-btn" @click="volverDashboard" title="Ir al Dashboard">
          Dashboard
        </button>
      </div>
    </div>

    <!-- FORMULARIO DE COMPRA (2 COLUMNAS) -->
    <form class="venta-form" @submit.prevent="agregarCompra">
      <div class="form-grid">
        <div class="form-group">
          <label>Cliente</label>
          <select v-model="nuevaCompra.id_cliente" required>
            <option disabled value="">-- Selecciona cliente --</option>
            <option
              v-for="cli in clientes"
              :key="cli.id_cliente"
              :value="cli.id_cliente"
            >
              {{ cli.nombre }} {{ cli.apellido }}
            </option>
 permeability          </select>
        </div>

        <div class="form-group">
          <label>Vuelo</label>
          <select v-model="nuevaCompra.id_vuelo" required>
            <option disabled value="">-- Selecciona vuelo --</option>
            <option v-for="v in vuelos" :key="v.id_vuelo" :value="v.id_vuelo">
              {{ v.codigo_vuelo }} — {{ v.origen }} to {{ v.destino }} — ${{ Number(v.precio).toFixed(2) }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Cantidad de pasajeros</label>
          <input
            type="number"
            v-model.number="nuevaCompra.cantidad_pasajeros"
            min="1"
            required
            placeholder="1"
          />
        </div>

        <div class="form-group">
          <label>Forma de pago</label>
          <select v-model="nuevaCompra.forma_pago" required>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="registrar-btn">
          Registrar Compra
        </button>
      </div>
    </form>

    <!-- BÚSQUEDA -->
    <div class="busqueda">
      <div class="input-wrapper">
        <input
          type="text"
          v-model="terminoBusqueda"
          placeholder="Buscar por cliente o vuelo..."
          @keyup.enter="buscarCompras"
        />
      </div>
      <button @click="buscarCompras" class="btn-buscar" title="Buscar">
        Buscar
      </button>
      <button
        v-if="busquedaActiva"
        @click="limpiarBusqueda"
        class="limpiar-btn"
        title="Limpiar búsqueda"
      >
        Limpiar
      </button>
    </div>

    <!-- TABLA DE COMPRAS -->
    <div class="tabla-ventas">
      <table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vuelo</th>
            <th>Pasajeros</th>
            <th>Precio Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="compra in comprasFiltradas" :key="compra.id_compra">
            <td>
              <strong>{{ compra.cliente?.nombre }} {{ compra.cliente?.apellido }}</strong>
            </td>
            <td>{{ compra.vuelo?.codigo_vuelo }}</td>
            <td class="center">{{ compra.cantidad_pasajeros }}</td>
            <td class="price">${{ Number(compra.vuelo?.precio ?? 0).toFixed(2) }}</td>
            <td class="price total-row">${{ Number(compra.total).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-recaudado">
        <strong>Total recaudado:</strong>
        <span class="total-amount">${{ totalRecaudado.toFixed(2) }}</span>
      </div>
    </div>

    <!-- MODAL NUEVO CLIENTE (2 COLUMNAS) -->
    <Teleport to="body">
      <div v-if="mostrarModalCliente" class="modal-overlay" @click="cerrarModalCliente">
        <div class="modal-content" @click.stop>
          <h3>Nuevo Cliente</h3>

          <div class="form-grid">
            <div class="form-group">
              <input v-model="nuevoCliente.nombre" placeholder="Nombre *" />
            </div>
            <div class="form-group">
              <input v-model="nuevoCliente.apellido" placeholder="Apellido" />
            </div>
            <div class="form-group full-width">
              <input v-model nuevoCliente.numero_documento" placeholder="Documento *" />
            </div>
          </div>

          <div class="modal-actions">
            <button @click="agregarCliente" class="btn-guardar">
              Guardar
            </button>
            <button @click="cerrarModalCliente" class="btn-cancelar">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- MODAL BOLETA -->
    <Teleport to="body">
      <div v-if="mostrarBoleta" class="modal-overlay" @click="mostrarBoleta = false">
        <div class="modal-content boleta-modal" @click.stop>
          <h3>Boleta de Pasaje</h3>

          <div class="boleta">
            <div class="boleta-item">
              <strong>Cliente:</strong> {{ boletaData.cliente }}
            </div>
            <div class="boleta-item">
              <strong>Vuelo:</strong> {{ boletaData.vuelo }}
            </div>
            <div class="boleta-item">
              <strong>Pasajeros:</strong> {{ boletaData.pasajeros }}
            </div>
            <div class="boleta-item">
              <strong>Forma de pago:</strong> {{ boletaData.forma_pago }}
            </div>
            <div class="boleta-item total">
              <strong>Total:</strong> ${{ boletaData.total }}
            </div>
            <div class="boleta-item">
              <strong>Fecha:</strong> {{ boletaData.fecha }}
            </div>
            <div class="codigo-boleta">
              Código: #{{ boletaData.codigo }}
            </div>
          </div>

          <div class="modal-actions">
            <button @click="descargarPDF" class="btn-descargar">
              Descargar PDF
            </button>
            <button @click="mostrarBoleta = false" class="btn-cancelar">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabaseClient";
import { jsPDF } from "jspdf";

const router = useRouter();

// Datos
const compras = ref<any[]>([]);
const vuelos = ref<any[]>([]);
const clientes = ref<any[]>([]);

const nuevaCompra = ref({
  id_cliente: "",
  id_vuelo: "",
  cantidad_pasajeros: 1,
  forma_pago: "Tarjeta",
});

// Modal Cliente
const mostrarModalCliente = ref(false);
const nuevoCliente = ref({
  nombre: "",
  apellido: "",
  numero_documento: "",
});

// Búsqueda
const terminoBusqueda = ref("");
const busquedaActiva = ref(false);

// Boleta
const mostrarBoleta = ref(false);
const boletaData = ref<any>({});

const cargarDatos = async () => {
  const { data: vuelosData } = await supabase
    .from("vuelos")
    .select("id_vuelo, codigo_vuelo, origen, destino, precio");
  vuelos.value = vuelosData || [];

  const { data: clientesData } = await supabase
    .from("clientes")
    .select("id_cliente, nombre, apellido");
  clientes.value = clientesData || [];

  const { data: comprasData } = await supabase
    .from("compras")
    .select(`
      id_compra,
      cantidad_pasajeros,
      total,
      forma_pago,
      fecha_compra,
      cliente:id_cliente ( nombre, apellido ),
      vuelo:id_vuelo ( codigo_vuelo, precio, origen, destino )
    `)
    .order("id_compra", { ascending: false });

  compras.value = comprasData || [];
};

const generarCodigoBoleta = () => {
  return "TKT" + Date.now().toString().slice(-6);
};

const generarBoletaPDF = () => {
  const doc = new jsPDF();
  const { cliente, vuelo, pasajeros, forma_pago, total, fecha, codigo } = boletaData.value;

  doc.setFont("helvetica");
  doc.setFontSize(16);
  doc.text("BOLETA DE PASAJE", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Código: ${codigo}`, 20, 40);
  doc.text(`Cliente: ${cliente}`, 20, 50);
  doc.text(`Vuelo: ${vuelo}`, 20, 60);
  doc.text(`Pasajeros: ${pasajeros}`, 20, 70);
  doc.text(`Forma de pago: ${forma_pago}`, 20, 80);
  doc.text(`Total: $${total}`, 20, 90);
  doc.text(`Fecha: ${fecha}`, 20, 100);

  doc.setLineWidth(0.5);
  doc.line(20, 110, 190, 110);

  doc.setFontSize(10);
  doc.text("Gracias por su compra", 105, 125, { align: "center" });

  doc.save(`boleta_${codigo}.pdf`);
};

const descargarPDF = () => {
  generarBoletaPDF();
  mostrarBoleta.value = false;
};

const agregarCompra = async () => {
  if (!nuevaCompra.value.id_cliente || !nuevaCompra.value.id_vuelo) {
    alert("Selecciona cliente y vuelo");
    return;
  }

  const idClienteNumber = Number(nuevaCompra.value.id_cliente);
  const idVueloNumber = Number(nuevaCompra.value.id_vuelo);

  const vuelo = vuelos.value.find((v) => v.id_vuelo === idVueloNumber);
  const cliente = clientes.value.find((c) => c.id_cliente === idClienteNumber);

  if (!vuelo || !cliente) {
    alert("Datos inválidos");
    return;
  }

  const precio = Number(vuelo.precio);
  const total = precio * nuevaCompra.value.cantidad_pasajeros;

  const { data, error } = await supabase
    .from("compras")
    .insert([
      {
        id_cliente: idClienteNumber,
        id_vuelo: idVueloNumber,
        cantidad_pasajeros: nuevaCompra.value.cantidad_pasajeros,
        forma_pago: nuevaCompra.value.forma_pago,
        total,
        estado_compra: "Pagado",
        fecha_compra: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    alert("Error al registrar la compra");
    return;
  }

  const codigo = generarCodigoBoleta();
  boletaData.value = {
    cliente: `${cliente.nombre} ${cliente.apellido}`,
    vuelo: `${vuelo.codigo_vuelo} — ${vuelo.origen} to ${vuelo.destino}`,
    pasajeros: nuevaCompra.value.cantidad_pasajeros,
    forma_pago: nuevaCompra.value.forma_pago,
    total: total.toFixed(2),
    fecha: new Date().toLocaleString(),
    codigo,
  };

  mostrarBoleta.value = true;
  await cargarDatos();

  nuevaCompra.value = {
    id_cliente: "",
    id_vuelo: "",
    cantidad_pasajeros: 1,
    forma_pago: "Tarjeta",
  };
};

const abrirModalCliente = () => {
  mostrarModalCliente.value = true;
};

const cerrarModalCliente = () => {
  mostrarModalCliente.value = false;
  nuevoCliente.value = { nombre: "", apellido: "", numero_documento: "" };
};

const agregarCliente = async () => {
  if (!nuevoCliente.value.nombre.trim() || !nuevoCliente.value.numero_documento.trim()) {
    alert("Nombre y documento son obligatorios");
    return;
  }

  const { error } = await supabase.from("clientes").insert([
    {
      nombre: nuevoCliente.value.nombre,
      apellido: nuevoCliente.value.apellido || "",
      tipo_documento: "DNI",
      numero_documento: nuevoCliente.value.numero_documento,
      correo: null,
      telefono: null,
    },
  ]);

  if (error) {
    alert("Error: " + (error.message.includes("duplicate") ? "El documento ya existe" : error.message));
    return;
  }

  alert("Cliente agregado");
  cerrarModalCliente();
  await cargarDatos();
};

const buscarCompras = () => {
  busquedaActiva.value = true;
};

const limpiarBusqueda = () => {
  terminoBusqueda.value = "";
  busquedaActiva.value = false;
};

const comprasFiltradas = computed(() => {
  if (!busquedaActiva.value || !terminoBusqueda.value.trim()) return compras.value;
  const term = terminoBusqueda.value.toLowerCase();
  return compras.value.filter(
    (c) =>
      `${c.cliente?.nombre} ${c.cliente?.apellido}`.toLowerCase().includes(term) ||
      c.vuelo?.codigo_vuelo?.toLowerCase().includes(term)
  );
});

const totalRecaudado = computed(() =>
  comprasFiltradas.value.reduce((acc, c) => acc + Number(c.total || 0), 0)
);

const volverDashboard = () => {
  router.push("/dashboard");
};

onMounted(cargarDatos);
</script>

<style scoped>
/* === ESTILOS MEJORADOS Y ORDENADOS === */

.page-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* BOTONES */
button {
  font-family: inherit;
  font-weight: 500;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  padding: 0.6rem 1.2rem;
}

.volver-btn {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.volver-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.btn-nuevo,
.btn-buscar,
.btn-guardar {
  background: #2563eb;
  color: white;
}

.btn-nuevo:hover,
.btn-buscar:hover,
.btn-guardar:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.registrar-btn {
  background: #16a34a;
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.registrar-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
}

.limpiar-btn,
.btn-cancelar {
  background: #e5e7eb;
  color: #1e293b;
}

.limpiar-btn:hover,
.btn-cancelar:hover {
  background: #d1d5db;
}

.btn-descargar {
  background: #0891b2;
  color: white;
}

.btn-descargar:hover {
  background: #0e7490;
}

/* FORMULARIO */
.venta-form {
  background: white;
  padding: 1.75rem;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f9fafb;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

/* BÚSQUEDA */
.busqueda {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.input-wrapper {
  flex: 1;
  min-width: 200px;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

/* TABLA */
.tabla-ventas {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead {
  background: #f1f5f9;
  font-weight: 600;
  color: #334155;
}

th,
td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr:hover {
  background: #f0f9ff;
}

.center {
  text-align: center;
}

.price {
  font-weight: 600;
  color: #16a34a;
}

.total-row {
  font-weight: 700;
  color: #15803d;
}

.total-recaudado {
  margin-top: 1rem;
  padding: 1rem;
  background: #f0fdf4;
  border-radius: 12px;
  font-size: 1.1rem;
  text-align: right;
  color: #15803d;
}

.total-amount {
  font-weight: 700;
  font-size: 1.3rem;
  margin-left: 0.5rem;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.25s ease-out;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

.modal-content h3 {
  margin: 0 0 1.5rem;
  font-size: 1.35rem;
  font-weight: 600;
  color: #1e293b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

/* MODAL CLIENTE */
.form-grid .full-width {
  grid-column: span 2;
}

/* BOLETA */
.boleta-modal {
  max-width: 420px;
}

.boleta {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 12px;
  margin: 1rem 0;
  font-size: 0.95rem;
  line-height: 1.7;
}

.boleta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.boleta-item.total {
  font-weight: 700;
  font-size: 1.1rem;
  color: #15803d;
  border-top: 1px dashed #cbd5e1;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
}

.codigo-boleta {
  text-align: center;
  font-weight: bold;
  color: #0891b2;
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* ANIMACIONES */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-actions {
    grid-column: span 1;
  }
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-actions {
    flex-direction: column;
  }
  .busqueda {
    flex-direction: column;
  }
  .input-wrapper {
    min-width: auto;
  }
}
</style>