```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useRuanganStore } from '@/stores/ruangan'
import ResponsiveWrapper from '@/components/layout/ResponsiveWrapper.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Base64Upload from '@/components/Base64Upload.vue'
import { Plus, Building2, Search, Loader2, User as UserIcon } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const authStore = useAuthStore()
const ruanganStore = useRuanganStore()
const { toast } = useToast()

const showAddForm = ref(false)
const searchQuery = ref('')
const formData = ref({
  name: '',
  user_id: '',
  header_img: null as string | null,
})

const users = ref<{ id: string; name: string; role: string }[]>([])

const filteredRuangan = ref(ruanganStore.ruangans)

const fetchUsers = async () => {
  const { data } = await supabase.from('users').select('id, name, role').order('name')

  if (data) {
    users.value = data
  }
}

onMounted(async () => {
  await ruanganStore.fetchRuangans()
  if (authStore.isAdmin) {
    fetchUsers()
  }
})

const openAddForm = () => {
  formData.value = {
    name: '',
    header_img: null,
    user_id: '',
  }
  showAddForm.value = true
}

const handleSubmit = async () => {
  if (!formData.value.name) return

  const success = await ruanganStore.createRuangan(formData.value)

  if (success) {
    showAddForm.value = false
    formData.value = {
      name: '',
      header_img: null,
      user_id: '',
    }
    toast({
      title: 'Berhasil',
      description: 'Ruangan baru berhasil dibuat.',
      variant: 'success',
    })
  } else {
    toast({
      title: 'Gagal',
      description: 'Gagal membuat ruangan.',
      variant: 'destructive',
    })
  }
}

const goToRoom = (id: number) => {
  router.push(`/rooms/${id}`)
}
</script>

<template>
  <ResponsiveWrapper>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Ruangan</h1>
          <p class="text-muted-foreground">Kelola ruangan dan aset di dalamnya</p>
        </div>

        <Button v-if="authStore.isAdmin" @click="openAddForm">
          <Plus class="mr-2 h-4 w-4" />
          Tambah Ruangan
        </Button>
      </div>

      <!-- Add Form (Mobile: could be Sheet, Desktop: inline) -->
      <Card v-if="showAddForm" class="border-primary">
        <CardHeader>
          <CardTitle>Tambah Ruangan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Nama Ruangan</Label>
              <Input
                id="name"
                v-model="formData.name"
                placeholder="Contoh: Ruang Kelas 1A"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="operator">Operator Penanggung Jawab</Label>
              <div class="relative">
                <select
                  id="operator"
                  v-model="formData.user_id"
                  class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Pilih Operator</option>
                  <option v-for="user in users" :key="user.id" :value="user.id">
                    {{ user.name }} ({{ user.role }})
                  </option>
                </select>
              </div>
            </div>

            <Base64Upload
              v-model="formData.header_img"
              label="Foto Ruangan"
              :aspect-ratio="16 / 9"
            />

            <div class="flex gap-2">
              <Button type="submit" :disabled="ruanganStore.isLoading">
                {{ ruanganStore.isLoading ? 'Menyimpan...' : 'Simpan' }}
              </Button>
              <Button type="button" variant="outline" @click="showAddForm = false"> Batal </Button>
            </div>

            <p v-if="ruanganStore.error" class="text-sm text-destructive">
              {{ ruanganStore.error }}
            </p>
          </form>
        </CardContent>
      </Card>

      <!-- Room List -->
      <div v-if="ruanganStore.ruangans.length === 0" class="text-center py-12">
        <Building2 class="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 class="mt-4 text-lg font-semibold">Belum ada ruangan</h3>
        <p class="text-muted-foreground">
          {{
            authStore.isAdmin
              ? 'Tambahkan ruangan pertama Anda'
              : 'Belum ada ruangan yang ditugaskan'
          }}
        </p>
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="ruangan in ruanganStore.ruangans"
          :key="ruangan.id"
          class="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
          @click="goToRoom(ruangan.id)"
        >
          <!-- Header Image -->
          <div v-if="ruangan.header_img" class="aspect-video w-full overflow-hidden bg-muted">
            <img :src="ruangan.header_img" :alt="ruangan.name" class="h-full w-full object-cover" />
          </div>
          <div
            v-else
            class="aspect-video w-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
          >
            <Building2 class="h-12 w-12 text-muted-foreground" />
          </div>

          <CardHeader>
            <CardTitle>{{ ruangan.name }}</CardTitle>
            <div class="flex items-center gap-2 pt-1" v-if="ruangan.user || authStore.isAdmin">
              <UserIcon class="h-3 w-3 text-muted-foreground" />
              <p class="text-sm text-muted-foreground truncate">
                {{
                  ruangan.user?.name || users.find((u) => u.id === ruangan.user_id)?.name || '...'
                }}
                <span v-if="ruangan.user?.role" class="text-xs">({{ ruangan.user.role }})</span>
              </p>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  </ResponsiveWrapper>
</template>
