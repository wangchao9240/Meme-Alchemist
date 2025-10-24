/**
 * SWR Hook for Facts API
 * Implements EPIC6-S3: API 缓存
 */

import useSWR from "swr"
import { fetchFacts } from "../api-client"
import type { JitFetchResponse } from "@meme-alchemist/shared/types"

interface UseFactsOptions {
  topic: string
  collections?: string[]
  limit?: number
}

export function useFacts({
  topic,
  collections = [],
  limit = 12,
}: UseFactsOptions) {
  // Create a unique key based on parameters
  const key = topic
    ? `/api/jit_fetch?topic=${topic}&collections=${collections.join(
        ","
      )}&limit=${limit}`
    : null

  const { data, error, isLoading, mutate } = useSWR<JitFetchResponse>(
    key,
    () => fetchFacts({ topic, collections, limit }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds deduplication
      refreshInterval: 0,
      fallbackData: undefined,
    }
  )

  return {
    facts: data?.candidates ?? [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  }
}
