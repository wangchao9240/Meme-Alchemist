/**
 * Trends Service - Aggregates fetchers and clustering
 * Implements EPIC-5: 热榜系统
 */

import { RedditFetcher, TwitterFetcher, InstagramFetcher } from "./fetcher"
import { TrendClusterer } from "./cluster"
import type { RawTrend } from "./fetcher"
import type { ClusteredTopic } from "./cluster"
import { tr } from "zod/v4/locales"

export { RedditFetcher, TwitterFetcher, InstagramFetcher }
export { TrendClusterer }
export type { RawTrend, ClusteredTopic }

/**
 * Fetch and cluster trends from multiple sources
 * @param options Configuration options
 * @returns Clustered topics (top 20)
 */
export async function fetchAndClusterTrends(
  options: {
    twitterApiKey?: string
    includeInstagram?: boolean
  } = {}
): Promise<ClusteredTopic[]> {
  const allTrends: RawTrend[] = []

  const fetchJobs: Array<{
    name: string
    promise: Promise<RawTrend[]>
  }> = [
    {
      name: "reddit",
      promise: new RedditFetcher().fetch(),
    },
  ]

  if (options.twitterApiKey) {
    fetchJobs.push({
      name: "twitter",
      promise: new TwitterFetcher(options.twitterApiKey).fetch(),
    })
  }

  if (options.includeInstagram) {
    fetchJobs.push({
      name: "instagram",
      promise: new InstagramFetcher().fetch(),
    })
  }

  const results = await Promise.allSettled(fetchJobs.map((job) => job.promise))

  results.forEach((result, index) => {
    const { name } = fetchJobs[index]

    if (result.status === "fulfilled") {
      console.log(
        `[TrendsService] ${name} returned ${result.value.length} trends`
      )
      allTrends.push(...result.value)
    } else {
      console.error(`[TrendsService] ${name} fetch failed:`, result.reason)
    }
  })

  console.log(`[TrendsService] Fetched ${allTrends.length} raw trends`)

  // 4. Cluster
  const clusterer = new TrendClusterer()
  const topics = clusterer.cluster(allTrends)

  console.log(`[TrendsService] Clustered into ${topics.length} topics`)

  return topics
}
