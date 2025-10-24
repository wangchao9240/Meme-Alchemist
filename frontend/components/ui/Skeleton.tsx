/**
 * Skeleton Components
 * Implements EPIC6-S1: 骨架屏组件
 */

export function FactCardSkeleton() {
  return (
    <div className="animate-pulse border-2 border-transparent rounded-lg p-4 bg-gray-800">
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
    </div>
  )
}

export function TrendCardSkeleton() {
  return (
    <div className="animate-pulse aspect-[3/4] rounded-xl overflow-hidden bg-gray-800">
      <div className="h-full w-full flex items-end p-3">
        <div className="w-full">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

export function MemeImageSkeleton() {
  return (
    <div className="animate-pulse w-full aspect-square rounded-xl bg-gray-800">
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-gray-600">
          <svg
            className="w-16 h-16"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
