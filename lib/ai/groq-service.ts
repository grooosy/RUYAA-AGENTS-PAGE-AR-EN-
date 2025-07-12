import { generateText, streamText } from "ai"
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

interface GenerateOptions {
  userId?: string
  sessionId?: string
  deviceInfo?: any
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
- الهاتف: +963940632191
- واتساب: +963940632191

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

التعليمات:
- أجب باللغة العربية بشكل أساسي
- كن مفيداً ومهنياً وصادقاً
- قدم معلومات دقيقة ومؤكدة فقط
- وضح عندما تحتاج معلومات إضافية
- اقترح التواصل المباشر للاستفسارات المتخصصة
- استخدم الرموز التعبيرية بشكل مناسب ومعتدل`

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
        - الهاتف: +963940632191
        - واتساب: +963940632191
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
    ]
  }

  async generateResponse(
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
    options: GenerateOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // Get knowledge base context
      const knowledgeContext = await this.getKnowledgeContext(
        conversationHistory[conversationHistory.length - 1]?.content || "",
      )

      // Enhanced system prompt in Arabic
      const systemPrompt = `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الوكلاء الذكيين.

معلومات الشركة:
- رؤيا كابيتال شركة رائدة في تطوير حلول الوكلاء الذكيين
- نقدم خدمات الذكاء الاصطناعي للشركات والمؤسسات
- نساعد العملاء في أتمتة خدمة العملاء وتحسين الكفاءة
- رقم التواصل: 963940632191+

خدماتنا الرئيسية:
1. وكلاء ذكيون لخدمة العملاء
2. حلول الذكاء الاصطناعي المخصصة
3. أتمتة العمليات التجارية
4. تحليل البيانات والتقارير الذكية

قواعد مهمة:
- كن مفيداً ومهذباً دائماً
- أجب باللغة العربية فقط
- إذا لم تكن متأكداً من معلومة، اطلب من العميل التواصل مباشرة
- لا تخترع أسعاراً أو تفاصيل تقنية محددة
- وجه العملاء للتواصل المباشر للحصول على عروض أسعار
- استخدم المعلومات من قاعدة المعرفة إذا كانت متوفرة

السياق من قاعدة المعرفة:
${knowledgeContext}

أجب بطريقة طبيعية ومفيدة، واقترح إجراءات مناسبة عند الحاجة.`

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [{ role: "system", content: systemPrompt }, ...conversationHistory],
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      const responseTime = Date.now() - startTime
      const content = data.choices[0]?.message?.content || "عذراً، لم أتمكن من معالجة طلبك."

      // Analyze response for confidence and follow-up needs
      const analysis = this.analyzeResponse(content, conversationHistory)

      return {
        content,
        responseTime,
        confidence: analysis.confidence,
        sources: analysis.sources,
        requiresHumanFollowup: analysis.requiresHumanFollowup,
        suggestedActions: analysis.suggestedActions,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)

      // Fallback response
      return {
        content: `عذراً، حدث خطأ تقني. 

للحصول على المساعدة الفورية:
📞 اتصل بنا: 963940632191+
💬 واتساب: 963940632191+

فريقنا متاح لمساعدتك في أي وقت.`,
        responseTime: Date.now() - startTime,
        confidence: 1.0,
        sources: ["fallback"],
        requiresHumanFollowup: true,
        suggestedActions: ["اتصل الآن", "إرسال واتساب"],
      }
    }
  }

  private async getKnowledgeContext(userMessage: string): Promise<string> {
    try {
      // Search knowledge base for relevant information
      const { data: knowledgeItems } = await this.supabase
        .from("knowledge_base")
        .select("content, title, category")
        .eq("is_verified", true)
        .textSearch("content", userMessage)
        .limit(3)

      if (knowledgeItems && knowledgeItems.length > 0) {
        return knowledgeItems.map((item) => `${item.title}: ${item.content}`).join("\n\n")
      }

      return "لا توجد معلومات إضافية من قاعدة المعرفة."
    } catch (error) {
      console.error("Error fetching knowledge context:", error)
      return "لا توجد معلومات إضافية من قاعدة المعرفة."
    }
  }

  private analyzeResponse(
    content: string,
    conversationHistory: any[],
  ): {
    confidence: number
    sources: string[]
    requiresHumanFollowup: boolean
    suggestedActions: string[]
  } {
    // Simple analysis logic
    const lowerContent = content.toLowerCase()

    // Check if response contains pricing or technical details
    const containsPricing = /سعر|تكلفة|مبلغ|دولار|ليرة/.test(content)
    const containsTechnical = /تقني|برمجة|api|تطوير/.test(content)
    const containsUncertainty = /لست متأكد|قد يكون|ربما|غير متأكد/.test(content)

    let confidence = 0.8
    let requiresHumanFollowup = false
    const sources = ["ai_response"]
    const suggestedActions: string[] = []

    if (containsPricing || containsTechnical) {
      confidence = 0.6
      requiresHumanFollowup = true
      suggestedActions.push("التواصل للحصول على عرض سعر")
    }

    if (containsUncertainty) {
      confidence = 0.5
      requiresHumanFollowup = true
      suggestedActions.push("التواصل مع فريق المبيعات")
    }

    // Add common suggested actions
    if (content.includes("خدمات")) {
      suggestedActions.push("ما هي خدماتكم؟")
    }

    if (content.includes("وكيل ذكي")) {
      suggestedActions.push("كيف يعمل الوكيل الذكي؟")
    }

    return {
      confidence,
      sources,
      requiresHumanFollowup,
      suggestedActions: [...new Set(suggestedActions)], // Remove duplicates
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })
      return response.ok
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
    // In a real implementation, this would validate against external sources
    // For now, we'll do basic validation
    return !!(item.title && item.content && item.category)
  }

  // System instructions management
  getSystemInstructions(): string {
    return this.systemPrompt
  }

  updateSystemInstructions(newInstructions: string): boolean {
    try {
      // Validate that essential safety instructions are maintained
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

  // Streaming response for real-time interaction
  async *streamResponse(messages: AIMessage[]) {
    try {
      const userMessage = messages[messages.length - 1]?.content || ""
      const relevantKnowledge = this.searchKnowledgeBase(userMessage)
      const intent = await this.analyzeUserIntent(userMessage)
      const enhancedSystemPrompt = this.buildEnhancedSystemPrompt(relevantKnowledge, intent)

      const result = await streamText({
        model: this.model,
        messages: [{ role: "system", content: enhancedSystemPrompt }, ...messages],
        maxTokens: 1000,
        temperature: 0.3,
      })

      for await (const delta of result.textStream) {
        yield delta
      }
    } catch (error) {
      console.error("Groq AI Streaming Error:", error)
      yield "عذراً، حدث خطأ في الاتصال. يرجى التواصل معنا مباشرة على +963940632191"
    }
  }

  private buildEnhancedSystemPrompt(knowledge: KnowledgeItem[], intent: any): string {
    let knowledgeContext = ""

    if (knowledge.length > 0) {
      knowledgeContext = "\n\nمعلومات مؤكدة من قاعدة المعرفة:\n"
      knowledge.forEach((item) => {
        knowledgeContext += `- ${item.title}: ${item.content}\n`
      })
    }

    return (
      this.systemPrompt +
      knowledgeContext +
      `

تحليل نية المستخدم: ${intent.intent}
مستوى الثقة: ${intent.confidence}

تذكر: استخدم فقط المعلومات المؤكدة أعلاه. إذا لم تجد معلومة محددة، اطلب من العميل التواصل المباشر.`
    )
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
      .slice(0, 3) // Limit to most relevant items
  }

  private calculateConfidence(response: string, knowledge: KnowledgeItem[]): number {
    // Higher confidence if response is based on verified knowledge
    if (knowledge.length > 0) {
      return 0.9
    }

    // Lower confidence for general responses
    if (response.includes("للحصول على معلومات دقيقة") || response.includes("يرجى التواصل معنا")) {
      return 0.8
    }

    return 0.6
  }

  private extractSources(knowledge: KnowledgeItem[]): string[] {
    return knowledge.map((item) => item.category)
  }

  private shouldRequireHumanFollowup(message: string, intent: any): boolean {
    const messageLower = message.toLowerCase()

    // Require human followup for pricing, complex technical questions, or complaints
    return (
      messageLower.includes("سعر") ||
      messageLower.includes("تكلفة") ||
      messageLower.includes("price") ||
      messageLower.includes("cost") ||
      messageLower.includes("شكوى") ||
      messageLower.includes("مشكلة") ||
      intent.intent === "طلب_سعر" ||
      intent.intent === "شكوى" ||
      intent.confidence < 0.6
    )
  }

  private generateSuggestedActions(intent: any, message: string): string[] {
    const actions: string[] = []

    if (intent.intent === "طلب_سعر" || message.toLowerCase().includes("سعر")) {
      actions.push("طلب عرض سعر مخصص")
      actions.push("جدولة مكالمة استشارية")
    }

    if (intent.intent === "استفسار_خدمات") {
      actions.push("معرفة المزيد عن الخدمات")
      actions.push("طلب عرض توضيحي")
    }

    actions.push("التواصل مع فريق المبيعات")

    return actions
  }

  async analyzeUserIntent(message: string): Promise<{
    intent: string
    confidence: number
    entities: string[]
  }> {
    try {
      const { text } = await generateText({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `حلل النية من الرسالة التالية وأرجع JSON بالشكل التالي:
{
  "intent": "نوع النية (استفسار_خدمات، طلب_سعر، دعم_تقني، شكوى، تحية، أخرى)",
  "confidence": رقم من 0 إلى 1,
  "entities": ["الكيانات المستخرجة من النص"]
}

كن دقيقاً في التحليل ولا تخترع معلومات.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        maxTokens: 200,
        temperature: 0.1, // Very low temperature for consistent analysis
      })

      try {
        const parsed = JSON.parse(text)
        return {
          intent: parsed.intent || "أخرى",
          confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
          entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        }
      } catch {
        return {
          intent: "أخرى",
          confidence: 0.3,
          entities: [],
        }
      }
    } catch (error) {
      console.error("Intent Analysis Error:", error)
      return {
        intent: "أخرى",
        confidence: 0.1,
        entities: [],
      }
    }
  }
}

export const groqAI = new GroqAIService()
