/**
 * Toast Notification Store
 * Implements EPIC6-S1: Toast 通知系统
 */

import { create } from "zustand"

export type ToastType = "success" | "error" | "info" | "warning"

interface ToastState {
  message: string
  type: ToastType
  show: boolean
  duration: number
  showToast: (message: string, type?: ToastType, duration?: number) => void
  hideToast: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  message: "",
  type: "info",
  show: false,
  duration: 3000,
  showToast: (message, type = "info", duration = 3000) => {
    set({ message, type, show: true, duration })

    // Auto-hide after duration
    setTimeout(() => {
      if (get().show) {
        set({ show: false })
      }
    }, duration)
  },
  hideToast: () => set({ show: false }),
}))
