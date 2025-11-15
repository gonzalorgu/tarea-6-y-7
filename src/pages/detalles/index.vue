<template>
  <div class="page-container">
    <!-- HEADER ORDENADO -->
    <div class="header">
      <h2>Detalle de Pasajeros</h2>
      <div class="header-actions">
        <button class="btn-nuevo" @click="abrirModal()">Nuevo Pasajero</button>
        <button class="volver-btn" @click="volverDashboard">Volver al Dashboard</button>
      </div>
    </div>

    <!-- BÚSQUEDA -->
    <div class="busqueda">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por nombre, apellido o documento..."
      />
    </div>

    <!-- TABLA -->
    <div class="tabla">
      <table>
        <thead>
          <tr>
            <th>Compra</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Documento</th>
            <th>Asiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pasajero in pasajerosFiltrados" :key="pasajero.id_detalle">
            <td>#{{ pasajero.id_compra }}</td>
            <td>{{ pasajero.nombre_pasajero }}</td>
            <td>{{ pasajero.apellido_pasajero }}</td>
            <td>{{ pasajero.documento_pasajero }}</td>
            <td>{{ pasajero.asiento }}</td>
            <td>
              <button class="btn-editar" @click="abrirModal(pasajero)" title="Editar">
                Editar
              </button>
              <button class="btn-eliminar" @click="eliminar(pasajero.id_detalle)" title="Eliminar">
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
        <h3>{{ form.id_detalle ? "Editar" : "Nuevo" }} Pasajero</h3>

        <div class="form-grid">
          <div class="form-group">
            <select v-model="form.id_compra">
              <option disabled value="">-- Selecciona compra --</option>
              <option v-for="c in compras" :key="c.id_compra" :value="c.id_compra">
                Compra #{{ c.id_compra }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <input v-model="form.nombre_pasajero" placeholder="Nombre *" />
          </div>
          <div class="form-group">
            <input v-model="form.apellido_pasajero" placeholder="Apellido *" />
          </div>
          <div class="form-group">
            <input v-model="form.documento_pasajero" placeholder="Documento *" />
          </div>
          <div class="form-group full-width">
            <input v-model="form.asiento" placeholder="Asiento (ej: 12A) *" />
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

const pasajeros = ref<any[]>([]);
const compras = ref<any[]>([]);
const busqueda = ref("");
const mostrarModal = ref(false);
const form = ref({
  id_detalle: null,
  id_compra: "",
  nombre_pasajero: "",
  apellido_pasajero: "",
  documento_pasajero: "",
  asiento: "",
});

const cargarDatos = async () => {
  const { data, error } = await supabase
    .from("detallepasajeros")
    .select("*")
    .order("id_detalle", { ascending: false });
  if (error) console.error(error);
  else pasajeros.value = data || [];

  const { data: comprasData } = await supabase.from("compras").select("id_compra");
  compras.value = comprasData || [];
};

const guardar = async () => {
  if (!form.value.id_compra || !form.value.nombre_pasajero || !form.value.asiento) {
    alert("Todos los campos son obligatorios");
    return;
  }

  let error;
  if (!form.value.id_detalle) {
    const { id_detalle, ...nuevoPasajero } = form.value;
    ({ error } = await supabase.from("detallepasajeros").insert([nuevoPasajero]));
  } else {
    ({ error } = await supabase
      .from("detallepasajeros")
      .update(form.value)
      .eq("id_detalle", form.value.id_detalle));
  }

  if (error) {
    console.error(error);
    alert("Error al guardar");
    return;
  }

  alert("Pasajero guardado");
  await cargarDatos();
  cerrarModal();
};

const eliminar = async (id: number) => {
  if (!confirm("¿Eliminar este pasajero?")) return;
  const { error } = await supabase.from("detallepasajeros").delete().eq("id_detalle", id);
  if (error) {
    console.error(error);
    alert("Error al eliminar");
  } else {
    alert("Pasajero eliminado");
    await cargarDatos();
  }
};

const abrirModal = (pasajero?: any) => {
  if (pasajero) {
    form.value = { ...pasajero };
  } else {
    form.value = {
      id_detalle: null,
      id_compra: "",
      nombre_pasajero: "",
      apellido_pasajero: "",
      documento_pasajero: "",
      asiento: "",
    };
  }
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

const pasajerosFiltrados = computed(() => {
  if (!busqueda.value.trim()) return pasajeros.value;
  const term = busqueda.value.toLowerCase();
  return pasajeros.value.filter(
    (p) =>
      p.nombre_pasajero.toLowerCase().includes(term) ||
      p.apellido_pasajero.toLowerCase().includes(term) ||
      p.documento_pasajero.toLowerCase().includes(term)
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

/* BOTONES DE ACCIÓN */
.btn-editar,
.btn-eliminar {
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-right: 0.4rem;
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

.full-width {
  grid-column: span 2;
}

.form-group select,
.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 0.95rem;
  background: #f9fafb;
  transition: all 0.2s;
}

.form-group select:focus,
.form-group input:focus {
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