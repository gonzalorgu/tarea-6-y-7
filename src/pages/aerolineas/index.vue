<template>
  <div class="page-container">
    <!-- HEADER ORDENADO -->
    <div class="header">
      <h2>Gestión de Vuelos</h2>
      <div class="header-actions">
        <button class="btn-nuevo" @click="abrirModal()">Nuevo Vuelo</button>
        <button class="volver-btn" @click="volverDashboard">Volver al Dashboard</button>
      </div>
    </div>

    <!-- BÚSQUEDA -->
    <div class="busqueda">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por código, aerolínea, origen o destino..."
      />
    </div>

    <!-- TABLA -->
    <div class="tabla">
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Aerolínea</th>
            <th>Ruta</th>
            <th>Salida</th>
            <th>Llegada</th>
            <th>Precio</th>
            <th>Asientos</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vuelo in vuelosFiltrados" :key="vuelo.id_vuelo">
            <td><strong>{{ vuelo.codigo_vuelo }}</strong></td>
            <td>{{ vuelo.aerolinea }}</td>
            <td>{{ vuelo.origen }} → {{ vuelo.destino }}</td>
            <td>{{ formatFecha(vuelo.fecha_salida) }}</td>
            <td>{{ formatFecha(vuelo.fecha_llegada) }}</td>
            <td><strong>${{ Number(vuelo.precio).toFixed(2) }}</strong></td>
            <td>{{ vuelo.asientos_disponibles }}</td>
            <td>
              <span :class="getEstadoClass(vuelo.estado)" class="estado-tag">
                {{ vuelo.estado }}
              </span>
            </td>
            <td class="acciones">
              <button class="btn-ver" @click="verDetalle(vuelo)" title="Ver detalle">
                Ver
              </button>
              <button class="btn-editar" @click="abrirModal(vuelo)" title="Editar">
                Editar
              </button>
              <button class="btn-eliminar" @click="eliminar(vuelo.id_vuelo)" title="Eliminar">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL CREAR/EDITAR (2 COLUMNAS) -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h3>{{ form.id_vuelo ? "Editar" : "Nuevo" }} Vuelo</h3>

        <div class="form-grid">
          <div class="form-group">
            <input v-model="form.codigo_vuelo" placeholder="Código (ej: LA453) *" />
          </div>
          <div class="form-group">
            <input v-model="form.aerolinea" placeholder="Aerolínea *" />
          </div>
          <div class="form-group">
            <input v-model="form.origen" placeholder="Origen *" />
          </div>
          <div class="form-group">
            <input v-model="form.destino" placeholder="Destino *" />
          </div>
          <div class="form-group full-width">
            <label>Salida</label>
            <input v-model="form.fecha_salida" type="datetime-local" />
          </div>
          <div class="form-group full-width">
            <label>Llegada</label>
            <input v-model="form.fecha_llegada" type="datetime-local" />
          </div>
          <div class="form-group">
            <input v-model.number="form.precio" type="number" step="0.01" placeholder="Precio *" />
          </div>
          <div class="form-group">
            <input v-model.number="form.asientos_disponibles" type="number" placeholder="Asientos *" />
          </div>
          <div class="form-group full-width">
            <select v-model="form.estado">
              <option value="Programado">Programado</option>
              <option value="En vuelo">En vuelo</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="guardar">Guardar</button>
          <button @click="cerrarModal" class="cancelar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLE (GRID LEGIBLE) -->
    <div v-if="mostrarDetalle" class="modal">
      <div class="modal-content detalle-modal">
        <h3>Detalle del Vuelo</h3>
        <div class="detalle-grid">
          <div><strong>Código:</strong> {{ detalleVuelo.codigo_vuelo }}</div>
          <div><strong>Aerolínea:</strong> {{ detalleVuelo.aerolinea }}</div>
          <div><strong>Origen:</strong> {{ detalleVuelo.origen }}</div>
          <div><strong>Destino:</strong> {{ detalleVuelo.destino }}</div>
          <div><strong>Salida:</strong> {{ formatFecha(detalleVuelo.fecha_salida) }}</div>
          <div><strong>Llegada:</strong> {{ formatFecha(detalleVuelo.fecha_llegada) }}</div>
          <div><strong>Precio:</strong> ${{ Number(detalleVuelo.precio).toFixed(2) }}</div>
          <div><strong>Asientos:</strong> {{ detalleVuelo.asientos_disponibles }}</div>
          <div><strong>Estado:</strong>
            <span :class="getEstadoClass(detalleVuelo.estado)" class="estado-tag">
              {{ detalleVuelo.estado }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="cerrarDetalle">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import router from "@/router";

const vuelos = ref<any[]>([]);
const busqueda = ref("");
const mostrarModal = ref(false);
const mostrarDetalle = ref(false);
const detalleVuelo = ref<any>({});
const form = ref({
  id_vuelo: null,
  codigo_vuelo: "",
  aerolinea: "",
  origen: "",
  destino: "",
  fecha_salida: "",
  fecha_llegada: "",
  precio: 0,
  asientos_disponibles: 0,
  estado: "Programado",
});

const cargarDatos = async () => {
  const { data, error } = await supabase
    .from("vuelos")
    .select("*")
    .order("id_vuelo", { ascending: false });
  if (error) console.error(error);
  else vuelos.value = data || [];
};

const guardar = async () => {
  if (!form.value.codigo_vuelo || !form.value.aerolinea || !form.value.origen || !form.value.destino) {
    alert("Código, aerolínea, origen y destino son obligatorios");
    return;
  }

  let error;
  if (!form.value.id_vuelo) {
    const { id_vuelo, ...nuevoVuelo } = form.value;
    ({ error } = await supabase.from("vuelos").insert([nuevoVuelo]));
  } else {
    ({ error } = await supabase
      .from("vuelos")
      .update(form.value)
      .eq("id_vuelo", form.value.id_vuelo));
  }

  if (error) {
    console.error(error);
    alert("Error al guardar");
    return;
  }

  alert("Vuelo guardado");
  await cargarDatos();
  cerrarModal();
};

const eliminar = async (id: number) => {
  if (!confirm("¿Eliminar este vuelo?")) return;
  const { error } = await supabase.from("vuelos").delete().eq("id_vuelo", id);
  if (error) {
    console.error(error);
    alert("Error al eliminar");
  } else {
    alert("Vuelo eliminado");
    await cargarDatos();
  }
};

const abrirModal = (vuelo?: any) => {
  if (vuelo) {
    form.value = {
      ...vuelo,
      fecha_salida: vuelo.fecha_salida ? new Date(vuelo.fecha_salida).toISOString().slice(0, 16) : "",
      fecha_llegada: vuelo.fecha_llegada ? new Date(vuelo.fecha_llegada).toISOString().slice(0, 16) : "",
    };
  } else {
    form.value = {
      id_vuelo: null,
      codigo_vuelo: "",
      aerolinea: "",
      origen: "",
      destino: "",
      fecha_salida: "",
      fecha_llegada: "",
      precio: 0,
      asientos_disponibles: 0,
      estado: "Programado",
    };
  }
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

const verDetalle = (vuelo: any) => {
  detalleVuelo.value = vuelo;
  mostrarDetalle.value = true;
};

const cerrarDetalle = () => {
  mostrarDetalle.value = false;
};

const formatFecha = (fecha: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const getEstadoClass = (estado: string) => {
  const map: any = {
    Programado: "estado-programado",
    "En vuelo": "estado-vuelo",
    Cancelado: "estado-cancelado",
    Finalizado: "estado-finalizado",
  };
  return map[estado] || "";
};

const vuelosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return vuelos.value;
  const term = busqueda.value.toLowerCase();
  return vuelos.value.filter(
    (v) =>
      v.codigo_vuelo.toLowerCase().includes(term) ||
      v.aerolinea.toLowerCase().includes(term) ||
      v.origen.toLowerCase().includes(term) ||
      v.destino.toLowerCase().includes(term)
  );
});

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
  background: #f9fafb;
  border-radius: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0f172a;
}

