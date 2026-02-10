<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import BottomNavigation from './BottomNavigation.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Desktop Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <main class="pb-20 md:ml-64 md:pb-0">
      <div class="container mx-auto p-4 md:p-6">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>
