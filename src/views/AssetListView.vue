<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAssetStore } from '@/stores/asset'
import { useRuanganStore } from '@/stores/ruangan'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import ResponsiveWrapper from '@/components/layout/ResponsiveWrapper.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import Base64Upload from '@/components/Base64Upload.vue'
import ConditionBadge from '@/components/ConditionBadge.vue'
import { Plus, Search, Package, Eye, Pencil, Trash2, X, Save, Building2 } from 'lucide-vue-next'
import type { Asset, AssetKondisi } from '@/types/database'

const assetStore = useAssetStore()
const ruanganStore = useRuanganStore()
const authStore = useAuthStore()
const { toast } = useToast()

// State
const showForm = ref(false)
const isEditing = ref(false)
const showDetail = ref(false)
const selectedAsset = ref<Asset | null>(null)
const searchQuery = ref('')
const filterKondisi = ref<AssetKondisi | 'all'>('all')

const formData = ref({
  id: '', // Used for update
  ruangan_id: 0,
  name: '',
  merk: '',
  tahun: undefined as number | undefined,
  kode: '',
  nup: '',
  milik: '',
  jumlah: 1,
  kondisi: 'baik' as AssetKondisi,
  foto: null as string | null,
})

onMounted(async () => {
  await Promise.all([assetStore.fetchAssets(), ruanganStore.fetchRuangans()])
})

const filteredAssets = computed(() => {
  let assets = assetStore.assets

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    assets = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) ||
        asset.merk?.toLowerCase().includes(query) ||
        asset.kode?.toLowerCase().includes(query),
    )
  }

  // Filter by kondisi
  if (filterKondisi.value !== 'all') {
    assets = assets.filter((asset) => asset.kondisi === filterKondisi.value)
  }

  return assets
})

const resetForm = () => {
  formData.value = {
    id: '',
    ruangan_id: ruanganStore.ruangans[0]?.id || 0,
    name: '',
    merk: '',
    tahun: undefined,
    kode: '',
    nup: '',
    milik: '',
    jumlah: 1,
    kondisi: 'baik',
    foto: null,
  }
  isEditing.value = false
  showForm.value = false
}

const openAddForm = () => {
  resetForm()
  showForm.value = true
}

const openEditForm = (asset: any) => {
  formData.value = {
    id: asset.id,
    ruangan_id: asset.ruangan_id,
    name: asset.name,
    merk: asset.merk || '',
    tahun: asset.tahun,
    kode: asset.kode || '',
    nup: asset.nup || '',
    milik: asset.milik || '',
    jumlah: asset.jumlah,
    kondisi: asset.kondisi,
    foto: asset.foto || null,
  }
  isEditing.value = true
  showForm.value = true
}

const openDetail = (asset: Asset) => {
  selectedAsset.value = asset
  showDetail.value = true
}

const handleSubmit = async () => {
  // Validate required fields
  if (!formData.value.name || !formData.value.ruangan_id) {
    toast({
      title: 'Gagal',
      description: 'Nama aset dan ruangan wajib diisi.',
      variant: 'destructive',
    })
    return
  }

  let success
  if (isEditing.value && formData.value.id) {
    // Update
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updates } = formData.value
    success = await assetStore.updateAsset(id, updates)
  } else {
    // Create
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...newAsset } = formData.value
    success = await assetStore.createAsset(newAsset)
  }

  if (success) {
    resetForm()
    toast({
      title: 'Berhasil',
      description: isEditing.value ? 'Data aset diperbarui.' : 'Aset baru ditambahkan.',
      variant: 'success',
    })
  } else {
    toast({
      title: 'Gagal',
      description: 'Terjadi kesalahan saat menyimpan aset.',
      variant: 'destructive',
    })
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus aset ini?')) {
    const success = await assetStore.deleteAsset(id)
    if (success) {
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
  }
}
</script>

