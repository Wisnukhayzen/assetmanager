<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Home, Building2, Package, Users, User } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

interface NavItem {
  name: string
  path: string
  icon: any
  adminOnly?: boolean
}

const navItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Ruangan', path: '/rooms', icon: Building2 },
    { name: 'Aset', path: '/assets', icon: Package },
    { name: 'Profil', path: '/profile', icon: User },
  ]

  if (authStore.isAdmin) {
    items.push({ name: 'Pengguna', path: '/admin/users', icon: Users, adminOnly: true })
  }

  return items
})

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
  >
    <div class="flex items-center justify-around px-2 py-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs transition-colors"
        :class="
          isActive(item.path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
        "
      >
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>
