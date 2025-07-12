import Groq from "groq-sdk"

interface ChatResponse {
  content: string
  language: "arabic" | "english"
  confidence: number
  sources: string[]
  responseTime: number
  needsHumanFollowup: boolean
  detectedLanguage: "ar" | "en"
  contextUnderstanding: number
}

interface APIStatus {
  status: "online" | "offline" | "degraded"
  responseTime: number
  lastChecked: Date
}

interface ConversationContext {
  previousTopics: string[]
  userPreferences: Record<string, any>
  sessionDuration: number
  messageCount: number
}

class GroqService {
  private groq: Groq
  private conversationHistory: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }> = []
  private readonly maxHistoryLength = 10

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || "",
      dangerouslyAllowBrowser: true,
    })
  }

  // Detect language from text
  private detectLanguage(text: string): "ar" | "en" {
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    const englishPattern = /[a-zA-Z]/

    const arabicMatches = (text.match(arabicPattern) || []).length
    const englishMatches = (text.match(englishPattern) || []).length

    if (arabicMatches > englishMatches) return "ar"

    const arabicWords = ["في", "من", "إلى", "على", "هذا", "هذه", "كيف", "ماذا", "أين", "متى", "لماذا"]
    const englishWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "how",
      "what",
      "where",
      "when",
      "why",
    ]

    const lowerText = text.toLowerCase()
    const arabicWordCount = arabicWords.filter((word) => lowerText.includes(word)).length
    const englishWordCount = englishWords.filter((word) => lowerText.includes(word)).length

    return arabicWordCount > englishWordCount ? "ar" : "en"
  }

  // Generate system prompt based on language and context
  private generateSystemPrompt(language: "ar" | "en", knowledgeItems: any[] = []): string {
    const knowledgeContext = knowledgeItems.map((item) => `${item.title}: ${item.content}`).join("\n\n")

    if (language === "ar") {
      return `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الذكاء الاصطناعي.

معلومات الشركة:
${knowledgeContext}

تعليمات مهمة:
- أجب باللغة العربية فقط
- كن مفيداً ومهذباً ومهنياً
- استخدم المعلومات المتوفرة في قاعدة المعرفة
- إذا لم تكن متأكداً من المعلومة، اذكر ذلك بوضوح
- ركز على خدمات الشركة وحلول الذكاء الاصطناعي
- لا تقدم معلومات اتصال خاطئة
- إذا احتاج العميل لمعلومات محددة، انصحه بالتواصل المباشر مع الفريق`
    } else {
      return `You are an intelligent assistant for Ruyaa Capital, specializing in artificial intelligence solutions.

Company Information:
${knowledgeContext}

Important Instructions:
- Respond in English only
- Be helpful, polite, and professional
- Use the information available in the knowledge base
- If you're not sure about information, state that clearly
- Focus on company services and AI solutions
- Do not provide incorrect contact information
- If the customer needs specific information, advise them to contact the team directly`
    }
  }

  // Make real-time API call to Groq
  async generateResponse(
    conversationHistory: Array<{ role: "user" | "assistant"; content: string; timestamp?: Date; language?: string }>,
    knowledgeItems: any[] = [],
    context?: {
      userId?: string
      sessionId?: string
      deviceInfo?: any
      timestamp?: string
      conversationContext?: ConversationContext
    },
  ): Promise<ChatResponse> {
    const startTime = Date.now()

    try {
      // Get the latest user message
      const latestMessage = conversationHistory[conversationHistory.length - 1]
      if (!latestMessage || latestMessage.role !== "user") {
        throw new Error("No user message found")
      }

      // Detect language
      const detectedLanguage = this.detectLanguage(latestMessage.content)

      // Filter knowledge items by language
      const relevantKnowledge = knowledgeItems.filter(
        (item) => item.language === (detectedLanguage === "ar" ? "arabic" : "english") && item.isVerified,
      )

      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt(detectedLanguage, relevantKnowledge)

      // Prepare messages for API
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.slice(-8).map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ]

      console.log("Making real-time Groq API call...")

      // Make the API call with timeout
      const completion = (await Promise.race([
        this.groq.chat.completions.create({
          messages,
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("API call timeout")), 30000)),
      ])) as any

      const responseContent = completion.choices[0]?.message?.content || ""
      const responseTime = Date.now() - startTime

      // Calculate confidence based on knowledge usage and response quality
      const confidence = this.calculateConfidence(responseContent, relevantKnowledge, latestMessage.content)

      // Determine if human followup is needed
      const needsHumanFollowup = this.shouldSuggestHumanFollowup(latestMessage.content, confidence)

      // Calculate context understanding
      const contextUnderstanding = this.calculateContextUnderstanding(conversationHistory, responseContent)

      console.log(`Groq API response received in ${responseTime}ms`)

      return {
        content: responseContent,
        language: detectedLanguage === "ar" ? "arabic" : "english",
        confidence,
        sources: relevantKnowledge.map((item) => item.title),
        responseTime,
        needsHumanFollowup,
        detectedLanguage,
        contextUnderstanding,
      }
    } catch (error) {
      console.error("Error in Groq API call:", error)

      const responseTime = Date.now() - startTime
      const detectedLanguage = this.detectLanguage(conversationHistory[conversationHistory.length - 1]?.content || "")

      // Return fallback response
      return {
        content:
          detectedLanguage === "ar"
            ? "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى أو التواصل مع فريقنا للمساعدة."
            : "Sorry, there was a connection error. Please try again or contact our team for assistance.",
        language: detectedLanguage === "ar" ? "arabic" : "english",
        confidence: 0.1,
        sources: [],
        responseTime,
        needsHumanFollowup: true,
        detectedLanguage,
        contextUnderstanding: 0.0,
      }
    }
  }

  // Calculate confidence score
  private calculateConfidence(response: string, knowledgeItems: any[], userQuery: string): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence if knowledge items were used
    if (knowledgeItems.length > 0) {
      confidence += 0.3
    }

    // Increase confidence for longer, detailed responses
    if (response.length > 100) {
      confidence += 0.1
    }

    // Decrease confidence for very short responses
    if (response.length < 50) {
      confidence -= 0.2
    }

    // Increase confidence if response contains specific information
    const specificTerms = ["رؤيا كابيتال", "Ruyaa Capital", "ذكاء اصطناعي", "artificial intelligence", "وكلاء ذكيين"]
    const hasSpecificTerms = specificTerms.some((term) => response.toLowerCase().includes(term.toLowerCase()))
    if (hasSpecificTerms) {
      confidence += 0.2
    }

    return Math.min(Math.max(confidence, 0.0), 1.0)
  }

  // Determine if human followup should be suggested
  private shouldSuggestHumanFollowup(userQuery: string, confidence: number): boolean {
    // Suggest human followup for low confidence responses
    if (confidence < 0.4) return true

    // Suggest human followup for specific requests
    const humanFollowupKeywords = [
      "price",
      "cost",
      "contact",
      "phone",
      "email",
      "meeting",
      "consultation",
      "سعر",
      "تكلفة",
      "تواصل",
      "هاتف",
      "إيميل",
      "اجتماع",
      "استشارة",
    ]

    return humanFollowupKeywords.some((keyword) => userQuery.toLowerCase().includes(keyword.toLowerCase()))
  }

  // Calculate context understanding score
  private calculateContextUnderstanding(
    conversationHistory: Array<{ role: string; content: string }>,
    response: string,
  ): number {
    let understanding = 0.5

    // Higher understanding for longer conversations
    if (conversationHistory.length > 3) {
      understanding += 0.2
    }

    // Check if response references previous context
    const previousUserMessages = conversationHistory.filter((msg) => msg.role === "user").slice(-3)
    const contextReferences = previousUserMessages.some((msg) =>
      response.toLowerCase().includes(msg.content.toLowerCase().split(" ")[0]),
    )

    if (contextReferences) {
      understanding += 0.3
    }

    return Math.min(Math.max(understanding, 0.0), 1.0)
  }

  // Get API status
  async getAPIStatus(): Promise<APIStatus> {
    const startTime = Date.now()

    try {
      // Make a simple test call
      await this.groq.chat.completions.create({
        messages: [{ role: "user", content: "test" }],
        model: "llama-3.1-8b-instant",
        max_tokens: 1,
      })

      const responseTime = Date.now() - startTime

      return {
        status: responseTime > 5000 ? "degraded" : "online",
        responseTime,
        lastChecked: new Date(),
      }
    } catch (error) {
      return {
        status: "offline",
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
      }
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const status = await this.getAPIStatus()
      return status.status !== "offline"
    } catch (error) {
      return false
    }
  }

  // Clear conversation context
  clearContext(): void {
    this.conversationHistory = []
  }

  // Legacy method for backward compatibility
  async chat(message: string): Promise<ChatResponse> {
    const conversationHistory = [{ role: "user" as const, content: message, timestamp: new Date() }]
    return this.generateResponse(conversationHistory, [])
  }

  // Check health
  async checkHealth(): Promise<APIStatus> {
    return this.getAPIStatus()
  }
}

export const groqService = new GroqService()
export const groqAI = groqService // Alternative export name
