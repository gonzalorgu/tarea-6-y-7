<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Gestión completa del sistema de aerolíneas</p>
    </header>

    <div class="botones-container">
      <RouterLink class="boton" :to="{ name: '/aerolineas/' }">
        <svg-icon name="plane-takeoff" />
        Crear Vuelos
      </RouterLink>

      <RouterLink class="boton" :to="{ name: '/vuelos/' }">
        <svg-icon name="ticket" />
        Comprar Pasajes
      </RouterLink>

      <RouterLink class="boton" :to="{ name: '/clientes/' }">
        <svg-icon name="user-plus" />
        Agregar Cliente
      </RouterLink>

      <RouterLink class="boton" :to="{ name: '/detalles/' }">
        <svg-icon name="list" />
        Detalles
      </RouterLink>

      <RouterLink class="boton" :to="{ name: '/salida/' }">
        <svg-icon name="logout" />
        Salida
      </RouterLink>
      <RouterLink class="boton" :to="{ name: '/salida/' }">
        <svg-icon name="logout" />
        llegada
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
// No se necesita lógica adicional
</script>

<style scoped>
/* === ESTILOS MEJORADOS Y PROFESIONALES === */

.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #1e293b;
}

/* HEADER */
.dashboard-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #1e293b, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 0.75rem 0 0;
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
}

/* BOTONES GRID */
.botones-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
}

/* BOTÓN ESTILIZADO */
.boton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: white;
  color: #1e293b;
  padding: 1.75rem 1.5rem;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
}

.boton::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.boton:hover::before {
  opacity: 1;
}

.boton > * {
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.boton:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(59, 130, 246, 0.2);
  border-color: transparent;
}

.boton:hover > * {
  color: white;
}

/* ICONOS SVG PERSONALIZADOS */
svg-icon {
  width: 2.2rem;
  height: 2.2rem;
  fill: currentColor;
  transition: transform 0.3s ease;
}

.boton:hover svg-icon {
  transform: scale(1.1);
}

/* ICONOS ESPECÍFICOS (puedes usar librería como Lucide o Heroicons) */
svg-icon[name="plane-takeoff"] { fill: #3b82f6; }
svg-icon[name="ticket"] { fill: #10b981; }
svg-icon[name="user-plus"] { fill: #8b5cf6; }
svg-icon[name="list"] { fill: #f59e0b; }
svg-icon[name="logout"] { fill: #ef4444; }

/* RESPONSIVE */
@media (max-width: 640px) {
  .dashboard-header h1 {
    font-size: 2rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .botones-container {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .boton {
    padding: 1.5rem 1rem;
    font-size: 1rem;
  }
}
</style>