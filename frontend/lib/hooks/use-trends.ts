/**
 * SWR Hook for Trends API
 * Implements EPIC6-S3: API 缓存
 */

import useSWR from "swr"
import { fetchTrends } from "../api-client"
import type { TrendsResponse } from "@meme-alchemist/shared/types"

const TRENDS_KEY = "/api/trends"

export function useTrends() {
  const { data, error, isLoading, mutate } = useSWR<TrendsResponse>(
    TRENDS_KEY,
    fetchTrends,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute deduplication
      refreshInterval: 0, // No auto-refresh (trends update daily via Cron)
      fallbackData: undefined,
    }
  )

  return {
    trends: data?.topics ?? [],
    date: data?.date,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}
