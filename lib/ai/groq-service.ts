import Groq from "groq-sdk"

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp?: Date
  language?: "ar" | "en"
}

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  language: string
  tags: string[]
  isVerified: boolean
}

interface AIResponse {
  content: string
  confidence: number
  sources: string[]
  requiresHumanFollowup: boolean
  responseTime: number
  contextUnderstanding: number
  detectedLanguage: "ar" | "en"
}

interface APIStatus {
  status: "online" | "offline" | "degraded"
  responseTime: number
  lastChecked: Date
}

interface RequestContext {
  userId?: string
  sessionId: string
  deviceInfo: any
  timestamp: string
  conversationContext: {
    previousTopics: string[]
    userPreferences: any
    sessionDuration: number
    messageCount: number
  }
}

class GroqAIService {
  private groq: Groq
  private readonly maxRetries = 3
  private readonly timeoutMs = 30000

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY environment variable is not set")
      throw new Error("GROQ_API_KEY is required")
    }

    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    })
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const startTime = Date.now()

      const completion = await Promise.race([
        this.groq.chat.completions.create({
          messages: [{ role: "user", content: "test" }],
          model: "llama-3.1-8b-instant",
          max_tokens: 10,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timeout")), 5000)),
      ])

      const responseTime = Date.now() - startTime
      console.log(`Groq API connection test successful (${responseTime}ms)`)
      return true
    } catch (error) {
      console.error("Groq API connection test failed:", error)
      return false
    }
  }

  // Get API status with response time
  async getAPIStatus(): Promise<APIStatus> {
    const startTime = Date.now()

    try {
      const isOnline = await this.testConnection()
      const responseTime = Date.now() - startTime

      return {
        status: isOnline ? (responseTime > 5000 ? "degraded" : "online") : "offline",
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

  // Build system prompt based on language and knowledge
  private buildSystemPrompt(language: "ar" | "en", knowledgeItems: KnowledgeItem[]): string {
    const knowledgeContext = knowledgeItems
      .filter((item) => item.language === language && item.isVerified)
      .map((item) => `${item.title}: ${item.content}`)
      .join("\n\n")

    if (language === "ar") {
      return `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الوكلاء الذكيين والذكاء الاصطناعي.

قواعد مهمة:
- أجب باللغة العربية فقط
- لا تخلط بين اللغات أبداً
- استخدم المعلومات المتاحة في قاعدة المعرفة
- كن مفيداً ومهذباً ومهنياً
- إذا لم تكن متأكداً من المعلومات، اطلب التواصل المباشر
- لا تقدم معلومات تواصل غير مؤكدة

المعلومات المتاحة:
${knowledgeContext || "لا توجد معلومات متاحة في قاعدة المعرفة حالياً"}

أجب بناءً على هذه المعلومات فقط.`
    } else {
      return `You are an intelligent assistant for Ruyaa Capital, a company specialized in intelligent agent solutions and artificial intelligence.

Important rules:
- Respond in English only
- Never mix languages
- Use information available in the knowledge base
- Be helpful, polite, and professional
- If you're not sure about information, request direct contact
- Don't provide unverified contact information

Available information:
${knowledgeContext || "No information currently available in the knowledge base"}

Respond based only on this information.`
    }
  }

  // Generate AI response with retry logic
  async generateResponse(
    conversationHistory: ConversationMessage[],
    knowledgeItems: KnowledgeItem[] = [],
    context?: RequestContext,
  ): Promise<AIResponse> {
    const startTime = Date.now()

    // Get the latest user message to detect language
    const latestMessage = conversationHistory[conversationHistory.length - 1]
    const detectedLanguage = this.detectLanguage(latestMessage.content)

    console.log(`Generating response in ${detectedLanguage} for: "${latestMessage.content.substring(0, 50)}..."`)

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${this.maxRetries} - Making real-time API call to Groq...`)

        const systemPrompt = this.buildSystemPrompt(detectedLanguage, knowledgeItems)

        // Prepare messages for API
        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...conversationHistory.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        ]

        // Make API call with timeout
        const completion = await Promise.race([
          this.groq.chat.completions.create({
            messages,
            model: "llama-3.1-8b-instant",
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
          }),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timeout")), this.timeoutMs)),
        ])

        const responseContent = completion.choices[0]?.message?.content || ""
        const responseTime = Date.now() - startTime

        console.log(`API call successful in ${responseTime}ms`)

        // Calculate confidence based on knowledge usage and response quality
        const usedKnowledge = knowledgeItems.filter(
          (item) =>
            responseContent.toLowerCase().includes(item.title.toLowerCase()) ||
            item.content
              .split(" ")
              .some((word) => word.length > 3 && responseContent.toLowerCase().includes(word.toLowerCase())),
        )

        const confidence = Math.min(0.9, 0.3 + usedKnowledge.length * 0.2 + (responseContent.length > 100 ? 0.2 : 0))

        // Determine if human followup is needed
        const requiresHumanFollowup =
          confidence < 0.6 ||
          (detectedLanguage === "ar"
            ? responseContent.includes("لست متأكد") || responseContent.includes("يرجى التواصل")
            : responseContent.includes("not sure") || responseContent.includes("please contact"))

        // Calculate context understanding (simple heuristic)
        const contextUnderstanding = Math.min(
          1.0,
          0.5 + (conversationHistory.length > 1 ? 0.3 : 0) + (usedKnowledge.length > 0 ? 0.2 : 0),
        )

        return {
          content: responseContent,
          confidence,
          sources: usedKnowledge.map((item) => item.title),
          requiresHumanFollowup,
          responseTime,
          contextUnderstanding,
          detectedLanguage,
        }
      } catch (error) {
        lastError = error as Error
        console.error(`Attempt ${attempt} failed:`, error)

        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
          console.log(`Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // All attempts failed, return fallback response
    console.error("All API attempts failed, returning fallback response")

    const fallbackContent =
      detectedLanguage === "ar"
        ? "عذراً، أواجه صعوبة في الاتصال بالخدمة حالياً. يرجى المحاولة مرة أخرى أو التواصل المباشر للحصول على المساعدة."
        : "Sorry, I'm having trouble connecting to the service right now. Please try again or contact directly for assistance."

    return {
      content: fallbackContent,
      confidence: 0.1,
      sources: [],
      requiresHumanFollowup: true,
      responseTime: Date.now() - startTime,
      contextUnderstanding: 0.2,
      detectedLanguage,
    }
  }
}

export const groqAI = new GroqAIService()
