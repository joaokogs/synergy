"use client"

import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useToastStore, type ToastType } from "@/stores/toast-store"

const toastVariants = cva(
  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg animate-in slide-in-from-right-full fade-in duration-300",
  {
    variants: {
      type: {
        success: "border-green-500/30 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200",
        error: "border-red-500/30 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200",
        info: "border-blue-500/30 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
      },
    },
    defaultVariants: {
      type: "success",
    },
  }
)

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

function Toast({ id, message, type }: { id: string; message: string; type: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast)
  const Icon = iconMap[type]

  return (
    <div className={cn(toastVariants({ type }))}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => removeToast(id)}
        className="shrink-0 rounded-sm p-0.5 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}
