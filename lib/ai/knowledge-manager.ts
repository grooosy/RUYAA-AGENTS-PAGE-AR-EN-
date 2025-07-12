import { createClient } from "@/lib/supabase/client"

export interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  subcategory?: string
  keywords: string[]
  language: string
  verified: boolean
  lastUpdated: Date
  createdBy?: string
  approvedBy?: string
  version: number
}

export interface SystemInstruction {
  id: string
  name: string
  content: string
  active: boolean
  lastUpdated: Date
  version: number
}

export class KnowledgeManager {
  private supabase = createClient()

  // Knowledge Base Management
  async getKnowledgeItems(category?: string, verified?: boolean): Promise<KnowledgeItem[]> {
    try {
      let query = this.supabase.from("ai_knowledge_base").select("*").order("created_at", { ascending: false })

      if (category) {
        query = query.eq("category", category)
      }

      if (verified !== undefined) {
        query = query.eq("is_active", verified)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching knowledge items:", error)
        return []
      }

      return (
        data?.map((item) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          subcategory: item.subcategory,
          keywords: item.keywords || [],
          language: item.language || "arabic",
          verified: item.is_active || false,
          lastUpdated: new Date(item.updated_at),
          version: 1,
        })) || []
      )
    } catch (error) {
      console.error("Error in getKnowledgeItems:", error)
      return []
    }
  }

  async addKnowledgeItem(item: Omit<KnowledgeItem, "id" | "lastUpdated" | "version">): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from("ai_knowledge_base")
        .insert({
          title: item.title,
          content: item.content,
          category: item.category,
          subcategory: item.subcategory,
          keywords: item.keywords,
          language: item.language,
          is_active: item.verified,
        })
        .select("id")
        .single()

      if (error) {
        console.error("Error adding knowledge item:", error)
        return null
      }

      return data?.id || null
    } catch (error) {
      console.error("Error in addKnowledgeItem:", error)
      return null
    }
  }

  async updateKnowledgeItem(id: string, updates: Partial<KnowledgeItem>): Promise<boolean> {
    try {
      const updateData: any = {}

      if (updates.title) updateData.title = updates.title
      if (updates.content) updateData.content = updates.content
      if (updates.category) updateData.category = updates.category
      if (updates.subcategory) updateData.subcategory = updates.subcategory
      if (updates.keywords) updateData.keywords = updates.keywords
      if (updates.language) updateData.language = updates.language
      if (updates.verified !== undefined) updateData.is_active = updates.verified

      const { error } = await this.supabase.from("ai_knowledge_base").update(updateData).eq("id", id)

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

  async deleteKnowledgeItem(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("ai_knowledge_base").delete().eq("id", id)

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

  async searchKnowledge(query: string, category?: string, limit = 10): Promise<KnowledgeItem[]> {
    try {
      const { data, error } = await this.supabase.rpc("search_knowledge_base", {
        p_query: query,
        p_category: category,
        p_language: "arabic",
        p_limit: limit,
      })

      if (error) {
        console.error("Error searching knowledge base:", error)
        return []
      }

      return (
        data?.map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          subcategory: item.subcategory,
          keywords: [],
          language: "arabic",
          verified: true,
          lastUpdated: new Date(),
          version: 1,
        })) || []
      )
    } catch (error) {
      console.error("Error in searchKnowledge:", error)
      return []
    }
  }

  // System Instructions Management
  async getSystemInstructions(): Promise<SystemInstruction[]> {
    // For now, return default instructions
    // In a full implementation, this would fetch from database
    return [
      {
        id: "default",
        name: "Default AI Instructions",
        content: `أنت مساعد ذكي من رؤيا كابيتال. كن صادقاً ومفيداً. لا تذكر أسعار محددة.`,
        active: true,
        lastUpdated: new Date(),
        version: 1,
      },
    ]
  }

  async updateSystemInstructions(id: string, content: string): Promise<boolean> {
    // Validate instructions contain safety guidelines
    const requiredGuidelines = ["لا تذكر أسعار محددة", "كن صادقاً", "رؤيا كابيتال"]

    const hasAllGuidelines = requiredGuidelines.every((guideline) => content.includes(guideline))

    if (!hasAllGuidelines) {
      console.error("System instructions must contain required safety guidelines")
      return false
    }

    // In a full implementation, this would update the database
    console.log("System instructions updated:", { id, content })
    return true
  }

  // Analytics and Monitoring
  async getKnowledgeAnalytics(): Promise<{
    totalItems: number
    verifiedItems: number
    categoriesCount: Record<string, number>
    recentUpdates: number
  }> {
    try {
      const items = await this.getKnowledgeItems()

      const analytics = {
        totalItems: items.length,
        verifiedItems: items.filter((item) => item.verified).length,
        categoriesCount: items.reduce(
          (acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
        recentUpdates: items.filter((item) => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return item.lastUpdated > weekAgo
        }).length,
      }

      return analytics
    } catch (error) {
      console.error("Error getting knowledge analytics:", error)
      return {
        totalItems: 0,
        verifiedItems: 0,
        categoriesCount: {},
        recentUpdates: 0,
      }
    }
  }

  // Validation and Quality Control
  async validateKnowledgeItem(item: Partial<KnowledgeItem>): Promise<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields validation
    if (!item.title || item.title.trim().length < 3) {
      errors.push("العنوان مطلوب ويجب أن يكون 3 أحرف على الأقل")
    }

    if (!item.content || item.content.trim().length < 10) {
      errors.push("المحتوى مطلوب ويجب أن يكون 10 أحرف على الأقل")
    }

    if (!item.category || item.category.trim().length < 2) {
      errors.push("الفئة مطلوبة")
    }

    // Content quality checks
    if ((item.content && item.content.includes("$")) || item.content?.includes("USD")) {
      warnings.push("المحتوى يحتوي على أسعار - تأكد من دقتها وحداثتها")
    }

    if (item.content && item.content.length > 2000) {
      warnings.push("المحتوى طويل جداً - فكر في تقسيمه")
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Backup and Export
  async exportKnowledgeBase(): Promise<string> {
    try {
      const items = await this.getKnowledgeItems()
      return JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          version: "1.0",
          items,
        },
        null,
        2,
      )
    } catch (error) {
      console.error("Error exporting knowledge base:", error)
      return ""
    }
  }

  async importKnowledgeBase(jsonData: string): Promise<{
    success: boolean
    imported: number
    errors: string[]
  }> {
    try {
      const data = JSON.parse(jsonData)
      const items = data.items || []

      let imported = 0
      const errors: string[] = []

      for (const item of items) {
        const validation = await this.validateKnowledgeItem(item)

        if (validation.valid) {
          const id = await this.addKnowledgeItem(item)
          if (id) {
            imported++
          } else {
            errors.push(`فشل في إضافة العنصر: ${item.title}`)
          }
        } else {
          errors.push(`عنصر غير صالح: ${item.title} - ${validation.errors.join(", ")}`)
        }
      }

      return {
        success: imported > 0,
        imported,
        errors,
      }
    } catch (error) {
      console.error("Error importing knowledge base:", error)
      return {
        success: false,
        imported: 0,
        errors: ["خطأ في تحليل البيانات المستوردة"],
      }
    }
  }
}

export const knowledgeManager = new KnowledgeManager()
