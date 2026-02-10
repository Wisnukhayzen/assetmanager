<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const router = useRouter()
const authStore = useAuthStore()
const { toast } = useToast()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return
  }

  isLoading.value = true
  const success = await authStore.login(email.value, password.value)

  if (success) {
    toast({
      title: 'Login Berhasil',
      description: 'Selamat datang kembali!',
      variant: 'success',
    })
    router.push('/dashboard')
  } else {
    toast({
      title: 'Login Gagal',
      description: authStore.error || 'Cek kembali email dan password Anda.',
      variant: 'destructive',
    })
  }

  isLoading.value = false
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4"
  >
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1 text-center">
        <div class="mb-4">
          <h1 class="text-4xl font-bold text-primary">Satup App</h1>
          <p class="text-sm text-muted-foreground">Asset Management System</p>
        </div>
        <CardTitle class="text-2xl">Login</CardTitle>
        <p class="text-sm text-muted-foreground">Masukkan email dan password untuk melanjutkan</p>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="nama@example.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
              :disabled="isLoading"
            />
          </div>

          <Button type="submit" class="w-full" :disabled="isLoading">
            {{ isLoading ? 'Memproses...' : 'Login' }}
          </Button>

          <p v-if="authStore.error" class="text-sm text-destructive text-center">
            {{ authStore.error }}
          </p>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
