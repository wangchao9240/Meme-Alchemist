/**
 * Spinner Component
 * Implements EPIC6-S1: 统一 Loading 组件
 */

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
}

export function Spinner({ size = "md", color }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const borderWidth = {
    sm: "border-2",
    md: "border-4",
    lg: "border-4",
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-gray-300 ${sizeClasses[size]} ${borderWidth[size]}`}
        style={{
          borderTopColor: color || "var(--primary)",
        }}
      />
    </div>
  )
}

/**
 * Centered Spinner with optional message
 */
export function SpinnerCentered({
  message,
  size = "lg",
}: {
  message?: string
  size?: "sm" | "md" | "lg"
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Spinner size={size} />
      {message && (
        <p className="text-sm text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  )
}
