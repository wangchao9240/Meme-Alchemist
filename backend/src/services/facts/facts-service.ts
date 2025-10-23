import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Fact, FactCandidate } from "@meme-alchemist/shared/types"

/**
 * FactsService - 事实检索服务
 *
 * 提供基于 tags 的事实检索功能，支持智能排序和过滤
 */
export class FactsService {
  private supabase: SupabaseClient

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Workers 环境不需要会话持久化
      },
    })
  }

  /**
   * 根据 tags 检索事实卡片
   *
   * @param tags - 标签数组（任一匹配即可）
   * @param limit - 返回数量限制
   * @returns 事实候选列表，按 confidence 降序排列
   */
  async fetchFactsByTags(
    tags: string[],
    limit: number = 6
  ): Promise<FactCandidate[]> {
    try {
      // 查询包含任一 tag 的 facts
      // 使用 overlaps 操作符进行数组重叠查询
      const { data, error } = await this.supabase
        .from("facts")
        .select("id, quote, source_title, url, level, confidence")
        .overlaps("tags", tags) // 数组重叠查询（OR 逻辑）
        .in("level", ["A", "B"]) // 只返回高质量事实
        .order("confidence", { ascending: false }) // 按置信度降序
        .limit(limit)

      if (error) {
        console.error("[FactsService] Query error:", error)
        throw new Error(`Failed to fetch facts: ${error.message}`)
      }

      console.log(
        `[FactsService] Found ${data?.length || 0} facts for tags: ${tags.join(
          ", "
        )}`
      )

      return (data || []).map((fact) => ({
        id: fact.id,
        quote: fact.quote,
        source_title: fact.source_title || "Unknown Source",
        url: fact.url,
        level: fact.level as "A" | "B" | "C" | "D",
        confidence: fact.confidence,
      }))
    } catch (error) {
      console.error("[FactsService] fetchFactsByTags error:", error)
      throw error
    }
  }

  /**
   * 根据 ID 获取完整的事实信息
   *
   * @param id - 事实 UUID
   * @returns 完整的事实对象或 null
   */
  async getFactById(id: string): Promise<Fact | null> {
    try {
      const { data, error } = await this.supabase
        .from("facts")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null
        }
        throw new Error(`Failed to get fact: ${error.message}`)
      }

      return data as Fact
    } catch (error) {
      console.error("[FactsService] getFactById error:", error)
      throw error
    }
  }

  /**
   * 获取所有可用的 tags（用于前端 Collection 列表）
   *
   * @returns 去重后的 tags 数组
   */
  async getAllTags(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.from("facts").select("tags")

      if (error) {
        throw new Error(`Failed to get tags: ${error.message}`)
      }

      // 展开所有 tags 数组并去重
      const allTags = new Set<string>()
      data?.forEach((fact) => {
        fact.tags?.forEach((tag: string) => allTags.add(tag))
      })

      return Array.from(allTags).sort()
    } catch (error) {
      console.error("[FactsService] getAllTags error:", error)
      throw error
    }
  }

  /**
   * 获取 facts 统计信息（用于监控）
   *
   * @returns 统计对象
   */
  async getStats(): Promise<{
    total: number
    byLevel: Record<string, number>
  }> {
    try {
      const { count, error: countError } = await this.supabase
        .from("facts")
        .select("*", { count: "exact", head: true })

      if (countError) {
        throw new Error(`Failed to get count: ${countError.message}`)
      }

      // 按 level 分组统计
      const { data, error } = await this.supabase.from("facts").select("level")

      if (error) {
        throw new Error(`Failed to get stats: ${error.message}`)
      }

      const byLevel: Record<string, number> = {}
      data?.forEach((fact) => {
        const level = fact.level || "Unknown"
        byLevel[level] = (byLevel[level] || 0) + 1
      })

      return {
        total: count || 0,
        byLevel,
      }
    } catch (error) {
      console.error("[FactsService] getStats error:", error)
      throw error
    }
  }
}
