/**
 * Trends Service - Aggregates fetchers and clustering
 * Implements EPIC-5: 热榜系统
 */

import { RedditFetcher, TwitterFetcher, InstagramFetcher } from "./fetcher"
import { TrendClusterer } from "./cluster"
import type { RawTrend } from "./fetcher"
import type { ClusteredTopic } from "./cluster"

export { RedditFetcher, TwitterFetcher, InstagramFetcher }
export { TrendClusterer }
export type { RawTrend, ClusteredTopic }

/**
 * Fetch and cluster trends from multiple sources
 * @param options Configuration options
 * @returns Clustered topics (top 20)
 */
export async function fetchAndClusterTrends(options: {
  twitterApiKey?: string
  includeInstagram?: boolean
}): Promise<ClusteredTopic[]> {
  const allTrends: RawTrend[] = []

  // 1. Fetch from Reddit (primary source, always enabled)
  const redditFetcher = new RedditFetcher()
  const redditTrends = await redditFetcher.fetch()
  allTrends.push(...redditTrends)

  // 2. Fetch from Twitter (optional, requires API key)
  if (options.twitterApiKey) {
    const twitterFetcher = new TwitterFetcher(options.twitterApiKey)
    const twitterTrends = await twitterFetcher.fetch()
    allTrends.push(...twitterTrends)
  }

  // 3. Fetch from Instagram (optional)
  if (options.includeInstagram) {
    const instagramFetcher = new InstagramFetcher()
    const instagramTrends = await instagramFetcher.fetch()
    allTrends.push(...instagramTrends)
  }

  console.log(`[TrendsService] Fetched ${allTrends.length} raw trends`)

  // 4. Cluster
  const clusterer = new TrendClusterer()
  const topics = clusterer.cluster(allTrends)

  console.log(`[TrendsService] Clustered into ${topics.length} topics`)

  return topics
}
