import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createClient } from "@/lib/supabase/client"

interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface AIResponse {
  content: string
  responseTime: number
  confidence: number
  sources: string[]
  requiresHumanFollowup: boolean
  suggestedActions: string[]
}

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  lastUpdated: Date
  verified: boolean
}

interface GenerationOptions {
  userId?: string
  sessionId?: string
  deviceInfo?: any
  conversationContext?: string[]
  timestamp?: string
  realTimeData?: {
    currentTime: string
    userLocation: string
    sessionDuration: number
    messageCount?: number
  }
}

export class GroqAIService {
  private apiKey: string
  private baseUrl = "https://api.groq.com/openai/v1"
  private supabase = createClient()
  private model = groq("llama3-8b-8192")
  private knowledgeBase: KnowledgeItem[] = []

  private systemPrompt = `أنت مساعد ذكي متطور من رؤيا كابيتال، متخصص في خدمات الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة المؤكدة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: حلول الذكاء الاصطناعي والوكلاء الذكيين
- الهاتف: (+963940632191)
- واتساب: (+963940632191)

الخدمات المتاحة (معلومات عامة):
1. وكيل الدعم الذكي - نظام دعم عملاء ذكي
2. وكيل أتمتة المبيعات - أتمتة عمليات المبيعات
3. وكيل إدارة وسائل التواصل - إدارة وسائل التواصل الاجتماعي
4. الوكيل المتخصص - حلول مخصصة

مبادئ مهمة جداً:
- لا تذكر أسعار محددة أو أرقام مالية إلا إذا كانت مؤكدة في قاعدة المعرفة
- إذا سُئلت عن الأسعار، وجه العميل للتواصل المباشر للحصول على عرض سعر مخصص
- لا تخترع معلومات أو إحصائيات
- كن صادقاً إذا لم تعرف معلومة محددة
- استخدم فقط المعلومات المؤكدة من قاعدة المعرفة
- اقترح التواصل المباشر للاستفسارات المتخصصة
- تجنب تكرار الأسئلة والإجابات في نفس المحادثة
- استخدم البيانات الحية والسياق الزمني في إجاباتك

التعليمات:
- أجب باللغة العربية بشكل أساسي
- كن مفيداً ومهنياً وصادقاً
- قدم معلومات دقيقة ومؤكدة فقط
- وضح عندما تحتاج معلومات إضافية
- اقترح التواصل المباشر للاستفسارات المتخصصة
- استخدم الرموز التعبيرية بشكل مناسب ومعتدل
- اعتبر الوقت الحالي والسياق في إجاباتك`

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || ""
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not found in environment variables")
    }
    this.initializeKnowledgeBase()
  }

  private initializeKnowledgeBase() {
    // Initialize with verified, factual information only
    this.knowledgeBase = [
      {
        id: "services-overview",
        title: "نظرة عامة على الخدمات",
        content: `رؤيا كابيتال تقدم حلول الذكاء الاصطناعي والوكلاء الذكيين للشركات. نحن نركز على:
        - أتمتة خدمة العملاء
        - تحسين عمليات المبيعات
        - إدارة وسائل التواصل الاجتماعي
        - حلول مخصصة حسب احتياجات العميل`,
        category: "services",
        lastUpdated: new Date(),
        verified: true,
      },
      {
        id: "contact-info",
        title: "معلومات التواصل",
        content: `للتواصل مع رؤيا كابيتال:
        - الهاتف: (+963940632191)
        - واتساب: (+963940632191)
        - نحن متاحون للرد على استفساراتكم وتقديم استشارات مخصصة`,
        category: "contact",
        lastUpdated: new Date(),
        verified: true,
      },
      {
        id: "pricing-policy",
        title: "سياسة التسعير",
        content: `نحن نقدم عروض أسعار مخصصة لكل عميل بناءً على:
        - حجم الشركة واحتياجاتها
        - نوع الخدمات المطلوبة
        - مستوى التخصيص المطلوب
        للحصول على عرض سعر دقيق، يرجى التواصل معنا مباشرة`,
        category: "pricing",
        lastUpdated: new Date(),
        verified: true,
      },
      {
        id: "ai-capabilities",
        title: "قدرات الذكاء الاصطناعي",
        content: `وكلاؤنا الذكيون يمكنهم:
        - فهم اللغة العربية والإنجليزية
        - التعلم من التفاعلات السابقة
        - تقديم ردود سياقية ذكية
        - العمل على مدار الساعة
        - التكامل مع أنظمة الشركة الموجودة`,
        category: "capabilities",
        lastUpdated: new Date(),
        verified: true,
      },
    ]
  }

  async generateResponse(
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
    options: GenerationOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // Get real-time knowledge base context
      const knowledgeContext = await this.getKnowledgeContext(
        conversationHistory[conversationHistory.length - 1]?.content || "",
      )

      // Build enhanced system prompt with real-time data
      const enhancedSystemPrompt = this.buildEnhancedSystemPrompt(knowledgeContext, options)

      // Prepare messages for the AI with conversation context
      const messages = [{ role: "system" as const, content: enhancedSystemPrompt }, ...conversationHistory]

      const { text } = await generateText({
        model: this.model,
        messages,
        maxTokens: 800,
        temperature: 0.7,
      })

      const responseTime = Date.now() - startTime

      // Analyze response for confidence and follow-up needs
      const requiresHumanFollowup = this.shouldRequireHumanFollowup(text, conversationHistory)
      const suggestedActions = this.generateSuggestedActions(text, conversationHistory, options)

      return {
        content: text,
        responseTime,
        confidence: this.calculateConfidence(text, knowledgeContext),
        sources: ["groq_ai", "company_knowledge", "real_time_data"],
        requiresHumanFollowup,
        suggestedActions,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)

      // Fallback response in Arabic with real-time context
      const currentTime = options.realTimeData?.currentTime || new Date().toLocaleString("ar-SA")
      const fallbackResponse = `عذراً، أواجه مشكلة تقنية في الوقت الحالي (${currentTime}). 

للحصول على المساعدة الفورية:
📞 اتصل بنا: (+963940632191)
💬 واتساب: (+963940632191)

فريقنا متاح لمساعدتك في أي وقت.`

      return {
        content: fallbackResponse,
        responseTime: Date.now() - startTime,
        confidence: 1.0,
        sources: ["fallback"],
        requiresHumanFollowup: true,
        suggestedActions: ["اتصل الآن", "أرسل واتساب"],
      }
    }
  }

  private buildEnhancedSystemPrompt(knowledgeContext: string, options: GenerationOptions): string {
    let enhancedPrompt = this.systemPrompt

    // Add real-time data context
    if (options.realTimeData) {
      enhancedPrompt += `

معلومات الجلسة الحالية:
- الوقت الحالي: ${options.realTimeData.currentTime}
- موقع المستخدم: ${options.realTimeData.userLocation}
- مدة الجلسة: ${Math.floor(options.realTimeData.sessionDuration / 1000)} ثانية
- عدد الرسائل: ${options.realTimeData.messageCount || 0}`
    }

    // Add conversation context to avoid repetition
    if (options.conversationContext && options.conversationContext.length > 0) {
      enhancedPrompt += `

سياق المحادثة السابق:
${options.conversationContext.slice(-5).join("\n")}

تجنب تكرار المعلومات المذكورة سابقاً وقدم معلومات جديدة أو توضيحات إضافية.`
    }

    // Add knowledge base context
    if (knowledgeContext) {
      enhancedPrompt += `

معلومات من قاعدة المعرفة:
${knowledgeContext}`
    }

    return enhancedPrompt
  }

  private async getKnowledgeContext(userMessage: string): Promise<string> {
    try {
      // Search local knowledge base first
      const localKnowledge = this.searchKnowledgeBase(userMessage)

      // Try to get from Supabase knowledge base
      const { data: knowledgeItems } = await this.supabase
        .from("knowledge_base")
        .select("content, title, category")
        .eq("is_verified", true)
        .textSearch("content", userMessage)
        .limit(3)

      let context = ""

      if (localKnowledge.length > 0) {
        context += localKnowledge.map((item) => `${item.title}: ${item.content}`).join("\n\n")
      }

      if (knowledgeItems && knowledgeItems.length > 0) {
        if (context) context += "\n\n"
        context += knowledgeItems.map((item) => `${item.title}: ${item.content}`).join("\n\n")
      }

      return context || "لا توجد معلومات إضافية من قاعدة المعرفة."
    } catch (error) {
      console.error("Error fetching knowledge context:", error)
      return "لا توجد معلومات إضافية من قاعدة المعرفة."
    }
  }

  private searchKnowledgeBase(query: string): KnowledgeItem[] {
    const queryLower = query.toLowerCase()

    return this.knowledgeBase
      .filter((item) => {
        return (
          item.verified &&
          (item.title.toLowerCase().includes(queryLower) ||
            item.content.toLowerCase().includes(queryLower) ||
            item.category.toLowerCase().includes(queryLower))
        )
      })
      .slice(0, 3)
  }

  private calculateConfidence(response: string, knowledgeContext: string): number {
    // Higher confidence if response is based on verified knowledge
    if (knowledgeContext && knowledgeContext.length > 50) {
      return 0.9
    }

    // Lower confidence for general responses
    if (response.includes("للحصول على معلومات دقيقة") || response.includes("يرجى التواصل معنا")) {
      return 0.8
    }

    return 0.75
  }

  private shouldRequireHumanFollowup(response: string, conversationHistory: any[]): boolean {
    const followupKeywords = [
      "أسعار",
      "تكلفة",
      "سعر",
      "تفاصيل تقنية",
      "عقد",
      "اتفاقية",
      "تخصيص",
      "تطوير خاص",
      "استشارة متقدمة",
      "تدريب متخصص",
    ]

    return followupKeywords.some((keyword) => response.includes(keyword)) || conversationHistory.length > 6 // Long conversations need human touch
  }

  private generateSuggestedActions(response: string, conversationHistory: any[], options: GenerationOptions): string[] {
    const actions = []
    const responseLower = response.toLowerCase()

    // Context-aware suggestions based on response content
    if (responseLower.includes("خدمات") || responseLower.includes("حلول")) {
      actions.push("أريد معرفة المزيد عن الخدمات")
    }

    if (responseLower.includes("وكيل") || responseLower.includes("ذكي")) {
      actions.push("كيف يمكنني تجربة الوكيل الذكي؟")
    }

    if (responseLower.includes("أسعار") || responseLower.includes("تكلفة")) {
      actions.push("أريد عرض سعر مخصص")
    }

    if (responseLower.includes("تدريب") || responseLower.includes("دعم")) {
      actions.push("ما هي خدمات الدعم المتاحة؟")
    }

    // Always include contact option for complex queries
    if (conversationHistory.length > 3) {
      actions.push("أريد التحدث مع مختص")
    }

    return actions.slice(0, 3) // Limit to 3 actions
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await generateText({
        model: this.model,
        messages: [{ role: "user", content: "مرحبا" }],
        maxTokens: 10,
      })
      return !!testResponse.text
    } catch (error) {
      console.error("Groq connection test failed:", error)
      return false
    }
  }

  // Knowledge base management methods
  async updateKnowledgeBase(items: Partial<KnowledgeItem>[]): Promise<boolean> {
    try {
      items.forEach((item) => {
        if (item.id) {
          const existingIndex = this.knowledgeBase.findIndex((kb) => kb.id === item.id)
          if (existingIndex >= 0) {
            // Update existing item
            this.knowledgeBase[existingIndex] = {
              ...this.knowledgeBase[existingIndex],
              ...item,
              lastUpdated: new Date(),
            }
          } else {
            // Add new item
            this.knowledgeBase.push({
              id: item.id,
              title: item.title || "",
              content: item.content || "",
              category: item.category || "general",
              lastUpdated: new Date(),
              verified: item.verified || false,
            })
          }
        }
      })
      return true
    } catch (error) {
      console.error("Error updating knowledge base:", error)
      return false
    }
  }

  getKnowledgeBase(): KnowledgeItem[] {
    return [...this.knowledgeBase]
  }

  async validateKnowledgeItem(item: KnowledgeItem): Promise<boolean> {
    return !!(item.title && item.content && item.category)
  }

  getSystemInstructions(): string {
    return this.systemPrompt
  }

  updateSystemInstructions(newInstructions: string): boolean {
    try {
      if (newInstructions.includes("لا تذكر أسعار محددة") && newInstructions.includes("كن صادقاً")) {
        this.systemPrompt = newInstructions
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating system instructions:", error)
      return false
    }
  }
}

export const groqAI = new GroqAIService()
