<template>
  <div>
    <h1>usuarios</h1>
    <RouterLink :to="{name:'/'}">
      Ir al dashboard
    </RouterLink>
    <br>
    <RouterLink :to="{name:'/vuelos/'}">
      Volver
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute()
</script>

<style scoped>
</style>
