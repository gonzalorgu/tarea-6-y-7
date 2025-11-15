<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <RouterLink class="boton" :to="{ name: '/vuelos/' }">Agregar entrada</RouterLink>
    <RouterLink class="boton" :to="{ name: '/vuelos/[id]', params: { id: 5 } }">
      Ir a agregar películas al catálogo
    </RouterLink>
  </div>
</template>


<script setup lang="ts">
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px; /* separación entre los botones */
}

.boton {
  background-color: #7b2cbf; /* morado */
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.boton:hover {
  background-color: #9d4edd; /* morado más claro al pasar el mouse */
}
</style>