/* HEADER ORDENADO */
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

/* BOTONES PRINCIPALES */
.btn-nuevo,
.volver-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.btn-nuevo {
  background: #2563eb;
  color: white;
}

.btn-nuevo:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
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

/* BÚSQUEDA */
.busqueda {
  margin-bottom: 1.5rem;
}

.busqueda input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.2s;
}

.busqueda input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

/* TABLA */
.tabla {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

thead {
  background: #eff6ff;
  font-weight: 600;
  color: #0f172a;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #0f172a;
}

tbody tr:hover {
  background: #f0f9ff;
}

/* ESTADOS */
.estado-tag {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.estado-programado { background: #dbeafe; color: #1e40af; }
.estado-vuelo { background: #fef3c7; color: #d97706; }
.estado-cancelado { background: #fee2e2; color: #991b1b; }
.estado-finalizado { background: #d1fae5; color: #065f46; }

/* BOTONES DE ACCIÓN */
.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-ver,
.btn-editar,
.btn-eliminar {
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ver {
  background: #64748b;
  color: white;
}

.btn-ver:hover {
  background: #475569;
  transform: scale(1.05);
}

.btn-editar {
  background: #10b981;
  color: white;
}

.btn-editar:hover {
  background: #059669;
  transform: scale(1.05);
}

.btn-eliminar {
  background: #ef4444;
  color: white;
}

.btn-eliminar:hover {
  background: #dc2626;
  transform: scale(1.05);
}

/* MODAL ORDENADO EN 2 COLUMNAS */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
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
  max-width: 620px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.3s ease-out;
}

.modal-content h3 {
  margin: 0 0 1.5rem;
  font-size: 1.35rem;
  font-weight: 600;
  color: #0f172a;
}

/* GRID DE 2 COLUMNAS */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.full-width {
  grid-column: span 2;
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

/* MODAL DETALLE */
.detalle-modal {
  max-width: 500px;
}

.detalle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.detalle-grid > div {
  display: flex;
  flex-direction: column;
}

.detalle-grid strong {
  color: #374151;
  margin-bottom: 0.25rem;
}

/* BOTONES DEL MODAL */
.modal-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.modal-actions button:first-child {
  background: #2563eb;
  color: white;
}

.modal-actions button:first-child:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.modal-actions .cancelar,
.modal-actions button:last-child {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.modal-actions .cancelar:hover,
.modal-actions button:last-child:hover {
  background: #e2e8f0;
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
  .form-grid,
  .detalle-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .modal-actions {
    grid-column: span 1;
  }
  .header {
    flex-direction: column;
    align-items: stretch;
  }
  .header-actions {
    flex-direction: column;
  }
}
</style>