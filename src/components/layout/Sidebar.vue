<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Home, Building2, Package, Users, LogOut, User } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
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

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r bg-background md:block">
    <div class="flex h-full flex-col">
      <!-- Logo/Brand -->
      <div class="border-b p-6">
        <h1 class="text-2xl font-bold text-primary">Satup App</h1>
        <p class="text-sm text-muted-foreground">Asset Management</p>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 p-4">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="
            isActive(item.path)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          "
        >
          <component :is="item.icon" class="h-5 w-5" />
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <!-- User Profile & Logout -->
      <div class="border-t p-4">
        <div class="mb-3 rounded-lg bg-muted p-3">
          <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
          <p class="text-xs text-muted-foreground">{{ authStore.user?.email }}</p>
          <p class="mt-1 text-xs font-semibold text-primary">
            {{ authStore.isAdmin ? 'Admin' : 'Operator' }}
          </p>
        </div>

        <Button variant="outline" class="w-full" @click="handleLogout">
          <LogOut class="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  </aside>
</template>
