<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
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
import { useAuthStore } from '@/stores/auth'
import { UserPlus, Trash2 } from 'lucide-vue-next'
import type { User } from '@/types/database'

const authStore = useAuthStore()
const { toast } = useToast()
const users = ref<User[]>([])
const isLoading = ref(false)
const showAddForm = ref(false)
const error = ref<string | null>(null)

// Form data for new user (Note: This is just for the DB record, actual auth user must be created in Supabase Dashboard)
const formData = ref({
  id: '',
  name: '',
  email: '',
  role: 'operator' as const,
})

const fetchUsers = async () => {
  isLoading.value = true
  error.value = null
  try {
    const { data, error: err } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (err) throw err
    users.value = data || []
  } catch (err) {
    console.error('Error fetching users:', err)
    toast({
      title: 'Gagal Memuat Data',
      description: 'Terjadi kesalahan saat mengambil daftar pengguna.',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formData.value.id || !formData.value.email || !formData.value.name) {
    toast({
      title: 'Validasi Gagal',
      description: 'Semua field harus diisi.',
      variant: 'destructive',
    })
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const { error: err } = await supabase.from('users').insert([formData.value])

    if (err) throw err

    await fetchUsers()
    showAddForm.value = false
    formData.value = { id: '', name: '', email: '', role: 'operator' }

    toast({
      title: 'Berhasil',
      description: 'Pengguna berhasil ditambahkan.',
      variant: 'success',
    })
  } catch (err) {
    console.error('Error creating user:', err)
    toast({
      title: 'Gagal Menambah Pengguna',
      description: err instanceof Error ? err.message : 'Terjadi kesalahan sistem.',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (id: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return

  isLoading.value = true
  try {
    const { error: err } = await supabase.from('users').delete().eq('id', id)

    if (err) throw err
    await fetchUsers()

    toast({
      title: 'Berhasil',
      description: 'Pengguna berhasil dihapus.',
      variant: 'success',
    })
  } catch (err) {
    console.error('Error deleting user:', err)
    toast({
      title: 'Gagal Menghapus',
      description: 'Gagal menghapus pengguna.',
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (authStore.isAdmin) {
    fetchUsers()
  }
})
</script>

<template>
  <ResponsiveWrapper>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Pengguna</h1>
          <p class="text-muted-foreground">Kelola akun admin dan operator</p>
        </div>
        <Button @click="showAddForm = !showAddForm">
          <UserPlus class="mr-2 h-4 w-4" />
          {{ showAddForm ? 'Tutup Form' : 'Tambah Pengguna' }}
        </Button>
      </div>

      <!-- Helper Alert -->
      <div
        class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200"
      >
        <p class="font-semibold">⚠️ Penting:</p>
        <p>
          Anda harus membuat user di <strong>Supabase Dashboard > Authentication</strong> terlebih
          dahulu, lalu copy <strong>User UID</strong>-nya ke sini.
        </p>
      </div>

      <!-- Add User Form -->
      <Card v-if="showAddForm" class="border-primary">
        <CardHeader>
          <CardTitle>Tambah Data Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="uid">User UID (dari Supabase Auth)</Label>
                <Input
                  id="uid"
                  v-model="formData.id"
                  placeholder="Contoh: 123e4567-e89b..."
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  v-model="formData.email"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              <div class="space-y-2">
                <Label for="name">Nama Lengkap</Label>
                <Input id="name" v-model="formData.name" placeholder="Nama User" required />
              </div>

              <div class="space-y-2">
                <Label for="role">Role</Label>
                <select
                  id="role"
                  v-model="formData.role"
                  class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div class="flex gap-2">
              <Button type="submit" :disabled="isLoading">
                {{ isLoading ? 'Menyimpan...' : 'Simpan Data User' }}
              </Button>
            </div>

            <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          </form>
        </CardContent>
      </Card>

      <!-- Users List -->
      <Card>
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead class="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in users" :key="user.id">
                <TableCell class="font-medium">{{ user.name }}</TableCell>
                <TableCell>{{ user.email }}</TableCell>
                <TableCell>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    :class="
                      user.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    "
                  >
                    {{ user.role }}
                  </span>
                </TableCell>
                <TableCell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    class="text-destructive hover:bg-destructive/10"
                    @click="deleteUser(user.id)"
                    :disabled="user.id === authStore.user?.id"
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow v-if="users.length === 0 && !isLoading">
                <TableCell colspan="4" class="h-24 text-center">
                  Tidak ada data pengguna
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </ResponsiveWrapper>
</template>
