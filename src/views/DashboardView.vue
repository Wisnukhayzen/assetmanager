<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAssetStore } from '@/stores/asset'
import { useRuanganStore } from '@/stores/ruangan'
import { useAuthStore } from '@/stores/auth'
import ResponsiveWrapper from '@/components/layout/ResponsiveWrapper.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-vue-next'

const assetStore = useAssetStore()
const ruanganStore = useRuanganStore()
const authStore = useAuthStore()

onMounted(async () => {
  await Promise.all([
    assetStore.fetchAssets(),
    ruanganStore.fetchRuangans(),
  ])
})

const stats = computed(() => assetStore.stats)
</script>

<template>
  <ResponsiveWrapper>
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground">
          Selamat datang, {{ authStore.user?.name }}
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <!-- Total Assets -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total Aset</CardTitle>
            <Package class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.totalAssets }}</div>
            <p class="text-xs text-muted-foreground">
              Semua aset yang terdaftar
            </p>
          </CardContent>
        </Card>

        <!-- Baik -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Kondisi Baik</CardTitle>
            <CheckCircle class="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-green-600">{{ stats.baik }}</div>
            <p class="text-xs text-muted-foreground">
              {{ stats.totalAssets > 0 ? Math.round((stats.baik / stats.totalAssets) * 100) : 0 }}% dari total
            </p>
          </CardContent>
        </Card>

        <!-- Rusak Ringan -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Rusak Ringan</CardTitle>
            <AlertTriangle class="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-yellow-600">{{ stats.rusakRingan }}</div>
            <p class="text-xs text-muted-foreground">
              {{ stats.totalAssets > 0 ? Math.round((stats.rusakRingan / stats.totalAssets) * 100) : 0 }}% dari total
            </p>
          </CardContent>
        </Card>

        <!-- Rusak Berat -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Rusak Berat</CardTitle>
            <XCircle class="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold text-red-600">{{ stats.rusakBerat }}</div>
            <p class="text-xs text-muted-foreground">
              {{ stats.totalAssets > 0 ? Math.round((stats.rusakBerat / stats.totalAssets) * 100) : 0 }}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Quick Info -->
      <Card>
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Total Ruangan</span>
              <span class="font-semibold">{{ ruanganStore.ruangans.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Role</span>
              <span class="font-semibold">{{ authStore.isAdmin ? 'Administrator' : 'Operator' }}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </ResponsiveWrapper>
</template>
