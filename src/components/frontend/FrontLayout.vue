<template>
  <div class="front-layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <SiteFooter />
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue'
import SiteFooter from './SiteFooter.vue'
</script>

<style scoped>
.front-layout { display: flex; flex-direction: column; min-height: 100vh; }
.main-content { flex: 1; }
</style>
