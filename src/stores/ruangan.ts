import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { Ruangan } from '@/types/database'

export const useRuanganStore = defineStore('ruangan', () => {
  const authStore = useAuthStore()

  const ruangans = ref<Ruangan[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchRuangans = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Join with users table to get name and role
      let query = supabase.from('ruangans').select('*, user:users(name, role, profile_picture)')

      // Operators only see their assigned rooms
      if (authStore.isOperator && authStore.user) {
        query = query.eq('user_id', authStore.user.id)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Cast the response to match Ruangan type (which includes optional user)
      ruangans.value = (data || []) as unknown as Ruangan[]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Gagal memuat ruangan'
    } finally {
      isLoading.value = false
    }
  }

  const getRuanganById = computed(() => {
    return (id: number) => ruangans.value.find((r) => r.id === id)
  })

  // Optimistic Create
  const createRuangan = async (ruangan: Omit<Ruangan, 'id' | 'created_at' | 'updated_at'>) => {
    // 1. Generate Temp ID
    const tempId = -Date.now()
    const optimisticData = {
      ...ruangan,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Ruangan

    // 2. Update UI Immediately
    ruangans.value.unshift(optimisticData)

    // 3. Sync with Server in Background
    supabase
      .from('ruangans')
      .insert(ruangan)
      .select('*, user:users(name, role, profile_picture)')
      .single()
      .then(({ data, error: insertError }) => {
        if (insertError) {
          // Revert on failure
          console.error('Failed to create room:', insertError)
          ruangans.value = ruangans.value.filter((r) => r.id !== tempId)
          error.value = 'Gagal membuat ruangan'
        } else if (data) {
          // Replace temp with real data
          const index = ruangans.value.findIndex((r) => r.id === tempId)
          if (index !== -1) {
            ruangans.value[index] = data as unknown as Ruangan
          }
        }
      })

    // Return the optimistic data
    return optimisticData
  }

  // Optimistic Update
  const updateRuangan = async (id: number, updates: Partial<Ruangan>) => {
    // 1. Snapshot for Revert
    const index = ruangans.value.findIndex((r) => r.id === id)
    if (index === -1) return null
    const originalData = { ...ruangans.value[index] }

    // 2. Update UI Immediately
    // We cast to Ruangan to avoid "undefined" issues from Partial updates
    const optimisticData = {
      ...originalData,
      ...updates,
      id,
      updated_at: new Date().toISOString(),
    } as Ruangan

    ruangans.value[index] = optimisticData

    // 3. Sync with Server
    supabase
      .from('ruangans')
      .update(updates)
      .eq('id', id)
      .select('*, user:users(name, role, profile_picture)')
      .single()
      .then(({ data, error: updateError }) => {
        if (updateError) {
          // Revert on failure
          console.error('Failed to update room:', updateError)
          if (index !== -1) {
            ruangans.value[index] = originalData as any;
          }
          error.value = 'Gagal mengupdate ruangan'
        } else if (data) {
          // Confirm update
          if (index !== -1) {
            ruangans.value[index] = data as unknown as Ruangan
          }
        }
      })

    // Return optimistic data
    return optimisticData
  }

  // Optimistic Delete
  const deleteRuangan = async (id: number) => {
    // 1. Snapshot
    const index = ruangans.value.findIndex((r) => r.id === id)
    if (index === -1) return false
    const originalData = { ...ruangans.value[index] }

    // 2. Remove Immediately
    ruangans.value = ruangans.value.filter((r) => r.id !== id)

    // 3. Sync
    supabase
      .from('ruangans')
      .delete()
      .eq('id', id)
      .then(({ error: deleteError }) => {
        if (deleteError) {
          // Revert
          console.error('Failed to delete room:', deleteError)
          ruangans.value[index] = originalData as any; // Insert back
          error.value = 'Gagal menghapus ruangan'
        }
      })

    return true
  }

  return {
    ruangans,
    isLoading,
    error,
    getRuanganById,
    fetchRuangans,
    createRuangan,
    updateRuangan,
    deleteRuangan,
  }
})
