<template>
  <div>
    <h1>Error 404 - Página no encontrada</h1>
    <p>La ruta que buscas no existe</p>
    <RouterLink :to="{name:'/'}">
      Ir al dashboard
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>