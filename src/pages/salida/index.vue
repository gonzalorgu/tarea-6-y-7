<template>
  <div class="page-container">
    <!-- HEADER ORDENADO -->
    <div class="header">
      <h2>Registro de Llegadas</h2>
      <div class="header-actions">
        <button class="btn-nuevo" @click="abrirModal()">Nueva Llegada</button>
        <button class="volver-btn" @click="volverDashboard">Volver al Dashboard</button>
      </div>
    </div>

    <!-- BÚSQUEDA -->
    <div class="busqueda">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por código de vuelo o puerta..."
      />
    </div>

    <!-- TABLA -->
    <div class="tabla">
      <table>
        <thead>
          <tr>
            <th>Vuelo</th>
            <th>Fecha/Hora llegada</th>
            <th>Puerta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in llegadasFiltradas" :key="item.id_llegada">
            <td><strong>{{ getCodigoVuelo(item.id_vuelo) }}</strong></td>
            <td>{{ formatFecha(item.fecha_hora_llegada) }}</td>
            <td>{{ item.puerta || "—" }}</td>
            <td>
              <span :class="getEstadoClass(item.estado)" class="estado-tag">
                {{ item.estado }}
              </span>
            </td>
            <td class="acciones">
              <button class="btn-editar" @click="abrirModal(item)" title="Editar">
                Editar
              </button>
              <button class="btn-eliminar" @click="eliminar(item.id_llegada)" title="Eliminar">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL ORDENADO EN 2 COLUMNAS -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h3>{{ form.id_llegada ? "Editar" : "Nueva" }} Llegada</h3>

        <div class="form-grid">
          <div class="form-group">
            <label>Vuelo</label>
            <select v-model="form.id_vuelo">
              <option disabled value="">-- Selecciona vuelo --</option>
              <option v-for="v in vuelos" :key="v.id_vuelo" :value="v.id_vuelo">
                {{ v.codigo_vuelo }} - {{ v.origen }} to {{ v.destino }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fecha y hora llegada</label>
            <input v-model="form.fecha_hora_llegada" type="datetime-local" />
          </div>

          <div class="form-group">
            <label>Puerta</label>
            <input v-model="form.puerta" placeholder="ej: A8" />
          </div>

          <div class="form-group">
            <label>Estado</label>
            <select v-model="form.estado">
              <option value="Aterrizando">Aterrizando</option>
              <option value="Aterrizó">Aterrizó</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="guardar">Guardar</button>
          <button @click="cerrarModal" class="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { supabase } from "@/lib/supabaseClient";
import router from "@/router";

const llegadas = ref<any[]>([]);
const vuelos = ref<any[]>([]);
const busqueda = ref("");
const mostrarModal = ref(false);

const form = ref({
  id_llegada: null,
  id_vuelo: "",
  fecha_hora_llegada: "",
  puerta: "",
  estado: "Aterrizando",
});

const cargarDatos = async () => {
  const { data } = await supabase.from("llegada").select("*").order("id_llegada", { ascending: false });
  llegadas.value = data || [];
  const { data: vuelosData } = await supabase.from("vuelos").select("*");
  vuelos.value = vuelosData || [];
};

const guardar = async () => {
  if (!form.value.id_vuelo || !form.value.fecha_hora_llegada) {
    alert("Vuelo y fecha/hora son obligatorios.");
    return;
  }
  let error;
  if (!form.value.id_llegada) {
    const { id_llegada, ...nuevo } = form.value;
    ({ error } = await supabase.from("llegada").insert([nuevo]));
  } else {
    ({ error } = await supabase.from("llegada").update(form.value).eq("id_llegada", form.value.id_llegada));
  }
  if (error) {
    alert("Error al guardar");
    return;
  }
  await cargarDatos();
  cerrarModal();
  alert("Llegada guardada");
};

const eliminar = async (id: number) => {
  if (!confirm("¿Eliminar esta llegada?")) return;
  const { error } = await supabase.from("llegada").delete().eq("id_llegada", id);
  if (error) alert("Error al eliminar");
  else {
    alert("Llegada eliminada");
    await cargarDatos();
  }
};

const abrirModal = (item?: any) => {
  if (item) {
    form.value = {
      ...item,
      fecha_hora_llegada: item.fecha_hora_llegada ? new Date(item.fecha_hora_llegada).toISOString().slice(0, 16) : "",
    };
  } else {
    form.value = {
      id_llegada: null,
      id_vuelo: "",
      fecha_hora_llegada: "",
      puerta: "",
      estado: "Aterrizando",
    };
  }
  mostrarModal.value = true;
};

const cerrarModal = () => { mostrarModal.value = false; };

const formatFecha = (f: string) =>
  f ? new Date(f).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "—";

const getCodigoVuelo = (id: any) =>
  vuelos.value.find((v: any) => v.id_vuelo === id)?.codigo_vuelo || id;

const getEstadoClass = (e: string) =>
  e === "Aterrizando" ? "estado-aterrizando" : e === "Aterrizó" ? "estado-aterrizo" : "";

const llegadasFiltradas = computed(() => {
  if (!busqueda.value.trim()) return llegadas.value;
  const t = busqueda.value.toLowerCase();
  return llegadas.value.filter(
    (l) =>
      getCodigoVuelo(l.id_vuelo).toLowerCase().includes(t) ||
      (l.puerta || "").toLowerCase().includes(t)
  );
});

const volverDashboard = () => { router.push("/dashboard"); };

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

.estado-aterrizando {
  background: #fef3c7;
  color: #d97706;
}

.estado-aterrizo {
  background: #d1fae5;
  color: #065f46;
}

/* BOTONES DE ACCIÓN */
.acciones {
  display: flex;
  gap: 0.5rem;
}

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
  max-width: 540px;
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

.modal-actions .cancelar {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.modal-actions .cancelar:hover {
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
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
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