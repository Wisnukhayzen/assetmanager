<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useRuanganStore } from '@/stores/ruangan'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useAssetStore } from '@/stores/asset'
import ResponsiveWrapper from '@/components/layout/ResponsiveWrapper.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  User,
  Box,
  Building2,
  Plus,
  Loader2,
  Pencil,
  Trash2,
  Save,
  X,
  ExternalLink,
  Eye,
  Shield,
} from 'lucide-vue-next'
import ConditionBadge from '@/components/ConditionBadge.vue'
import Base64Upload from '@/components/Base64Upload.vue'
import type { Ruangan, Asset, User as DbUser, AssetKondisi } from '@/types/database'

const route = useRoute()
const router = useRouter()
const ruanganStore = useRuanganStore()
const authStore = useAuthStore()
const assetStore = useAssetStore()
const { toast } = useToast()
const roomId = parseInt(route.params.id as string)

// Computed for Edit Permission
const canEdit = computed(() => {
  if (!room.value) return false
  return authStore.isAdmin || authStore.user?.id === room.value.user_id
})

// Initialize room from store for instant load
const room = ref<Ruangan | null>(ruanganStore.getRuanganById(roomId) || null)

const operatorName = ref<string>('-')
const operatorAvatar = ref<string | null>(null)
const assets = ref<Asset[]>([])
const isRoomLoading = ref(!room.value)
const isAssetsLoading = ref(true)

// Edit Mode State (Room)
const isEditing = ref(false)
const users = ref<DbUser[]>([])
const isSaving = ref(false)
const editFormData = ref({
  name: '',
  header_img: undefined as string | undefined,
  user_id: '',
})

// Asset Modal States
const showAssetDetail = ref(false)
const showAssetEdit = ref(false)
const selectedAsset = ref<Asset | null>(null)
const assetFormData = ref({
  id: '',
  ruangan_id: roomId,
  name: '',
  merk: '',
  tahun: undefined as number | undefined,
  kode: '',
  nup: '',
  milik: '',
  jumlah: 1,
  kondisi: 'baik' as AssetKondisi,
  foto: undefined as string | undefined,
})

const fetchRoomAndAssets = async () => {
  try {
    // 1. Fetch Room Data
    if (!room.value) {
      const { data: roomData, error: roomError } = await supabase
        .from('ruangans')
        .select('*, user:users(name, role, profile_picture)')
        .eq('id', roomId)
        .single()

      if (roomError) throw roomError
      room.value = roomData as unknown as Ruangan
    }
    isRoomLoading.value = false

    // 2. Fetch Operator Info from room or explicitly
    if (room.value?.user) {
      operatorName.value = room.value.user.name
      operatorAvatar.value = room.value.user.profile_picture || null
    } else if (room.value?.user_id) {
      fetchOperatorInfo(room.value.user_id)
    }

    // 3. Fetch Assets
    fetchAssets()
  } catch (error) {
    console.error('Error fetching details:', error)
  } finally {
    isRoomLoading.value = false
    isAssetsLoading.value = false
  }
}

const fetchOperatorInfo = async (userId: string) => {
  const { data } = await supabase
    .from('users')
    .select('name, profile_picture')
    .eq('id', userId)
    .single()

  if (data) {
    operatorName.value = data.name
    operatorAvatar.value = data.profile_picture || null
  }
}

const fetchAssets = async () => {
  const { data: assetData, error: assetError } = await supabase
    .from('assets')
    .select('*')
    .eq('ruangan_id', roomId)
    .order('created_at', { ascending: false })

  if (assetError) console.error(assetError)
  assets.value = assetData || []
  isAssetsLoading.value = false
}

const fetchUsers = async () => {
  const { data } = await supabase.from('users').select('*').order('name')
  if (data) users.value = data
}

const startEdit = async () => {
  if (!room.value) return

  // Create a copy of current data
  editFormData.value = {
    name: room.value.name,
    header_img: room.value.header_img || undefined,
    user_id: room.value.user_id,
  }

  // Load users for dropdown ONLY for Admin
  if (authStore.isAdmin && users.value.length === 0) {
    await fetchUsers()
  }

  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  editFormData.value = { name: '', header_img: undefined, user_id: '' }
}

