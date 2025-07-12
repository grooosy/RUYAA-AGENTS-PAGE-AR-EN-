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
- الهاتف: 963940632191+
- واتساب: 963940632191+

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
        - الهاتف: 963940632191+
        - واتساب: 963940632191+
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
    options: GenerationOptions = {},
  ): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // System prompt in Arabic for Ruyaa Capital
      const systemPrompt = `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: حلول الوكلاء الذكيين، الذكاء الاصطناعي، أتمتة خدمة العملاء
- رقم الهاتف: +963940632191
- الخدمات الرئيسية:
  * وكلاء ذكيين للدعم الفني
  * أتمتة المبيعات
  * إدارة وسائل التواصل الاجتماعي
  * خدمة العملاء الذكية

قواعد المحادثة:
1. أجب باللغة العربية دائماً
2. كن مهذباً ومفيداً
3. إذا لم تعرف إجابة دقيقة، أرشد العميل للاتصال بالرقم +963940632191
4. لا تخترع معلومات غير موجودة
5. ركز على خدمات الشركة
6. اقترح التواصل المباشر للتفاصيل التقنية والأسعار

أجب بشكل طبيعي ومفيد.`

      // Prepare messages for the AI
      const messages = [{ role: "system" as const, content: systemPrompt }, ...conversationHistory]

      const { text } = await generateText({
        model: this.model,
        messages,
        maxTokens: 500,
        temperature: 0.7,
      })

      const responseTime = Date.now() - startTime

      // Analyze response for confidence and follow-up needs
      const requiresHumanFollowup = this.shouldRequireHumanFollowup(text)
      const suggestedActions = this.generateSuggestedActions(text)

      return {
        content: text,
        responseTime,
        confidence: 0.85, // Static confidence for now
        sources: ["groq_ai", "company_knowledge"],
        requiresHumanFollowup,
        suggestedActions,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)

      // Fallback response in Arabic
      const fallbackResponse = `عذراً، حدث خطأ تقني. 

للحصول على المساعدة الفورية:
📞 اتصل بنا: +963940632191
💬 واتساب: +963940632191

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

  private shouldRequireHumanFollowup(response: string): boolean {
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
    ]

    return followupKeywords.some((keyword) => response.includes(keyword))
  }

  private generateSuggestedActions(response: string): string[] {
    const actions = []

    if (response.includes("خدمات") || response.includes("حلول")) {
      actions.push("ما هي خدماتكم؟")
    }

    if (response.includes("وكيل") || response.includes("ذكي")) {
      actions.push("كيف يعمل الوكيل الذكي؟")
    }

    if (response.includes("أسعار") || response.includes("تكلفة")) {
      actions.push("التواصل للاستفسار عن الأسعار")
    }

    actions.push("أريد استشارة مخصصة")

    return actions.slice(0, 3) // Limit to 3 actions
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

      const result = await generateText({
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
            role: "system" as const,
            content: `حلل النية من الرسالة التالية وأرجع JSON بالشكل التالي:
{
  "intent": "نوع النية (استفسار_خدمات، طلب_سعر، دعم_تقني، شكوى، تحية، أخرى)",
  "confidence": رقم من 0 إلى 1,
  "entities": ["الكيانات المستخرجة من النص"]
}

كن دقيقاً في التحليل ولا تخترع معلومات.`,
          },
          {
            role: "user" as const,
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
