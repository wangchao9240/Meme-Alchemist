/**
 * Trend Clustering Algorithm
 * Implements EPIC5-S2: 聚类算法
 */

import type { RawTrend } from "./fetcher"

export interface ClusteredTopic {
  topic_id: string
  label: string // representative title
  score: number
  samples: string[] // variant titles
  sources?: string[] // source platforms
}

export class TrendClusterer {
  private readonly SIMILARITY_THRESHOLD = 0.6

  /**
   * Cluster raw trends into topics
   * @param trends Raw trends from multiple sources
   * @returns Clustered and ranked topics (top 20)
   */
  cluster(trends: RawTrend[]): ClusteredTopic[] {
    // 1. Normalize titles
    const normalized = this.normalize(trends)

    // 2. Deduplicate (exact matches)
    const unique = this.deduplicate(normalized)

    // 3. Cluster by similarity
    const clusters = this.clusterBySimilarity(unique)

    // 4. Score and rank
    const scored = this.scoreAndRank(clusters)

    // 5. Return top 20
    return scored.slice(0, 20)
  }

  /**
   * Normalize trend titles (remove special chars, trim)
   */
  private normalize(trends: RawTrend[]): RawTrend[] {
    return trends.map((t) => ({
      ...t,
      title: t.title.replace(/[#\[\]【】]/g, "").trim(),
    }))
  }

  /**
   * Remove exact duplicates based on hash
   */
  private deduplicate(trends: RawTrend[]): RawTrend[] {
    const seen = new Set<string>()
    return trends.filter((t) => {
      if (seen.has(t.hash)) return false
      seen.add(t.hash)
      return true
    })
  }

  /**
   * Cluster trends by Jaccard similarity
   */
  private clusterBySimilarity(trends: RawTrend[]): ClusteredTopic[] {
    const clusters: ClusteredTopic[] = []
    const used = new Set<number>()

    for (let i = 0; i < trends.length; i++) {
      if (used.has(i)) continue

      const cluster: ClusteredTopic = {
        topic_id: `topic_${i}_${Date.now()}`,
        label: trends[i].title,
        score: 0,
        samples: [trends[i].title],
        sources: [trends[i].source],
      }

      // Find similar trends
      for (let j = i + 1; j < trends.length; j++) {
        if (used.has(j)) continue

        const similarity = this.jaccardSimilarity(
          trends[i].title,
          trends[j].title
        )

        if (similarity > this.SIMILARITY_THRESHOLD) {
          cluster.samples.push(trends[j].title)
          if (!cluster.sources!.includes(trends[j].source)) {
            cluster.sources!.push(trends[j].source)
          }
          used.add(j)
        }
      }

      clusters.push(cluster)
      used.add(i)
    }

    return clusters
  }

  /**
   * Calculate Jaccard similarity between two strings
   * Similarity = |intersection| / |union|
   */
  private jaccardSimilarity(a: string, b: string): number {
    const tokensA = new Set(this.tokenize(a))
    const tokensB = new Set(this.tokenize(b))

    const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)))
    const union = new Set([...tokensA, ...tokensB])

    return intersection.size / union.size
  }

  /**
   * Tokenize text (split by space and punctuation)
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/[\s,，、。！？.!?]+/)
      .filter((t) => t.length > 0)
  }

  /**
   * Score and rank clusters
   * Score = number of variants (cluster size)
   */
  private scoreAndRank(clusters: ClusteredTopic[]): ClusteredTopic[] {
    return clusters
      .map((c) => ({
        ...c,
        score: c.samples.length,
      }))
      .sort((a, b) => b.score - a.score)
  }
}
