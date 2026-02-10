<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg pr-8 overflow-hidden"
        :class="{
          'bg-white border-gray-200 text-gray-900': !toast.variant || toast.variant === 'default',
          'bg-red-50 border-red-200 text-red-900': toast.variant === 'destructive',
          'bg-green-50 border-green-200 text-green-900': toast.variant === 'success',
        }"
      >
        <!-- Icons -->
        <div class="shrink-0 mt-0.5">
          <CheckCircle v-if="toast.variant === 'success'" class="h-5 w-5 text-green-600" />
          <AlertCircle v-else-if="toast.variant === 'destructive'" class="h-5 w-5 text-red-600" />
          <Info v-else class="h-5 w-5 text-blue-600" />
        </div>

        <!-- Content -->
        <div class="grid gap-1">
          <h3 v-if="toast.title" class="font-semibold text-sm leading-none">
            {{ toast.title }}
          </h3>
          <p v-if="toast.description" class="text-sm opacity-90 leading-snug">
            {{ toast.description }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          @click="dismiss(toast.id)"
          class="absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none"
          :class="{
            'text-gray-500 hover:bg-gray-100': !toast.variant || toast.variant === 'default',
            'text-red-500 hover:bg-red-100': toast.variant === 'destructive',
            'text-green-500 hover:bg-green-100': toast.variant === 'success',
          }"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
