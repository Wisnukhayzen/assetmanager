<script setup lang="ts">
import { ref, onMounted, computed, type Ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useImageHandler } from '@/composables/useImageHandler'
import { useToast } from '@/composables/useToast'
import ResponsiveWrapper from '@/components/layout/ResponsiveWrapper.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Camera, User, Mail, Shield, Loader2, Save, X, Pencil } from 'lucide-vue-next'

const authStore = useAuthStore()
const { toast } = useToast()

const isEditing = ref(false)
const isSaving = ref(false)

const profileHandler = useImageHandler({
  bucket: 'images',
  path: 'profiles/avatars/',
  maxSizeMB: 0.15, // Reduced size to avoid storage limits
  maxWidthOrHeight: 800,
})

const headerHandler = useImageHandler({
  bucket: 'images',
  path: 'profiles/headers/',
  maxSizeMB: 0.3, // Reduced size for headers
  maxWidthOrHeight: 1280,
})

// Use explicit unwrapping for template stability
const profilePreview = profileHandler.preview as Ref<string | null>
const profileLoading = profileHandler.isLoading as Ref<boolean>
const headerPreview = headerHandler.preview as Ref<string | null>
const headerLoading = headerHandler.isLoading as Ref<boolean>

const photoInput = ref<HTMLInputElement | null>(null)
const headerInput = ref<HTMLInputElement | null>(null)

const profileData = computed(() => authStore.user || null)

const editFormData = ref({
  name: '',
  profile_picture: null as string | null,
  sampul_img: null as string | null,
})

const startEdit = () => {
  if (!authStore.user) return
  editFormData.value = {
    name: authStore.user.name,
    profile_picture: authStore.user.profile_picture || null,
    sampul_img: authStore.user.sampul_img || null,
  }
  profileHandler.preview.value = authStore.user.profile_picture || null
  headerHandler.preview.value = authStore.user.sampul_img || null
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  profileHandler.reset()
  headerHandler.reset()
}

const handleProfileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const { url } = await profileHandler.handleFileSelect(file)
    if (url) editFormData.value.profile_picture = url
  }
}

const handleHeaderUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const { url } = await headerHandler.handleFileSelect(file)
    if (url) editFormData.value.sampul_img = url
  }
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    const success = await authStore.updateProfile({
      name: editFormData.value.name,
      profile_picture: editFormData.value.profile_picture,
      sampul_img: editFormData.value.sampul_img,
    })

    if (success) {
      isEditing.value = false
      toast({
        title: 'Berhasil',
        description: 'Profil berhasil diperbarui.',
        variant: 'success',
      })
    } else {
      throw new Error(authStore.error || 'Gagal memperbarui profil')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    toast({
      title: 'Gagal',
      description:
        error instanceof Error ? error.message : 'Gagal memperbarui profil. Silakan coba lagi.',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}

const removePhoto = () => {
  editFormData.value.profile_picture = null
  profileHandler.preview.value = null
}

const removeHeader = () => {
  editFormData.value.sampul_img = null
  headerHandler.preview.value = null
}

const roleLabel = computed(() => {
  return profileData.value?.role === 'admin' ? 'Administrator' : 'Operator'
})

const roleColor = computed(() => {
  return profileData.value?.role === 'admin'
    ? 'bg-purple-100 text-purple-700'
    : 'bg-blue-100 text-blue-700'
})

onMounted(async () => {
  if (!authStore.user) {
    await authStore.initialize()
  }
})
</script>

<template>
  <ResponsiveWrapper v-if="profileData">
    <div class="max-w-4xl mx-auto space-y-6 pb-12">
      <!-- Header with background image or gradient -->
      <div
        class="relative h-64 rounded-2xl overflow-hidden shadow-lg group"
        :class="
          !profileData.sampul_img && !editFormData.sampul_img
            ? 'bg-gradient-to-br from-primary via-primary/80 to-primary/60'
            : 'bg-muted'
        "
      >
        <!-- Actual Header Image -->
        <img
          v-if="isEditing ? headerPreview : profileData.sampul_img"
          :src="(isEditing ? headerPreview : profileData.sampul_img) || ''"
          alt="Profile Header"
          class="w-full h-full object-cover"
        />

        <div class="absolute inset-0 bg-black/20"></div>

        <!-- Edit Header Button (Only in edit mode) -->
        <div
          v-if="isEditing"
          class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          @click="headerInput?.click()"
        >
          <div class="text-center text-white">
            <Camera class="w-10 h-10 mx-auto mb-2" />
            <p class="font-medium">Ubah Sampul</p>
          </div>
        </div>

        <div
          v-if="headerLoading"
          class="absolute inset-0 flex items-center justify-center bg-black/60 z-20"
        >
          <Loader2 class="w-10 h-10 text-white animate-spin" />
        </div>

        <div
          v-if="isEditing && (editFormData.sampul_img || profileData.sampul_img)"
          class="absolute top-4 right-4 z-30"
        >
          <button
            @click.stop="removeHeader"
            class="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h1 class="text-4xl font-bold text-white drop-shadow-lg opacity-30">Profil</h1>
        </div>
      </div>

      <!-- Profile Section - Centered Over Header -->
      <div class="relative -mt-32 px-4 flex flex-col items-center">
        <div class="relative">
          <!-- Profile Picture Circle -->
          <div
            class="relative w-48 h-48 rounded-full border-8 border-background shadow-2xl bg-white overflow-hidden group/avatar"
          >
            <img
              v-if="isEditing ? profilePreview : profileData.profile_picture"
              :src="(isEditing ? profilePreview : profileData.profile_picture) || ''"
              alt="Profile"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10"
            >
              <User class="w-20 h-20 text-primary/40" />
            </div>

            <!-- Upload button overlay (only in edit mode) -->
            <div
              v-if="isEditing"
              class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
              @click="photoInput?.click()"
            >
              <div class="text-center text-white">
                <Camera class="w-10 h-10 mx-auto mb-1" />
                <p class="text-xs font-medium">Ubah Foto</p>
              </div>
            </div>

            <!-- Loading overlay -->
            <div
              v-if="profileLoading"
              class="absolute inset-0 bg-black/70 flex items-center justify-center"
            >
              <Loader2 class="w-10 h-10 text-white animate-spin" />
            </div>
          </div>

          <!-- Edit button badge -->
          <button
            v-if="isEditing"
            @click="photoInput?.click()"
            class="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors z-10 border-4 border-background"
            :disabled="profileLoading"
          >
            <Camera class="w-5 h-5" />
          </button>

          <!-- Hidden inputs -->
          <input
            ref="photoInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleProfileUpload"
          />
          <input
            ref="headerInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleHeaderUpload"
          />
        </div>

        <div class="mt-4 text-center">
          <h2 class="text-3xl font-bold text-gray-900">{{ profileData.name }}</h2>
          <div class="mt-2">
            <Badge :class="roleColor" class="text-sm px-6 py-1.5 rounded-full shadow-sm">
              <Shield class="w-4 h-4 mr-1.5" />
              {{ roleLabel }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Profile Info Card -->
      <Card class="shadow-xl border-none">
        <CardContent class="p-8 space-y-8">
          <!-- View Mode -->
          <div v-if="!isEditing" class="grid gap-6 sm:grid-cols-2">
            <div
              class="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group"
            >
              <div class="p-4 bg-blue-100 rounded-xl group-hover:bg-blue-600 transition-colors">
                <User class="w-6 h-6 text-blue-600 group-hover:text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-slate-500 font-medium">Nama Lengkap</p>
                <p class="font-bold text-slate-900 text-lg">{{ profileData.name }}</p>
              </div>
            </div>

            <div
              class="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group"
            >
              <div class="p-4 bg-green-100 rounded-xl group-hover:bg-green-600 transition-colors">
                <Mail class="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-slate-500 font-medium">Email</p>
                <p class="font-bold text-slate-900 text-lg">{{ profileData.email }}</p>
              </div>
            </div>

            <div
              class="flex items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-md group sm:col-span-2"
            >
              <div class="p-4 bg-purple-100 rounded-xl group-hover:bg-purple-600 transition-colors">
                <Shield class="w-6 h-6 text-purple-600 group-hover:text-white" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-slate-500 font-medium">Role Pengguna</p>
                <p class="font-bold text-slate-900 text-lg">{{ roleLabel }}</p>
              </div>
            </div>

            <!-- Edit Button -->
            <div class="pt-6 sm:col-span-2">
              <Button
                @click="startEdit"
                class="w-full h-14 text-lg rounded-xl shadow-lg hover:shadow-primary/20 transition-all"
                size="lg"
              >
                <Pencil class="mr-2 h-5 w-5" />
                Edit Profil Lengkap
              </Button>
            </div>
          </div>

          <!-- Edit Mode -->
          <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div class="grid gap-6">
              <div class="space-y-2.5">
                <Label for="name" class="text-base font-semibold ml-1">Nama Lengkap</Label>
                <Input
                  id="name"
                  v-model="editFormData.name"
                  placeholder="Masukkan nama lengkap"
                  class="h-14 text-lg rounded-xl border-slate-200 focus:ring-primary/20"
                />
              </div>

              <div class="space-y-2.5">
                <Label class="text-base font-semibold ml-1 text-slate-400">Email (Permanen)</Label>
                <Input
                  :value="profileData.email"
                  disabled
                  class="h-14 bg-slate-50 rounded-xl text-slate-400 border-slate-100"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4 pt-4">
              <Button
                variant="outline"
                @click="cancelEdit"
                :disabled="isSaving"
                class="flex-1 h-14 text-lg rounded-xl"
                size="lg"
              >
                <X class="mr-2 h-5 w-5" />
                Batal
              </Button>
              <Button
                @click="saveProfile"
                :disabled="isSaving || profileLoading || headerLoading"
                class="flex-1 h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                size="lg"
              >
                <Save v-if="!isSaving" class="mr-2 h-5 w-5" />
                <Loader2 v-else class="mr-2 h-5 w-5 animate-spin" />
                {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </ResponsiveWrapper>

  <div v-else class="flex items-center justify-center min-h-[60vh]">
    <Loader2 class="w-10 h-10 animate-spin text-primary" />
  </div>
</template>
