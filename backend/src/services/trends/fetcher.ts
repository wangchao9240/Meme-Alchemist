/**
 * Trend Fetchers for different platforms
 * Implements EPIC5-S1: 热榜抓取器
 */

export interface RawTrend {
  source: string
  rank: number
  title: string
  url?: string
  hash: string
}

export interface TrendSource {
  name: string
  fetch(): Promise<RawTrend[]>
}

/**
 * Reddit Trend Fetcher
 * - Free public JSON API, no authentication required
 * - Recommended as primary source (P0)
 */
export class RedditFetcher implements TrendSource {
  name = "reddit"
  private subreddits = ["all", "popular"]

  async fetch(): Promise<RawTrend[]> {
    const trends: RawTrend[] = []

    try {
      // Reddit provides public JSON API
      const response = await fetch(
        "https://www.reddit.com/r/all/hot.json?limit=50",
        {
          headers: {
            "User-Agent": "MemeAlchemist/1.0",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`)
      }

      const data = (await response.json()) as {
        data?: {
          children?: Array<{
            data?: {
              title?: string
              permalink?: string
            }
          }>
        }
      }

      if (!data.data || !data.data.children) {
        throw new Error("Invalid Reddit API response")
      }

      data.data.children.forEach((post, i: number) => {
        if (post.data && post.data.title) {
          trends.push({
            source: this.name,
            rank: i + 1,
            title: post.data.title,
            url: `https://reddit.com${post.data.permalink}`,
            hash: this.hashTitle(post.data.title),
          })
        }
      })

      console.log(`[RedditFetcher] Fetched ${trends.length} trends`)
      return trends
    } catch (error) {
      console.error(`[Fetcher] ${this.name} failed:`, error)
      return []
    }
  }

  private hashTitle(title: string): string {
    return title.toLowerCase().replace(/\s+/g, "")
  }
}

/**
 * Twitter Trends Fetcher
 * - Requires API Key (optional, P1)
 * - Use only if TWITTER_API_KEY is available
 */
export class TwitterFetcher implements TrendSource {
  name = "twitter"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async fetch(): Promise<RawTrend[]> {
    try {
      // Twitter API v2 - Get trending topics
      // WOEID: 1 = Worldwide
      const response = await fetch(
        "https://api.twitter.com/2/trends/place.json?id=1",
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`)
      }

      const data = (await response.json()) as Array<{
        trends?: Array<{
          name?: string
          url?: string
        }>
      }>

      if (!data || !data[0] || !data[0].trends) {
        throw new Error("Invalid Twitter API response")
      }

      const trends = data[0].trends
        .slice(0, 50)
        .filter((trend) => trend.name) // Filter out trends without names
        .map((trend, i: number) => ({
          source: this.name,
          rank: i + 1,
          title: trend.name!,
          url: trend.url,
          hash: this.hashTitle(trend.name!),
        }))

      console.log(`[TwitterFetcher] Fetched ${trends.length} trends`)
      return trends
    } catch (error) {
      console.error(`[Fetcher] ${this.name} failed:`, error)
      return []
    }
  }

  private hashTitle(title: string): string {
    return title.toLowerCase().replace(/[#\s]+/g, "")
  }
}

/**
 * Instagram Trending Fetcher
 * - Fallback to popular hashtags (official API has limitations)
 * - Optional source (P2)
 */
export class InstagramFetcher implements TrendSource {
  name = "instagram"

  async fetch(): Promise<RawTrend[]> {
    try {
      // Note: Instagram official API has limited access to trending data
      // Using fallback: predefined popular hashtags
      const popularHashtags = [
        "#instagood",
        "#photooftheday",
        "#fashion",
        "#beautiful",
        "#art",
        "#photography",
        "#travel",
        "#nature",
        "#food",
        "#fitness",
        "#motivation",
        "#lifestyle",
        "#design",
        "#cat",
        "#dog",
      ]

      const trends = popularHashtags.map((tag, i) => ({
        source: this.name,
        rank: i + 1,
        title: tag,
        url: `https://www.instagram.com/explore/tags/${tag.slice(1)}/`,
        hash: this.hashTitle(tag),
      }))

      console.log(`[InstagramFetcher] Fetched ${trends.length} trends`)
      return trends
    } catch (error) {
      console.error(`[Fetcher] ${this.name} failed:`, error)
      return []
    }
  }

  private hashTitle(title: string): string {
    return title.toLowerCase().replace(/[#\s]+/g, "")
  }
}
