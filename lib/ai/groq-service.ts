import { generateText, streamText } from "ai"
import { groq } from "@ai-sdk/groq"

interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface AIResponse {
  content: string
  confidence: number
  sources: string[]
  responseTime: number
  requiresHumanFollowup?: boolean
  suggestedActions?: string[]
}

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  lastUpdated: Date
  verified: boolean
}

export class GroqAIService {
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

  async generateResponse(messages: AIMessage[], userContext?: any): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // Analyze user intent first
      const userMessage = messages[messages.length - 1]?.content || ""
      const intent = await this.analyzeUserIntent(userMessage)

      // Search knowledge base for relevant information
      const relevantKnowledge = this.searchKnowledgeBase(userMessage)

      // Prepare enhanced system prompt with current knowledge
      const enhancedSystemPrompt = this.buildEnhancedSystemPrompt(relevantKnowledge, intent)

      const { text } = await generateText({
        model: this.model,
        messages: [{ role: "system", content: enhancedSystemPrompt }, ...messages],
        maxTokens: 1000,
        temperature: 0.3, // Lower temperature for more consistent, factual responses
      })

      const responseTime = Date.now() - startTime

      // Determine if human followup is needed
      const requiresHumanFollowup = this.shouldRequireHumanFollowup(userMessage, intent)

      // Generate suggested actions
      const suggestedActions = this.generateSuggestedActions(intent, userMessage)

      return {
        content: text,
        confidence: this.calculateConfidence(text, relevantKnowledge),
        sources: this.extractSources(relevantKnowledge),
        responseTime,
        requiresHumanFollowup,
        suggestedActions,
      }
    } catch (error) {
      console.error("Groq AI Error:", error)

      // Truthful fallback response
      return {
        content: `عذراً، أواجه مشكلة تقنية مؤقتة في الوقت الحالي. 

للحصول على المساعدة الفورية، يرجى التواصل معنا مباشرة:
📞 الهاتف: +963940632191
💬 واتساب: +963940632191

سيكون فريقنا سعيداً لمساعدتك والإجابة على جميع استفساراتك.`,
        confidence: 1.0, // High confidence in contact information
        sources: ["contact-verified"],
        responseTime: Date.now() - startTime,
        requiresHumanFollowup: true,
      }
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
}

export const groqAI = new GroqAIService()
