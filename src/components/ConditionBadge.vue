<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import type { AssetKondisi } from '@/types/database'

const props = defineProps<{
  kondisi: AssetKondisi
}>()

const variant = computed(() => {
  switch (props.kondisi) {
    case 'baik':
      return 'success'
    case 'rusak_ringan':
      return 'warning'
    case 'rusak_berat':
      return 'danger'
    default:
      return 'default'
  }
})

const label = computed(() => {
  switch (props.kondisi) {
    case 'baik':
      return 'Baik'
    case 'rusak_ringan':
      return 'Rusak Ringan'
    case 'rusak_berat':
      return 'Rusak Berat'
    default:
      return props.kondisi
  }
})
</script>

<template>
  <Badge :variant="variant">
    {{ label }}
  </Badge>
</template>
