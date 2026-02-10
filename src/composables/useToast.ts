import { ref } from 'vue'

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  action?: {
    label: string
    onClick: () => void
  }
}

const toasts = ref<ToasterToast[]>([])

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

function toast(props: Omit<ToasterToast, 'id'>) {
  const id = genId()

  const update = (props: ToasterToast) => updateToast({ ...props, id })

  const dismiss = () => dismissToast(id)

  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

function updateToast(toast: ToasterToast) {
  dispatch({
    type: 'UPDATE_TOAST',
    toast,
  })
}

function dismissToast(toastId?: string) {
  dispatch({
    type: 'DISMISS_TOAST',
    toastId,
  })
}

function dispatch(action: any) {
  switch (action.type) {
    case 'ADD_TOAST':
      toasts.value = [action.toast, ...toasts.value].slice(0, TOAST_LIMIT)
      setTimeout(() => {
        dismissToast(action.toast.id)
      }, 5000) // Auto dismiss after 5 seconds
      break
    case 'UPDATE_TOAST':
      toasts.value = toasts.value.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t,
      )
      break
    case 'DISMISS_TOAST':
      toasts.value = toasts.value.filter((t) => t.id !== action.toastId) // Simplistic dismiss (ignores animation time for now)
      break
  }
}

export { toast, useToast }

function useToast() {
  return {
    toasts,
    toast,
    dismiss: dismissToast,
  }
}
