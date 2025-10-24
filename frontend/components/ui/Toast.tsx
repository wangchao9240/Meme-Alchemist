/**
 * Toast Notification Component
 * Implements EPIC6-S1: Toast 通知系统
 */

"use client"

import { useToastStore, type ToastType } from "@/lib/stores/toast"
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"

export function Toast() {
  const { message, type, show, hideToast } = useToastStore()

  if (!show) return null

  const config: Record<
    ToastType,
    { bg: string; icon: React.ElementType; iconColor: string }
  > = {
    success: {
      bg: "bg-green-500",
      icon: CheckCircle,
      iconColor: "text-white",
    },
    error: {
      bg: "bg-red-500",
      icon: XCircle,
      iconColor: "text-white",
    },
    info: {
      bg: "bg-blue-500",
      icon: Info,
      iconColor: "text-white",
    },
    warning: {
      bg: "bg-yellow-500",
      icon: AlertTriangle,
      iconColor: "text-white",
    },
  }

  const { bg, icon: Icon, iconColor } = config[type]

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 animate-slideUp ${bg} text-white font-medium flex items-center gap-3 max-w-[90vw] safe-area-inset-bottom`}
    >
      <Icon className={iconColor} size={20} />
      <span className="flex-1">{message}</span>
      <button
        onClick={hideToast}
        className="touch-manipulation"
        aria-label="Close toast"
      >
        <X size={18} />
      </button>
    </div>
  )
}
