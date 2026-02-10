<script setup lang="ts">
import { ref, watch } from 'vue'
import { useImageHandler } from '@/composables/useImageHandler'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Camera, Upload, X, Loader2 } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    aspectRatio?: number
    maxSizeMB?: number
  }>(),
  {
    label: 'Upload Gambar',
    aspectRatio: 16 / 9,
    maxSizeMB: 0.25,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const { isLoading, error, preview, handleFileSelect, reset } = useImageHandler({
  maxSizeMB: props.maxSizeMB,
})

// Sync preview with modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    // Only update preview from modelValue if we don't have a local preview (e.g. initial load)
    // Avoid overwriting the optimistic blob URL immediately
    if (newValue && !preview.value) {
      preview.value = newValue
    }
  },
  { immediate: true },
)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Start upload process
    const { url, base64 } = await handleFileSelect(file)

    // Emit URL (Storage) if successful, fallback to base64 (Legacy)
    if (url) {
      emit('update:modelValue', url)
    } else if (base64) {
      emit('update:modelValue', base64)
    }
  }
}

const clearImage = () => {
  reset()
  emit('update:modelValue', null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-2">
    <Label v-if="label">{{ label }}</Label>

    <div class="relative group">
      <!-- Preview -->
      <div
        v-if="preview"
        class="relative overflow-hidden rounded-lg border bg-muted"
        :style="{ aspectRatio: aspectRatio }"
      >
        <img
          :src="preview"
          alt="Preview"
          class="h-full w-full object-cover transition-opacity duration-300"
          :class="{ 'opacity-50': isLoading }"
        />

        <!-- Loading Overlay -->
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm"
        >
          <Loader2 class="h-8 w-8 animate-spin text-primary" />
        </div>

        <!-- Remove button -->
        <Button
          v-if="!isLoading"
          type="button"
          variant="destructive"
          size="icon"
          class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
          @click="clearImage"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>

      <!-- Upload area -->
      <div
        v-else
        class="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/80 cursor-pointer"
        :style="{ aspectRatio: aspectRatio }"
        @click="!isLoading && triggerFileInput()"
      >
        <div class="flex gap-2">
          <Camera class="h-8 w-8 text-muted-foreground" />
          <Upload class="h-8 w-8 text-muted-foreground" />
        </div>

        <div class="text-center space-y-1">
          <p class="text-sm font-medium text-muted-foreground">
            {{ isLoading ? 'Memproses...' : 'Klik untuk Upload' }}
          </p>
          <p class="text-xs text-muted-foreground">Kamera atau Galeri</p>
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <!-- Error message -->
    <p v-if="error" class="text-sm text-destructive animate-in slide-in-from-top-1">
      {{ error }}
    </p>
  </div>
</template>