const saveRoom = async () => {
  if (!room.value) return
  isSaving.value = true

  try {
    const updated = await ruanganStore.updateRuangan(room.value.id, editFormData.value)

    if (updated) {
      room.value = { ...room.value, ...updated } as Ruangan // Update local state

      // Update operator info locally if changed
      if (updated.user_id !== room.value.user_id) {
        fetchOperatorInfo(updated.user_id)
      }

      isEditing.value = false
      toast({
        title: 'Berhasil',
        description: 'Perubahan berhasil disimpan.',
        variant: 'success',
      })
    }
  } catch (error) {
    console.error('Failed to update room:', error)
    toast({
      title: 'Gagal',
      description: 'Gagal menyimpan perubahan. Pastikan Anda memiliki izin.',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}

const deleteRoom = async () => {
  if (
    !confirm(
      'Apakah Anda yakin ingin menghapus ruangan ini berserta seluruh aset di dalamnya? Tindakan ini tidak dapat dibatalkan.',
    )
  )
    return

  isSaving.value = true
  try {
    const success = await ruanganStore.deleteRuangan(roomId)
    if (success) {
      router.replace('/rooms')
      toast({
        title: 'Berhasil',
        description: 'Ruangan berhasil dihapus.',
        variant: 'success',
      })
    } else {
      toast({
        title: 'Gagal',
        description: 'Gagal menghapus ruangan.',
        variant: 'destructive',
      })
    }
  } catch (error) {
    console.error(error)
    toast({
      title: 'Error',
      description: 'Terjadi kesalahan sistem.',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}

const openPublicView = () => {
  // Use router resolve to get the href for the public route
  const routeData = router.resolve({ name: 'public-room-view', params: { id: roomId } })
  window.open(routeData.href, '_blank')
}

// Asset Actions
const openAssetDetail = (asset: Asset) => {
  selectedAsset.value = asset
  showAssetDetail.value = true
}

const openAssetEdit = (asset: Asset) => {
  selectedAsset.value = asset
  assetFormData.value = {
    id: asset.id,
    ruangan_id: asset.ruangan_id,
    name: asset.name,
    merk: asset.merk || '',
    tahun: asset.tahun ?? undefined,
    kode: asset.kode || '',
    nup: asset.nup || '',
    milik: asset.milik || '',
    jumlah: asset.jumlah,
    kondisi: asset.kondisi,
    foto: asset.foto || undefined,
  }
  showAssetEdit.value = true
}

const saveAsset = async () => {
  if (!assetFormData.value.name) {
    toast({
      title: 'Validasi Gagal',
      description: 'Nama aset wajib diisi.',
      variant: 'destructive',
    })
    return
  }

  isSaving.value = true
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = assetFormData.value
    const success = await assetStore.updateAsset(id, updates as Partial<Asset>)

    if (success) {
      showAssetEdit.value = false
      fetchAssets() // Refresh asset list
      toast({
        title: 'Berhasil',
        description: 'Aset berhasil diperbarui.',
        variant: 'success',
      })
    } else {
      toast({
        title: 'Gagal',
        description: 'Gagal memperbarui aset.',
        variant: 'destructive',
      })
    }
  } catch (error) {
    console.error(error)
    toast({
      title: 'Error',
      description: 'Terjadi kesalahan sistem.',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}

const deleteAsset = async (assetId: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus aset ini?')) return

  try {
    const success = await assetStore.deleteAsset(assetId)
    if (success) {
      fetchAssets() // Refresh asset list
      toast({
        title: 'Berhasil',
        description: 'Aset berhasil dihapus.',
        variant: 'success',
      })
    } else {
      toast({
        title: 'Gagal',
        description: 'Gagal menghapus aset.',
        variant: 'destructive',
      })
    }
  } catch (error) {
    console.error(error)
    toast({
      title: 'Error',
      description: 'Terjadi kesalahan sistem.',
      variant: 'destructive',
    })
  }
}

onMounted(() => {
  if (isNaN(roomId)) {
    router.push('/rooms')
    return
  }
  fetchRoomAndAssets()
})

const assetCount = computed(() => assets.value.length)
</script>

<template>
  <ResponsiveWrapper>
    <div v-if="isRoomLoading && !room" class="flex justify-center py-12">
      <Loader2 class="animate-spin h-8 w-8 text-primary" />
    </div>

    <div v-else-if="!room" class="text-center py-12">
      <h3 class="text-lg font-semibold">Ruangan tidak ditemukan</h3>
      <Button variant="link" @click="$router.push('/rooms')">Kembali ke Daftar Ruangan</Button>
    </div>

    <div v-else class="space-y-6 animate-in fade-in duration-300">
      <!-- Top Navigation & Actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="icon" @click="isEditing ? cancelEdit() : $router.back()">
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <h1 class="text-2xl font-bold">{{ isEditing ? 'Edit Ruangan' : 'Detail Ruangan' }}</h1>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <Button
            v-if="!isEditing"
            variant="outline"
            size="sm"
            @click="openPublicView"
            title="Lihat Tampilan Publik"
          >
            <ExternalLink class="mr-2 h-4 w-4" />
            Preview Publik
          </Button>

          <!-- Show Edit Button for Admin OR Assigned Operator -->
          <Button v-if="canEdit && !isEditing" variant="default" size="sm" @click="startEdit">
            <Pencil class="mr-2 h-4 w-4" />
            {{ authStore.isAdmin ? 'Edit Info' : 'Ganti Foto' }}
          </Button>
        </div>
      </div>

      <!-- VIEW MODE -->
      <div v-if="!isEditing" class="space-y-6">
        <!-- Room Header with Operator Avatar (Profile Aesthetic) -->
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
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
            >
              <Building2 class="h-24 w-24 text-white/50" />
            </div>
            <div class="absolute inset-0 bg-black/20"></div>
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

        <!-- Reduced Spacing before Stats -->
        <div class="h-2"></div>

        <!-- Quick Stats Cards (Redesigned) -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card class="border-none shadow-md bg-white">
            <CardContent class="flex items-center gap-5 p-6">
              <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Box class="h-7 w-7" />
              </div>
              <div>
                <p class="text-sm text-slate-500 font-bold uppercase tracking-wider">Total Aset</p>
                <p class="text-2xl font-black text-slate-900">
                  <span v-if="!isAssetsLoading">{{ assetCount }} Item</span>
                  <span v-else class="animate-pulse">...</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card class="border-none shadow-md bg-white">
            <CardContent class="flex items-center gap-5 p-6">
              <div class="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                <Building2 class="h-7 w-7" />
              </div>
              <div>
                <p class="text-sm text-slate-500 font-bold uppercase tracking-wider">Lokasi</p>
                <p class="text-2xl font-black text-slate-900">{{ room.name }}</p>
              </div>
            </CardContent>
          </Card>

          <Card class="border-none shadow-md bg-white lg:col-span-1 md:col-span-2">
            <CardContent class="flex items-center gap-5 p-6">
              <div class="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Shield class="h-7 w-7" />
              </div>
              <div>
                <p class="text-sm text-slate-500 font-bold uppercase tracking-wider">
                  Kapasitas Pengawasan
                </p>
                <p class="text-2xl font-black text-slate-900">Aktif</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Assets List Section -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold">Daftar Aset</h3>
          </div>

          <div v-if="isAssetsLoading" class="flex justify-center py-8">
            <Loader2 class="h-8 w-8 animate-spin text-primary" />
          </div>

          <div v-else-if="assets.length === 0" class="text-center py-8 bg-muted/30 rounded-lg">
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
                        <img
                          v-if="asset.foto"
                          :src="asset.foto"
                          class="h-full w-full object-cover"
                        />
                        <div v-else class="flex h-full w-full items-center justify-center">
                          <Box class="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      </div>
                      <span class="font-medium">{{ asset.name }}</span>
                    </div>
                  </TableCell>
                  <TableCell class="hidden md:table-cell font-mono text-xs text-muted-foreground">
                    {{ asset.kode || '-' }}
                  </TableCell>
                  <TableCell class="hidden md:table-cell">{{ asset.merk || '-' }}</TableCell>
                  <TableCell>
                    <ConditionBadge :kondisi="asset.kondisi" />
                  </TableCell>
                  <TableCell>{{ asset.jumlah }}</TableCell>
                  <TableCell>
                    <div class="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        @click="openAssetDetail(asset)"
                        title="Lihat Detail"
                      >
                        <Eye class="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        @click="openAssetEdit(asset)"
                        title="Edit"
                      >
                        <Pencil class="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        @click="deleteAsset(asset.id)"
                        title="Hapus"
                      >
                        <Trash2 class="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <!-- EDIT MODE FORM -->
      <div v-else class="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Informasi Ruangan</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <Base64Upload
              v-model="editFormData.header_img"
              label="Foto Header Ruangan"
              :aspect-ratio="16 / 9"
            />

            <div class="space-y-2">
              <Label for="name">Nama Ruangan</Label>
              <Input id="name" v-model="editFormData.name" placeholder="Nama Ruangan" />
            </div>

            <!-- Operator Select - Only for Admin -->
            <div v-if="authStore.isAdmin" class="space-y-2">
              <Label for="operator">Operator Penanggung Jawab</Label>
              <select
                id="operator"
                v-model="editFormData.user_id"
                class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Pilih Operator</option>
                <option v-for="user in users" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.role }})
                </option>
              </select>
            </div>
            <div v-else class="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <p>Hanya Admin yang dapat mengubah penanggung jawab ruangan.</p>
            </div>
          </CardContent>
        </Card>

        <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <!-- Delete Button - Only for Admin -->
          <Button
            v-if="authStore.isAdmin"
            variant="destructive"
            @click="deleteRoom"
            :disabled="isSaving"
            class="w-full sm:w-auto"
          >
            <Trash2 class="mr-2 h-4 w-4" />
            Hapus Ruangan
          </Button>
          <div v-else class="w-full sm:w-auto"></div>

          <div class="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              @click="cancelEdit"
              :disabled="isSaving"
              class="flex-1 sm:flex-none"
            >
              <X class="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button @click="saveRoom" :disabled="isSaving" class="flex-1 sm:flex-none">
              <Save v-if="!isSaving" class="mr-2 h-4 w-4" />
              <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Detail Modal -->
    <div
      v-if="showAssetDetail && selectedAsset"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="showAssetDetail = false"
    >
      <Card class="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="relative">
          <button
            @click="showAssetDetail = false"
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
          <Button variant="outline" @click="showAssetDetail = false">Tutup</Button>
        </div>
      </Card>
    </div>

    <!-- Asset Edit Modal -->
    <div
      v-if="showAssetEdit"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      @click.self="showAssetEdit = false"
    >
      <Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader>
          <CardTitle>Edit Aset</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <Base64Upload v-model="assetFormData.foto" label="Foto Aset" :aspect-ratio="16 / 9" />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2 md:col-span-2">
              <Label for="asset-name">Nama Aset *</Label>
              <Input
                id="asset-name"
                v-model="assetFormData.name"
                placeholder="Nama Aset"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="asset-kode">Kode Aset</Label>
              <Input id="asset-kode" v-model="assetFormData.kode" placeholder="Kode" />
            </div>

            <div class="space-y-2">
              <Label for="asset-merk">Merk / Model</Label>
              <Input id="asset-merk" v-model="assetFormData.merk" placeholder="Merk" />
            </div>

            <div class="space-y-2">
              <Label for="asset-tahun">Tahun Perolehan</Label>
              <Input
                id="asset-tahun"
                v-model.number="assetFormData.tahun"
                type="number"
                placeholder="2024"
              />
            </div>

            <div class="space-y-2">
              <Label for="asset-nup">NUP</Label>
              <Input id="asset-nup" v-model="assetFormData.nup" placeholder="NUP" />
            </div>

            <div class="space-y-2">
              <Label for="asset-milik">Status / Milik</Label>
              <Input id="asset-milik" v-model="assetFormData.milik" placeholder="Milik Negara" />
            </div>

            <div class="space-y-2">
              <Label for="asset-jumlah">Jumlah</Label>
              <Input
                id="asset-jumlah"
                v-model.number="assetFormData.jumlah"
                type="number"
                min="1"
              />
            </div>

            <div class="space-y-2 md:col-span-2">
              <Label for="asset-kondisi">Kondisi</Label>
              <select
                id="asset-kondisi"
                v-model="assetFormData.kondisi"
                class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="baik">Baik</option>
                <option value="rusak_ringan">Rusak Ringan</option>
                <option value="rusak_berat">Rusak Berat</option>
              </select>
            </div>
          </div>
        </CardContent>

        <div class="p-6 pt-0 flex justify-end gap-2">
          <Button variant="outline" @click="showAssetEdit = false" :disabled="isSaving">
            Batal
          </Button>
          <Button @click="saveAsset" :disabled="isSaving">
            <Save v-if="!isSaving" class="mr-2 h-4 w-4" />
            <Loader2 v-else class="mr-2 h-4 w-4 animate-spin" />
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </div>
      </Card>
    </div>
  </ResponsiveWrapper>
</template>
