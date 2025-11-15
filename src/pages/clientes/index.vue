<template>
  <div class="page-container">
    <!-- HEADER ORDENADO -->
    <div class="header">
      <h2>Gestión de Clientes</h2>
      <div class="header-actions">
        <button class="btn-nuevo" @click="abrirModal()">Nuevo Cliente</button>
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
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Documento</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cliente in clientesFiltrados" :key="cliente.id_cliente">
            <td>{{ cliente.nombre }}</td>
            <td>{{ cliente.apellido }}</td>
            <td>{{ cliente.tipo_documento }} - {{ cliente.numero_documento }}</td>
            <td>{{ cliente.correo || "—" }}</td>
            <td>{{ cliente.telefono || "—" }}</td>
            <td>
              <button class="btn-editar" @click="abrirModal(cliente)">Editar</button>
              <button class="btn-eliminar" @click="eliminar(cliente.id_cliente)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- MODAL ORDENADO (2 columnas) -->
    <div v-if="mostrarModal" class="modal">
      <div class="modal-content">
        <h3>{{ form.id_cliente ? "Editar" : "Nuevo" }} Cliente</h3>

        <div class="form-grid">
          <div class="form-group">
            <input v-model="form.nombre" placeholder="Nombre *" />
          </div>
          <div class="form-group">
            <input v-model="form.apellido" placeholder="Apellido *" />
          </div>
          <div class="form-group">
            <select v-model="form.tipo_documento">
              <option value="DNI">DNI</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="CE">CE</option>
            </select>
          </div>
          <div class="form-group">
            <input v-model="form.numero_documento" placeholder="Número de documento *" />
          </div>
          <div class="form-group">
            <input v-model="form.correo" type="email" placeholder="Correo" />
          </div>
          <div class="form-group">
            <input v-model="form.telefono" placeholder="Teléfono" />
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

const clientes = ref<any[]>([]);
const busqueda = ref("");
const mostrarModal = ref(false);
const form = ref({
  id_cliente: null,
  nombre: "",
  apellido: "",
  tipo_documento: "DNI",
  numero_documento: "",
  correo: "",
  telefono: "",
});

const cargarDatos = async () => {
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("id_cliente", { ascending: false });
  if (error) console.error(error);
  else clientes.value = data || [];
};

const guardar = async () => {
  if (!form.value.nombre || !form.value.apellido || !form.value.numero_documento) {
    alert("Nombre, apellido y documento son obligatorios");
    return;
  }

  let error;
  if (!form.value.id_cliente) {
    const { id_cliente, ...nuevoCliente } = form.value;
    ({ error } = await supabase.from("clientes").insert([nuevoCliente]));
  } else {
    ({ error } = await supabase
      .from("clientes")
      .update(form.value)
      .eq("id_cliente", form.value.id_cliente));
  }

  if (error) {
    console.error(error);
    alert("Error al guardar");
    return;
  }

  alert("Cliente guardado");
  await cargarDatos();
  cerrarModal();
};

const eliminar = async (id: number) => {
  if (!confirm("¿Eliminar este cliente?")) return;
  const { error } = await supabase.from("clientes").delete().eq("id_cliente", id);
  if (error) {
    console.error(error);
    alert("Error al eliminar");
  } else {
    alert("Cliente eliminado");
    await cargarDatos();
  }
};

const abrirModal = (cliente?: any) => {
  if (cliente) {
    form.value = { ...cliente };
  } else {
    form.value = {
      id_cliente: null,
      nombre: "",
      apellido: "",
      tipo_documento: "DNI",
      numero_documento: "",
      correo: "",
      telefono: "",
    };
  }
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
};

const clientesFiltrados = computed(() => {
  if (!busqueda.value.trim()) return clientes.value;
  const term = busqueda.value.toLowerCase();
  return clientes.value.filter(
    (c) =>
      c.nombre.toLowerCase().includes(term) ||
      c.apellido.toLowerCase().includes(term) ||
      c.numero_documento.toLowerCase().includes(term)
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
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
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

/* BOTONES */
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
  background: #3b82f6;
  color: white;
}

.btn-nuevo:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.volver-btn {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
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
  background: #f9fafb;
  transition: all 0.2s;
}

.busqueda input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* TABLA */
.tabla {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
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

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

tbody tr:nth-child(even) {
  background: #fafbfc;
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
  max-width: 520px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
  animation: slideUp 0.3s ease-out;
}

.modal-content h3 {
  margin: 0 0 1.5rem;
  font-size: 1.35rem;
  font-weight: 600;
  color: #1e293b;
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
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
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
  background: #3b82f6;
  color: white;
}

.modal-actions button:first-child:hover {
  background: #2563eb;
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