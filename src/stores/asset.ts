import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './auth'
import type { Asset, AssetWithRuangan, DashboardStats } from '@/types/database'

export const useAssetStore = defineStore('asset', () => {
  const authStore = useAuthStore()

  const assets = ref<AssetWithRuangan[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAssets = async (ruanganId?: number) => {
    isLoading.value = true
    error.value = null

    try {
      let query = supabase.from('assets').select('*, ruangan:ruangans(*)')

      if (ruanganId) {
        query = query.eq('ruangan_id', ruanganId)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      assets.value = data || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Gagal memuat aset'
    } finally {
      isLoading.value = false
    }
  }

  const stats = computed((): DashboardStats => {
    return {
      totalAssets: assets.value.length,
      baik: assets.value.filter((a) => a.kondisi === 'baik').length,
      rusakRingan: assets.value.filter((a) => a.kondisi === 'rusak_ringan').length,
      rusakBerat: assets.value.filter((a) => a.kondisi === 'rusak_berat').length,
    }
  })

  const getAssetById = computed(() => {
    return (id: string) => assets.value.find((a) => a.id === id)
  })

  // Optimistic Create
  const createAsset = async (asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) => {
    // 1. Generate Temp ID
    const tempId = `temp-${Date.now()}`

    // Create optimistic object (without ruangan details initially)
    const optimisticAsset: AssetWithRuangan = {
      ...asset,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ruangan: undefined, // Will be populated after sync
    }

    // 2. Update UI Immediately
    assets.value.unshift(optimisticAsset)

    // 3. Sync with Server
    supabase
      .from('assets')
      .insert(asset)
      .select('*, ruangan:ruangans(*)')
      .single()
      .then(({ data, error: insertError }) => {
        if (insertError) {
          // Revert
          console.error('Failed to create asset:', insertError)
          assets.value = assets.value.filter((a) => a.id !== tempId)
          error.value = 'Gagal membuat aset'
        } else if (data) {
          // Replace temp with real
          const index = assets.value.findIndex((a) => a.id === tempId)
          if (index !== -1) {
            assets.value[index] = data
          }
        }
      })

    return optimisticAsset
  }

  // Optimistic Update
  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    // 1. Snapshot
    const index = assets.value.findIndex((a) => a.id === id)
    if (index === -1) return null
    const originalData = { ...assets.value[index] }

    // 2. Update UI Immediately
    const optimisticData = { ...originalData, ...updates, updated_at: new Date().toISOString() }
    //assets.value[index] = optimisticData
    assets.value[index] = optimisticData as any;

    // 3. Sync
    supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select('*, ruangan:ruangans(*)')
      .single()
      .then(({ data, error: updateError }) => {
        if (updateError) {
          // Revert
          console.error('Failed to update asset:', updateError)
          if (index !== -1) {
            assets.value[index] = optimisticData as any;
          }
          error.value = 'Gagal mengupdate aset'
        } else if (data) {
          // Confirm
          if (index !== -1) {
            assets.value[index] = data
          }
        }
      })

    return optimisticData
  }

  // Optimistic Delete
  const deleteAsset = async (id: string) => {
    // 1. Snapshot
    const index = assets.value.findIndex((a) => a.id === id)
    if (index === -1) return false
    const originalData = { ...assets.value[index] }

    // 2. Remove Immediately
    assets.value = assets.value.filter((a) => a.id !== id)

    // 3. Sync
    supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .then(({ error: deleteError }) => {
        if (deleteError) {
          // Revert
          console.error('Failed to delete asset:', deleteError)
          assets.value.splice(index, 0, originalData)
          error.value = 'Gagal menghapus aset'
        }
      })

    return true
  }

  return {
    assets,
    isLoading,
    error,
    stats,
    getAssetById,
    fetchAssets,
    createAsset,
    updateAsset,
    deleteAsset,
  }
})
