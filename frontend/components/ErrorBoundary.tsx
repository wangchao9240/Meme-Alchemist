/**
 * Error Boundary Component
 * Implements EPIC6-S1: 错误边界
 */

"use client"

import { Component, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: "var(--background-dark)" }}
        >
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1
              className="text-2xl font-bold mb-4"
              style={{ color: "var(--on-surface-dark)" }}
            >
              Oops! Something went wrong
            </h1>

            <p
              className="text-base mb-6"
              style={{ color: "var(--on-surface-variant-dark)" }}
            >
              We encountered an unexpected error. Please try refreshing the
              page.
            </p>

            {this.state.error && process.env.NODE_ENV === "development" && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                  Error details (dev only)
                </summary>
                <pre className="text-xs text-red-400 overflow-auto p-4 bg-gray-900 rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-lg font-bold text-white touch-manipulation"
              style={{ backgroundColor: "var(--primary)" }}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