<template>
  <ResponsiveWrapper>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Aset</h1>
          <p class="text-muted-foreground">Kelola semua aset yang terdaftar</p>
        </div>

        <Button @click="openAddForm">
          <Plus class="mr-2 h-4 w-4" />
          Tambah Aset
        </Button>
      </div>

      <!-- Filters -->
      <Card>
        <CardContent class="p-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <div class="relative flex-1">
              <Search
                class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="Cari nama, merk, atau kode aset..."
                class="pl-9"
              />
            </div>
            <div class="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                :class="filterKondisi === 'all' ? 'bg-primary text-primary-foreground' : ''"
                @click="filterKondisi = 'all'"
                >Semua</Button
              >
              <Button
                variant="outline"
                size="sm"
                :class="filterKondisi === 'baik' ? 'bg-green-500 text-white' : ''"
                @click="filterKondisi = 'baik'"
                >Baik</Button
              >
              <Button
                variant="outline"
                size="sm"
                :class="filterKondisi === 'rusak_ringan' ? 'bg-yellow-500 text-white' : ''"
                @click="filterKondisi = 'rusak_ringan'"
                >Rusak Ringan</Button
              >
              <Button
                variant="outline"
                size="sm"
                :class="filterKondisi === 'rusak_berat' ? 'bg-red-500 text-white' : ''"
                @click="filterKondisi = 'rusak_berat'"
                >Rusak Berat</Button
              >
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Asset Table -->
      <Card>
        <CardContent class="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-[50px]">Foto</TableHead>
                <TableHead>Nama Barang</TableHead>
                <TableHead class="hidden md:table-cell">Merk</TableHead>
                <TableHead class="hidden sm:table-cell">Kondisi</TableHead>
                <TableHead class="hidden lg:table-cell">Ruangan</TableHead>
                <TableHead class="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="asset in filteredAssets" :key="asset.id">
                <TableCell>
                  <div class="h-10 w-10 overflow-hidden rounded-md bg-muted">
                    <img v-if="asset.foto" :src="asset.foto" class="h-full w-full object-cover" />
                    <Package v-else class="h-full w-full p-2 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell class="font-medium">
                  <div>{{ asset.name }}</div>
                  <div class="text-xs text-muted-foreground md:hidden uppercase">
                    {{ asset.kode }}
                  </div>
                </TableCell>
                <TableCell class="hidden md:table-cell">{{ asset.merk || '-' }}</TableCell>
                <TableCell class="hidden sm:table-cell">
                  <ConditionBadge :kondisi="asset.kondisi" />
                </TableCell>
                <TableCell class="hidden lg:table-cell">{{ asset.ruangan?.name || '-' }}</TableCell>
                <TableCell class="text-right space-x-1">
                  <Button variant="ghost" size="icon" @click="openDetail(asset)">
                    <Eye class="h-4 w-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="openEditForm(asset)">
                    <Pencil class="h-4 w-4 text-orange-500" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="handleDelete(asset.id)">
                    <Trash2 class="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="filteredAssets.length === 0">
                <TableCell colspan="6" class="h-24 text-center text-muted-foreground">
                  Tidak ada data aset
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <!-- Add/Edit Modal (Simple Overlay) -->
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      >
        <Card class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>{{ isEditing ? 'Edit Aset' : 'Tambah Aset Baru' }}</CardTitle>
            <Button variant="ghost" size="icon" @click="resetForm"><X class="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="ruangan">Ruangan</Label>
                  <select
                    id="ruangan"
                    v-model="formData.ruangan_id"
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    required
                  >
                    <option
                      v-for="ruangan in ruanganStore.ruangans"
                      :key="ruangan.id"
                      :value="ruangan.id"
                    >
                      {{ ruangan.name }}
                    </option>
                  </select>
                </div>
                <div class="space-y-2">
                  <Label for="name">Nama Aset</Label>
                  <Input id="name" v-model="formData.name" required />
                </div>
                <!-- Other fields unchanged logic, restructured for grid -->
                <div class="space-y-2">
                  <Label for="merk">Merk</Label>
                  <Input id="merk" v-model="formData.merk" />
                </div>
                <div class="space-y-2">
                  <Label for="tahun">Tahun</Label>
                  <Input id="tahun" v-model.number="formData.tahun" type="number" />
                </div>
                <div class="space-y-2">
                  <Label for="kode">Kode</Label>
                  <Input id="kode" v-model="formData.kode" />
                </div>
                <div class="space-y-2">
                  <Label for="nup">NUP</Label>
                  <Input id="nup" v-model="formData.nup" />
                </div>
                <div class="space-y-2">
                  <Label for="milik">Milik</Label>
                  <Input id="milik" v-model="formData.milik" />
                </div>
                <div class="space-y-2">
                  <Label for="jumlah">Jumlah</Label>
                  <Input id="jumlah" v-model.number="formData.jumlah" type="number" min="1" />
                </div>
                <div class="space-y-2">
                  <Label for="kondisi">Kondisi</Label>
                  <select
                    id="kondisi"
                    v-model="formData.kondisi"
                    class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="baik">Baik</option>
                    <option value="rusak_ringan">Rusak Ringan</option>
                    <option value="rusak_berat">Rusak Berat</option>
                  </select>
                </div>
              </div>

              <Base64Upload v-model="formData.foto" label="Foto Aset" :aspect-ratio="4 / 3" />

              <div class="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" @click="resetForm">Batal</Button>
                <Button type="submit" :disabled="assetStore.isLoading">
                  {{ assetStore.isLoading ? 'Menyimpan...' : 'Simpan' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <!-- Detail Modal -->
      <div
        v-if="showDetail && selectedAsset"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <Card class="w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Detail Aset</CardTitle>
            <Button variant="ghost" size="icon" @click="showDetail = false"
              ><X class="h-4 w-4"
            /></Button>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                v-if="selectedAsset.foto"
                :src="selectedAsset.foto"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex h-full items-center justify-center">
                <Package class="h-12 w-12 text-muted-foreground" />
              </div>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <Label class="text-xs text-muted-foreground">Nama Aset</Label>
                <p class="font-medium">{{ selectedAsset.name }}</p>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Kode</Label>
                <p class="font-mono">{{ selectedAsset.kode || '-' }}</p>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Merk</Label>
                <p>{{ selectedAsset.merk || '-' }}</p>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Kondisi</Label>
                <div class="mt-1"><ConditionBadge :kondisi="selectedAsset.kondisi" /></div>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Tahun</Label>
                <p>{{ selectedAsset.tahun || '-' }}</p>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Jumlah</Label>
                <p>{{ selectedAsset.jumlah }} Unit</p>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">NUP</Label>
                <p>{{ selectedAsset.nup || '-' }}</p>
              </div>
              <div>
                <Label class="text-xs text-muted-foreground">Milik</Label>
                <p>{{ selectedAsset.milik || '-' }}</p>
              </div>
            </div>

            <div class="bg-muted p-3 rounded-md">
              <Label class="text-xs text-muted-foreground">Lokasi Ruangan</Label>
              <!-- Using manual lookup or passed object -->
              <p class="font-semibold flex items-center gap-2 mt-1">
                <Building2 class="h-4 w-4" />
                {{
                  ruanganStore.ruangans.find((r) => r.id === selectedAsset?.ruangan_id)?.name ||
                  'Unknown Room'
                }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </ResponsiveWrapper>
</template>
