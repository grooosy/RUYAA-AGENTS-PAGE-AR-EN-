import { createClient } from "@/lib/supabase/client"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  language: string
  tags: string[]
  isVerified: boolean
  lastUpdated: Date
  createdBy?: string
  metadata?: Record<string, any>
}

interface SearchOptions {
  category?: string
  language?: string
  verified?: boolean
  limit?: number
  offset?: number
}

interface AnalyticsData {
  totalItems: number
  verifiedItems: number
  categoryCounts: Record<string, number>
  languageCounts: Record<string, number>
  recentUpdates: KnowledgeItem[]
}

export class KnowledgeManager {
  private supabase = createClient()

  // Check if knowledge base table exists
  private async checkTableExists(): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("knowledge_base").select("id").limit(1).single()

      // If error is null or it's just "no rows" error, table exists
      return error === null || error.code === "PGRST116"
    } catch (error) {
      console.warn("Knowledge base table does not exist yet")
      return false
    }
  }

  // Search knowledge base with full-text search
  async searchKnowledge(query: string, options: SearchOptions = {}): Promise<KnowledgeItem[]> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.warn("Knowledge base table not found, returning empty results")
        return []
      }

      let queryBuilder = this.supabase.from("knowledge_base").select("*")

      // Add text search if query is provided
      if (query && query.trim()) {
        queryBuilder = queryBuilder.textSearch("content", query)
      }

      if (options.category) {
        queryBuilder = queryBuilder.eq("category", options.category)
      }

      if (options.language) {
        queryBuilder = queryBuilder.eq("language", options.language)
      }

      if (options.verified !== undefined) {
        queryBuilder = queryBuilder.eq("is_verified", options.verified)
      }

      const { data, error } = await queryBuilder
        .order("updated_at", { ascending: false })
        .limit(options.limit || 10)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 10) - 1)

      if (error) {
        console.error("Error searching knowledge base:", error)
        return []
      }

      return data?.map(this.mapDatabaseToKnowledgeItem) || []
    } catch (error) {
      console.error("Error in searchKnowledge:", error)
      return []
    }
  }

  // Get all knowledge items with filtering
  async getKnowledgeItems(options: SearchOptions = {}): Promise<KnowledgeItem[]> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.warn("Knowledge base table not found, returning empty results")
        return []
      }

      let queryBuilder = this.supabase.from("knowledge_base").select("*")

      if (options.category) {
        queryBuilder = queryBuilder.eq("category", options.category)
      }

      if (options.language) {
        queryBuilder = queryBuilder.eq("language", options.language)
      }

      if (options.verified !== undefined) {
        queryBuilder = queryBuilder.eq("is_verified", options.verified)
      }

      const { data, error } = await queryBuilder
        .order("updated_at", { ascending: false })
        .limit(options.limit || 50)
        .range(options.offset || 0, (options.offset || 0) + (options.limit || 50) - 1)

      if (error) {
        console.error("Error fetching knowledge items:", error)
        return []
      }

      return data?.map(this.mapDatabaseToKnowledgeItem) || []
    } catch (error) {
      console.error("Error in getKnowledgeItems:", error)
      return []
    }
  }

  // Create new knowledge item
  async createKnowledgeItem(item: Omit<KnowledgeItem, "id" | "lastUpdated">): Promise<string | null> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.error("Knowledge base table not found, cannot create item")
        return null
      }

      const { data, error } = await this.supabase
        .from("knowledge_base")
        .insert({
          title: item.title,
          content: item.content,
          category: item.category,
          language: item.language,
          tags: item.tags,
          is_verified: item.isVerified,
          created_by: item.createdBy,
          metadata: item.metadata || {},
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error creating knowledge item:", error)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error("Error in createKnowledgeItem:", error)
      return null
    }
  }

  // Update existing knowledge item
  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<boolean> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.error("Knowledge base table not found, cannot update item")
        return false
      }

      const updateData: any = {}

      if (updates.title) updateData.title = updates.title
      if (updates.content) updateData.content = updates.content
      if (updates.category) updateData.category = updates.category
      if (updates.language) updateData.language = updates.language
      if (updates.tags) updateData.tags = updates.tags
      if (updates.isVerified !== undefined) updateData.is_verified = updates.isVerified
      if (updates.metadata) updateData.metadata = updates.metadata

      updateData.updated_at = new Date().toISOString()

      const { error } = await this.supabase.from("knowledge_base").update(updateData).eq("id", id)

      if (error) {
        console.error("Error updating knowledge item:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in updateKnowledgeItem:", error)
      return false
    }
  }

  // Delete knowledge item
  async deleteKnowledgeItem(id: string): Promise<boolean> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.error("Knowledge base table not found, cannot delete item")
        return false
      }

      const { error } = await this.supabase.from("knowledge_base").delete().eq("id", id)

      if (error) {
        console.error("Error deleting knowledge item:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in deleteKnowledgeItem:", error)
      return false
    }
  }

  // Get knowledge item by ID
  async getKnowledgeItemById(id: string): Promise<KnowledgeItem | null> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.warn("Knowledge base table not found")
        return null
      }

      const { data, error } = await this.supabase.from("knowledge_base").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching knowledge item:", error)
        return null
      }

      return data ? this.mapDatabaseToKnowledgeItem(data) : null
    } catch (error) {
      console.error("Error in getKnowledgeItemById:", error)
      return null
    }
  }

  // Get analytics data
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        return {
          totalItems: 0,
          verifiedItems: 0,
          categoryCounts: {},
          languageCounts: {},
          recentUpdates: [],
        }
      }

      // Get total counts
      const { count: totalItems } = await this.supabase
        .from("knowledge_base")
        .select("*", { count: "exact", head: true })

      const { count: verifiedItems } = await this.supabase
        .from("knowledge_base")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", true)

      // Get category counts
      const { data: categoryData } = await this.supabase.from("knowledge_base").select("category")

      const categoryCounts: Record<string, number> = {}
      categoryData?.forEach((item) => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
      })

      // Get language counts
      const { data: languageData } = await this.supabase.from("knowledge_base").select("language")

      const languageCounts: Record<string, number> = {}
      languageData?.forEach((item) => {
        languageCounts[item.language] = (languageCounts[item.language] || 0) + 1
      })

      // Get recent updates
      const { data: recentData } = await this.supabase
        .from("knowledge_base")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5)

      const recentUpdates = recentData?.map(this.mapDatabaseToKnowledgeItem) || []

      return {
        totalItems: totalItems || 0,
        verifiedItems: verifiedItems || 0,
        categoryCounts,
        languageCounts,
        recentUpdates,
      }
    } catch (error) {
      console.error("Error getting analytics:", error)
      return {
        totalItems: 0,
        verifiedItems: 0,
        categoryCounts: {},
        languageCounts: {},
        recentUpdates: [],
      }
    }
  }

  // Bulk import knowledge items
  async bulkImport(items: Omit<KnowledgeItem, "id" | "lastUpdated">[]): Promise<{
    success: number
    failed: number
    errors: string[]
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    const tableExists = await this.checkTableExists()
    if (!tableExists) {
      results.errors.push("Knowledge base table not found")
      results.failed = items.length
      return results
    }

    for (const item of items) {
      try {
        const id = await this.createKnowledgeItem(item)
        if (id) {
          results.success++
        } else {
          results.failed++
          results.errors.push(`Failed to create item: ${item.title}`)
        }
      } catch (error) {
        results.failed++
        results.errors.push(`Error creating ${item.title}: ${error}`)
      }
    }

    return results
  }

  // Export knowledge items
  async exportKnowledge(options: SearchOptions = {}): Promise<KnowledgeItem[]> {
    return this.getKnowledgeItems({ ...options, limit: 1000 })
  }

  // Verify knowledge item
  async verifyKnowledgeItem(id: string, verified: boolean): Promise<boolean> {
    return this.updateKnowledgeItem(id, { isVerified: verified })
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        return []
      }

      const { data, error } = await this.supabase.from("knowledge_base").select("category").order("category")

      if (error) {
        console.error("Error fetching categories:", error)
        return []
      }

      const categories = [...new Set(data?.map((item) => item.category) || [])]
      return categories.filter(Boolean)
    } catch (error) {
      console.error("Error in getCategories:", error)
      return []
    }
  }

  // Get languages
  async getLanguages(): Promise<string[]> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        return []
      }

      const { data, error } = await this.supabase.from("knowledge_base").select("language").order("language")

      if (error) {
        console.error("Error fetching languages:", error)
        return []
      }

      const languages = [...new Set(data?.map((item) => item.language) || [])]
      return languages.filter(Boolean)
    } catch (error) {
      console.error("Error in getLanguages:", error)
      return []
    }
  }

  // Initialize knowledge base with default data
  async initializeKnowledgeBase(): Promise<boolean> {
    try {
      const tableExists = await this.checkTableExists()
      if (!tableExists) {
        console.error("Knowledge base table not found, cannot initialize")
        return false
      }

      // Check if we already have data
      const existingItems = await this.getKnowledgeItems({ limit: 1 })
      if (existingItems.length > 0) {
        console.log("Knowledge base already has data, skipping initialization")
        return true
      }

      // Add default knowledge items
      const defaultItems = [
        {
          title: "خدمات رؤيا كابيتال",
          content:
            "رؤيا كابيتال شركة متخصصة في تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي. نقدم خدمات شاملة تشمل: وكلاء الدعم الذكي، أتمتة المبيعات، إدارة وسائل التواصل الاجتماعي، والحلول المخصصة حسب احتياجات العميل.",
          category: "services",
          language: "arabic",
          tags: ["خدمات", "وكلاء ذكيين", "ذكاء اصطناعي"],
          isVerified: true,
        },
        {
          title: "Ruyaa Capital Services",
          content:
            "Ruyaa Capital is a company specialized in developing intelligent agent solutions and artificial intelligence. We provide comprehensive services including: intelligent support agents, sales automation, social media management, and customized solutions according to client needs.",
          category: "services",
          language: "english",
          tags: ["services", "intelligent agents", "artificial intelligence"],
          isVerified: true,
        },
      ]

      const results = await this.bulkImport(defaultItems)
      console.log(`Knowledge base initialized: ${results.success} items added, ${results.failed} failed`)

      return results.success > 0
    } catch (error) {
      console.error("Error initializing knowledge base:", error)
      return false
    }
  }

  // Private helper method to map database row to KnowledgeItem
  private mapDatabaseToKnowledgeItem(row: any): KnowledgeItem {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      language: row.language,
      tags: row.tags || [],
      isVerified: row.is_verified,
      lastUpdated: new Date(row.updated_at),
      createdBy: row.created_by,
      metadata: row.metadata || {},
    }
  }
}

export const knowledgeManager = new KnowledgeManager()
