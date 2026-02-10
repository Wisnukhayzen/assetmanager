import { ref } from 'vue'
import imageCompression from 'browser-image-compression'
import { supabase } from '@/lib/supabase'

export interface ImageHandlerOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  bucket?: string
  path?: string // Optional prefix for storage path
}

export function useImageHandler(options: ImageHandlerOptions = {}) {
  const {
    maxSizeMB = 0.25,
    maxWidthOrHeight = 1920,
    useWebWorker = true,
    bucket = 'images',
    path = '',
  } = options

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const preview = ref<string | null>(null)
  const base64String = ref<string | null>(null)
  const publicUrl = ref<string | null>(null)

  const handleFileSelect = async (
    file: File,
  ): Promise<{ base64: string | null; url: string | null }> => {
    isLoading.value = true
    error.value = null
    preview.value = URL.createObjectURL(file) // Optimistic preview

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File harus berupa gambar')
      }

      // Compress image
      const compressedFile = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight,
        useWebWorker,
      })

      // Convert to Base64 (legacy support)
      const base64 = await fileToBase64(compressedFile)
      base64String.value = base64

      // Upload to Supabase Storage
      const uploadedUrl = await uploadToStorage(compressedFile)
      publicUrl.value = uploadedUrl

      return { base64, url: uploadedUrl }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Gagal memproses gambar'
      console.error(err)
      return { base64: null, url: null }
    } finally {
      isLoading.value = false
    }
  }

  const uploadToStorage = async (file: File): Promise<string | null> => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl: url },
      } = supabase.storage.from(bucket).getPublicUrl(fileName)

      return url
    } catch (err) {
      console.error('Upload failed:', err)
      throw new Error('Gagal mengupload gambar ke storage')
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const reset = () => {
    isLoading.value = false
    error.value = null
    preview.value = null
    base64String.value = null
    publicUrl.value = null
  }

  return {
    isLoading,
    error,
    preview,
    base64String,
    publicUrl,
    handleFileSelect,
    reset,
  }
}
