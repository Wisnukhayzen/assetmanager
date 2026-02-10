import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isOperator = computed(() => user.value?.role === 'operator')

  const initialize = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          user.value = null
        }
      })
    } catch (err) {
      console.error('Auth initialization error:', err)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError
      user.value = data
    } catch (err) {
      console.error('Error fetching user profile:', err)
    }
  }

  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login gagal'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user.value) return false

    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      user.value = data
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Update gagal'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isOperator,
    initialize,
    login,
    logout,
    updateProfile,
  }
})
