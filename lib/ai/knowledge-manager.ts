import { createClient } from "@/lib/supabase/client"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  language: string
  verified: boolean
  lastUpdated: Date
  metadata?: Record<string, any>
}

interface SearchResult extends KnowledgeItem {
  relevanceScore: number
}

export class KnowledgeManager {
  private supabase = createClient()

  // Knowledge Base Management
  async getKnowledgeItems(
    options: {
      category?: string
      language?: string
      verified?: boolean
      page?: number
      limit?: number
    } = {},
  ): Promise<{ items: KnowledgeItem[]; total: number }> {
    const { category, language, verified, page = 1, limit = 20 } = options
    const offset = (page - 1) * limit

    try {
      let query = this.supabase.from("knowledge_base").select("*", { count: "exact" })

      if (category) {
        query = query.eq("category", category)
      }

      if (language) {
        query = query.eq("language", language)
      }

      if (verified !== undefined) {
        query = query.eq("verified", verified)
      }

      const { data, error, count } = await query
        .order("updated_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error("Error fetching knowledge items:", error)
        return { items: [], total: 0 }
      }

      return {
        items: data || [],
        total: count || 0,
      }
    } catch (error) {
      console.error("Error fetching knowledge items:", error)
      return { items: [], total: 0 }
    }
  }

  async addKnowledgeItem(item: Omit<KnowledgeItem, "id" | "lastUpdated">): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("knowledge_base")
        .insert({
          title: item.title,
          content: item.content,
          category: item.category,
          language: item.language,
          verified: item.verified,
          metadata: item.metadata || {},
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error adding knowledge item:", error)
        return null
      }

      return data.id
    } catch (error) {
      console.error("Error adding knowledge item:", error)
      return null
    }
  }

  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("knowledge_base")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        console.error("Error updating knowledge item:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error updating knowledge item:", error)
      return false
    }
  }

  async deleteKnowledgeItem(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("knowledge_base").delete().eq("id", id)

      if (error) {
        console.error("Error deleting knowledge item:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting knowledge item:", error)
      return false
    }
  }

  async searchKnowledge(
    query: string,
    options: {
      category?: string
      language?: string
      limit?: number
      minRelevance?: number
    } = {},
  ): Promise<SearchResult[]> {
    const { category, language = "arabic", limit = 5, minRelevance = 0.3 } = options

    try {
      // Use Supabase RPC function for semantic search
      const { data, error } = await this.supabase.rpc("search_knowledge_base", {
        p_query: query,
        p_category: category,
        p_language: language,
        p_limit: limit,
      })

      if (error) {
        console.error("Knowledge search error:", error)
        return []
      }

      // Filter by relevance score
      return (data || []).filter((item: SearchResult) => item.relevanceScore >= minRelevance)
    } catch (error) {
      console.error("Knowledge search error:", error)
      return []
    }
  }

  // Get knowledge categories
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.from("knowledge_base").select("category").not("category", "is", null)

      if (error) {
        console.error("Error fetching categories:", error)
        return []
      }

      // Get unique categories
      const categories = [...new Set(data.map((item) => item.category))]
      return categories.sort()
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  // Verify knowledge item
  async verifyKnowledgeItem(id: string, verified: boolean): Promise<boolean> {
    return this.updateKnowledgeItem(id, { verified })
  }

  // Bulk import knowledge items
  async bulkImportKnowledge(items: Omit<KnowledgeItem, "id" | "lastUpdated">[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const item of items) {
      try {
        const id = await this.addKnowledgeItem(item)
        if (id) {
          success++
        } else {
          failed++
          errors.push(`Failed to add item: ${item.title}`)
        }
      } catch (error) {
        failed++
        errors.push(`Error adding item ${item.title}: ${error}`)
      }
    }

    return { success, failed, errors }
  }

  // Export knowledge base
  async exportKnowledge(
    options: {
      category?: string
      language?: string
      verified?: boolean
    } = {},
  ): Promise<KnowledgeItem[]> {
    const { items } = await this.getKnowledgeItems({
      ...options,
      limit: 1000, // Large limit for export
    })

    return items
  }

  // Get knowledge analytics
  async getKnowledgeAnalytics(): Promise<{
    totalItems: number
    verifiedItems: number
    categoryCounts: Record<string, number>
    languageCounts: Record<string, number>
    recentlyUpdated: number
  }> {
    try {
      const { data, error } = await this.supabase.rpc("get_knowledge_analytics")

      if (error) {
        console.error("Error fetching knowledge analytics:", error)
        return {
          totalItems: 0,
          verifiedItems: 0,
          categoryCounts: {},
          languageCounts: {},
          recentlyUpdated: 0,
        }
      }

      return data
    } catch (error) {
      console.error("Error fetching knowledge analytics:", error)
      return {
        totalItems: 0,
        verifiedItems: 0,
        categoryCounts: {},
        languageCounts: {},
        recentlyUpdated: 0,
      }
    }
  }
}

export const knowledgeManager = new KnowledgeManager()
