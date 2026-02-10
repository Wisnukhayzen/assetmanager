<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import ResponsiveWrapper from '@/components/layout/ResponsiveWrapper.vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, Box, Building2, Loader2, X, Eye } from 'lucide-vue-next'
import ConditionBadge from '@/components/ConditionBadge.vue'
import type { Ruangan, Asset } from '@/types/database'

const route = useRoute()
const roomId = parseInt(route.params.id as string)

const room = ref<Ruangan | null>(null)
const operatorName = ref<string>('-')
const operatorAvatar = ref<string | null>(null)
const assets = ref<Asset[]>([])
const isRoomLoading = ref(true)
const isAssetsLoading = ref(true)

// Asset Detail Modal State
const selectedAsset = ref<Asset | null>(null)
const showDetailModal = ref(false)

const fetchRoomDetails = async () => {
  try {
    // Fetch Room with Operator info
    const { data: roomData, error: roomError } = await supabase
      .from('ruangans')
      .select('*, user:users(name, role, profile_picture)')
      .eq('id', roomId)
      .single()

    if (roomError) throw roomError
    room.value = roomData as unknown as Ruangan

    // Set Operator Name from relation or fetch separately if needed
    if (roomData.user) {
      operatorName.value = `${roomData.user.name} (${roomData.user.role})`
      operatorAvatar.value = roomData.user.profile_picture || null
    } else if (roomData.user_id) {
      // Fallback fetch if relation failed or null
      const { data: userData } = await supabase
        .from('users')
        .select('name, role, profile_picture')
        .eq('id', roomData.user_id)
        .single()
      if (userData) {
        operatorName.value = `${userData.name} (${userData.role})`
        operatorAvatar.value = userData.profile_picture || null
      }
    }

    // Fetch Assets
    const { data: assetData, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('ruangan_id', roomId)
      .order('created_at', { ascending: false })

    if (assetError) console.error(assetError)
    assets.value = assetData || []
  } catch (error) {
    console.error('Error fetching room details:', error)
  } finally {
    isRoomLoading.value = false
    isAssetsLoading.value = false
  }
}

const openAssetDetail = (asset: Asset) => {
  selectedAsset.value = asset
  showDetailModal.value = true
}

onMounted(() => {
  if (isNaN(roomId)) {
    // Handle invalid ID
    return
  }
  fetchRoomDetails()
})

const assetCount = computed(() => assets.value.length)
</script>

<template>
  <ResponsiveWrapper>
    <div v-if="isRoomLoading" class="flex justify-center py-12">
      <Loader2 class="animate-spin h-8 w-8 text-primary" />
    </div>

    <div v-else-if="!room" class="text-center py-12">
      <h3 class="text-lg font-semibold">Ruangan tidak ditemukan</h3>
      <p class="text-muted-foreground">Silakan periksa kembali URL yang Anda akses.</p>
    </div>

    <div v-else class="space-y-6 animate-in fade-in duration-300 pb-12">
      <!-- Header Section (Profile Aesthetic) -->
      <div class="relative">
        <!-- Room Background Header -->
        <div class="relative h-64 md:h-80 rounded-3xl overflow-hidden shadow-xl bg-muted">
          <img
            v-if="room.header_img"
            :src="room.header_img"
            alt="Room Header"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600"
          >
            <Building2 class="h-24 w-24 text-white/50" />
          </div>
          <div class="absolute inset-0 bg-black/20"></div>

          <!-- Public View Badge -->
          <div class="absolute top-4 right-4">
            <Badge
              class="bg-white/10 backdrop-blur-md text-white border-white/20 px-3 py-1 rounded-full text-xs font-semibold"
            >
              Halaman Publik • View Only
            </Badge>
          </div>
        </div>

        <!-- Operator Avatar Overlap (JUST the avatar) -->
        <div class="absolute -bottom-16 left-0 right-0 flex flex-col items-center">
          <div
            class="w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-white bg-slate-100 shadow-2xl overflow-hidden flex items-center justify-center"
          >
            <img v-if="operatorAvatar" :src="operatorAvatar" class="h-full w-full object-cover" />
            <User v-else class="h-16 w-16 text-slate-300" />
          </div>
        </div>
      </div>

      <!-- Room Content Container (Below Cover) -->
      <div class="pt-20 px-4 text-center space-y-4">
        <h2 class="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">
          {{ room.name }}
        </h2>
        <div class="flex flex-col items-center">
          <Badge
            variant="secondary"
            class="shadow-sm border-none bg-primary/10 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            Penanggung Jawab
          </Badge>
          <p class="mt-1 text-lg font-semibold text-slate-600">
            {{ operatorName !== '-' ? operatorName : 'Memuat...' }}
          </p>
        </div>
      </div>

      <!-- Assets List (Clickable for Detail) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold">Daftar Aset</h3>
          <Badge
            variant="outline"
            class="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1"
          >
            Total: {{ assetCount }} Item
          </Badge>
        </div>

        <div v-if="assets.length === 0" class="text-center py-8 bg-muted/30 rounded-lg">
          <p class="text-muted-foreground">Belum ada aset di ruangan ini</p>
        </div>

        <div v-else class="rounded-md border bg-slate-50/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px] text-center">No</TableHead>
                <TableHead>Nama Aset</TableHead>
                <TableHead class="hidden md:table-cell">Kode</TableHead>
                <TableHead class="hidden md:table-cell">Merk</TableHead>
                <TableHead>Kondisi</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead class="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(asset, index) in assets" :key="asset.id">
                <TableCell class="text-center font-medium">{{ index + 1 }}</TableCell>
                <TableCell>
                  <div class="flex items-center gap-3">
                    <div class="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img v-if="asset.foto" :src="asset.foto" class="h-full w-full object-cover" />
                      <div v-else class="flex h-full w-full items-center justify-center">
                        <Box class="h-5 w-5 text-muted-foreground/50" />
                      </div>
                    </div>
                    <span class="font-medium">{{ asset.name }}</span>
                  </div>
                </TableCell>
                <TableCell class="hidden md:table-cell font-mono text-xs text-muted-foreground">{{
                  asset.kode || '-'
                }}</TableCell>
                <TableCell class="hidden md:table-cell">{{ asset.merk || '-' }}</TableCell>
                <TableCell>
                  <ConditionBadge :kondisi="asset.kondisi" />
                </TableCell>
                <TableCell>{{ asset.jumlah }}</TableCell>
                <TableCell class="text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    @click="openAssetDetail(asset)"
                    title="Lihat Detail"
                  >
                    <Eye class="h-4 w-4 text-primary" />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

    <!-- Asset Detail Modal -->
    <div
      v-if="showDetailModal && selectedAsset"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <Card class="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl scale-100">
        <div class="relative">
          <button
            @click="showDetailModal = false"
            class="absolute right-4 top-4 z-10 p-1 bg-white/50 rounded-full hover:bg-white text-gray-700 transition"
          >
            <X class="h-5 w-5" />
          </button>

          <div class="aspect-video w-full bg-muted overflow-hidden rounded-t-lg">
            <img
              v-if="selectedAsset.foto"
              :src="selectedAsset.foto"
              class="w-full h-full object-cover"
            />
            <div v-else class="flex h-full items-center justify-center">
              <Box class="h-16 w-16 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        <CardContent class="p-6 space-y-6">
          <div>
            <h2 class="text-2xl font-bold">{{ selectedAsset.name }}</h2>
            <div class="flex items-center gap-2 mt-2">
              <ConditionBadge :kondisi="selectedAsset.kondisi" />
              <Badge variant="outline">{{ selectedAsset.jumlah }} Unit</Badge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label class="text-xs text-muted-foreground">Kode Aset</Label>
              <p class="font-mono font-medium">{{ selectedAsset.kode || '-' }}</p>
            </div>
            <div>
              <Label class="text-xs text-muted-foreground">Merk / Model</Label>
              <p class="font-medium">{{ selectedAsset.merk || '-' }}</p>
            </div>
            <div>
              <Label class="text-xs text-muted-foreground">Tahun Perolehan</Label>
              <p class="font-medium">{{ selectedAsset.tahun || '-' }}</p>
            </div>
            <div>
              <Label class="text-xs text-muted-foreground">NUP</Label>
              <p class="font-medium">{{ selectedAsset.nup || '-' }}</p>
            </div>
            <div class="col-span-2">
              <Label class="text-xs text-muted-foreground">Status / Milik</Label>
              <p class="font-medium">{{ selectedAsset.milik || '-' }}</p>
            </div>
          </div>
        </CardContent>

        <div class="p-6 pt-0 flex justify-end">
          <Button variant="outline" @click="showDetailModal = false">Tutup</Button>
        </div>
      </Card>
    </div>
  </ResponsiveWrapper>
</template>
