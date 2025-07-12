import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  language: string
  tags: string[]
  isVerified: boolean
  lastUpdated: Date
  metadata?: Record<string, any>
}

interface AIResponse {
  content: string
  responseTime: number
  confidence: number
  sources: string[]
  requiresHumanFollowup: boolean
  detectedLanguage: "ar" | "en"
  contextUnderstanding: number
}

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  language?: "ar" | "en"
}

interface GenerateOptions {
  userId?: string
  sessionId: string
  deviceInfo: any
  timestamp?: string
  conversationContext?: {
    previousTopics: string[]
    userPreferences: Record<string, any>
    sessionDuration: number
    messageCount: number
  }
}

class GroqAIService {
  private model = groq("llama-3.1-8b-instant")
  private readonly API_TIMEOUT = 30000 // 30 seconds
  private readonly MAX_RETRIES = 3

  private systemPrompt = `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: حلول الوكلاء الذكيين والذكاء الاصطناعي للشركات
- الموقع: سوريا

الخدمات الرئيسية:
1. تطوير وكلاء ذكيين مخصصين للشركات
2. حلول الذكاء الاصطناعي للأعمال
3. أتمتة العمليات التجارية
4. استشارات تقنية في مجال الذكاء الاصطناعي
5. تدريب الفرق على استخدام التقنيات الحديثة

إرشادات المحادثة:
- أجب باللغة العربية دائماً
- كن مفيداً ومهذباً
- ركز على خدمات الشركة
- لا تقدم معلومات تقنية مفصلة عن الأسعار أو التفاصيل الدقيقة
- وجه العملاء للتواصل المباشر للحصول على عروض أسعار مخصصة
- لا تخترع معلومات غير موجودة
- إذا لم تكن متأكداً من إجابة، اطلب من العميل التواصل مباشرة

تذكر: أنت مساعد أولي، والهدف هو تقديم معلومات عامة وتوجيه العملاء للتواصل المباشر للتفاصيل المحددة.`

  // Language detection using multiple methods
  private detectLanguage(text: string): "ar" | "en" {
    // Arabic Unicode ranges
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    const englishPattern = /[a-zA-Z]/

    const arabicMatches = (text.match(arabicPattern) || []).length
    const englishMatches = (text.match(englishPattern) || []).length

    // If more Arabic characters, it's Arabic
    if (arabicMatches > englishMatches) return "ar"

    // Check for common Arabic words
    const arabicWords = ["في", "من", "إلى", "على", "هذا", "هذه", "التي", "الذي", "كيف", "ماذا", "أين", "متى", "لماذا"]
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
      "of",
      "with",
      "by",
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

  // Build context-aware system prompt
  private buildSystemPrompt(
    language: "ar" | "en",
    knowledgeItems: KnowledgeItem[],
    conversationHistory: ConversationMessage[],
  ): string {
    const contextTopics = this.extractTopicsFromHistory(conversationHistory)

    if (language === "ar") {
      return `أنت مساعد ذكي متقدم لشركة رؤيا كابيتال المتخصصة في حلول الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي للشركات
- الموقع: سوريا

الخدمات الرئيسية:
1. تطوير وكلاء ذكيين مخصصين للشركات
2. حلول الذكاء الاصطناعي للأعمال
3. أتمتة العمليات التجارية
4. استشارات تقنية في مجال الذكاء الاصطناعي
5. تدريب الفرق على استخدام التقنيات الحديثة

السياق الحالي للمحادثة:
${contextTopics.length > 0 ? `المواضيع المطروحة سابقاً: ${contextTopics.join("، ")}` : "بداية محادثة جديدة"}

قاعدة المعرفة المتاحة:
${knowledgeItems.length > 0 ? knowledgeItems.map((item) => `- ${item.title}: ${item.content}`).join("\n") : "لا توجد معلومات محددة في قاعدة المعرفة حالياً"}

إرشادات مهمة:
- أجب باللغة العربية فقط
- استخدم المعلومات من قاعدة المعرفة المتاحة
- إذا لم تجد معلومات كافية، اطلب من المستخدم تحديث قاعدة المعرفة
- حافظ على السياق من المحادثات السابقة
- كن مفيداً ومهذباً ومهنياً
- لا تخترع معلومات غير موجودة
- ركز على خدمات الشركة وحلولها التقنية`
    } else {
      return `You are an advanced AI assistant for Ruyaa Capital, specializing in intelligent agent solutions and artificial intelligence.

Company Information:
- Company Name: Ruyaa Capital
- Specialization: Development of intelligent agent solutions and AI for businesses
- Location: Syria

Main Services:
1. Custom intelligent agent development for companies
2. AI solutions for business
3. Business process automation
4. Technical consulting in AI field
5. Team training on modern technologies

Current Conversation Context:
${contextTopics.length > 0 ? `Previously discussed topics: ${contextTopics.join(", ")}` : "New conversation started"}

Available Knowledge Base:
${knowledgeItems.length > 0 ? knowledgeItems.map((item) => `- ${item.title}: ${item.content}`).join("\n") : "No specific information available in knowledge base currently"}

Important Guidelines:
- Respond in English only
- Use information from the available knowledge base
- If insufficient information is found, ask the user to update the knowledge base
- Maintain context from previous conversations
- Be helpful, polite, and professional
- Do not invent non-existent information
- Focus on company services and technical solutions`
    }
  }

  // Extract topics from conversation history for context
  private extractTopicsFromHistory(history: ConversationMessage[]): string[] {
    const topics: string[] = []
    const keywordMap = {
      ar: {
        خدمات: "services",
        أسعار: "pricing",
        تواصل: "contact",
        وكيل: "agent",
        ذكي: "intelligent",
        تطوير: "development",
        حلول: "solutions",
        أتمتة: "automation",
        تدريب: "training",
        استشارة: "consultation",
      },
      en: {
        services: "services",
        pricing: "pricing",
        contact: "contact",
        agent: "agent",
        intelligent: "intelligent",
        development: "development",
        solutions: "solutions",
        automation: "automation",
        training: "training",
        consultation: "consultation",
      },
    }

    history.forEach((message) => {
      const lang = message.language || this.detectLanguage(message.content)
      const keywords = keywordMap[lang]
      const content = message.content.toLowerCase()

      Object.keys(keywords).forEach((keyword) => {
        if (content.includes(keyword) && !topics.includes(keywords[keyword])) {
          topics.push(keywords[keyword])
        }
      })
    })

    return topics.slice(-5) // Keep last 5 topics for context
  }

  // Test real-time connection to Groq API
  async testConnection(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for test

      const response = await generateText({
        model: this.model,
        prompt: "Test",
        maxTokens: 5,
        abortSignal: controller.signal,
      })

      clearTimeout(timeoutId)
      return !!response.text && response.text.length > 0
    } catch (error) {
      console.error("Groq API connection test failed:", error)
      return false
    }
  }

  // Generate response with real-time API call and retry logic
  async generateResponse(
    conversationHistory: ConversationMessage[],
    knowledgeItems: KnowledgeItem[] = [],
    options: GenerateOptions,
  ): Promise<AIResponse> {
    const startTime = Date.now()
    let lastError: Error | null = null

    // Detect language from the latest user message
    const latestUserMessage = conversationHistory.filter((msg) => msg.role === "user").pop()
    const detectedLanguage = latestUserMessage ? this.detectLanguage(latestUserMessage.content) : "ar"

    // Filter knowledge base by detected language
    const relevantKnowledge = knowledgeItems.filter((item) => item.language === detectedLanguage && item.isVerified)

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.API_TIMEOUT)

        const systemPrompt = this.buildSystemPrompt(detectedLanguage, relevantKnowledge, conversationHistory)
        const userPrompt = this.buildUserPrompt(conversationHistory, options, detectedLanguage)

        console.log(`Attempt ${attempt}: Making real-time API call to Groq...`)

        const response = await generateText({
          model: this.model,
          system: systemPrompt,
          prompt: userPrompt,
          maxTokens: 800,
          temperature: 0.3,
          abortSignal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.text || response.text.trim().length === 0) {
          throw new Error("Empty response from API")
        }

        const responseTime = Date.now() - startTime
        const content = response.text.trim()

        // Calculate context understanding score
        const contextUnderstanding = this.calculateContextUnderstanding(content, conversationHistory, relevantKnowledge)

        const requiresHumanFollowup = this.analyzeHumanFollowupNeed(content, detectedLanguage)
        const confidence = this.calculateConfidence(content, conversationHistory, relevantKnowledge)

        console.log(`API call successful on attempt ${attempt}. Response time: ${responseTime}ms`)

        return {
          content,
          responseTime,
          confidence,
          sources: relevantKnowledge.map((item) => item.title),
          requiresHumanFollowup,
          detectedLanguage,
          contextUnderstanding,
        }
      } catch (error) {
        lastError = error as Error
        console.error(`Attempt ${attempt} failed:`, error)

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff: wait 2^attempt seconds
          const waitTime = Math.pow(2, attempt) * 1000
          console.log(`Waiting ${waitTime}ms before retry...`)
          await new Promise((resolve) => setTimeout(resolve, waitTime))
        }
      }
    }

    // All retries failed, return fallback response
    console.error("All API attempts failed, using fallback response")
    throw new Error(`API call failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`)
  }

  // Build user prompt with context and language awareness
  private buildUserPrompt(
    conversationHistory: ConversationMessage[],
    options: GenerateOptions,
    language: "ar" | "en",
  ): string {
    const contextInfo = options.conversationContext

    let prompt = language === "ar" ? "سجل المحادثة:\n" : "Conversation History:\n"

    // Add conversation history with timestamps
    conversationHistory.slice(-10).forEach((message, index) => {
      const role =
        message.role === "user"
          ? language === "ar"
            ? "المستخدم"
            : "User"
          : language === "ar"
            ? "المساعد"
            : "Assistant"

      prompt += `${role}: ${message.content}\n`
    })

    // Add context information
    if (contextInfo) {
      if (language === "ar") {
        prompt += `\nمعلومات السياق:\n`
        prompt += `- مدة الجلسة: ${Math.round(contextInfo.sessionDuration / 1000)} ثانية\n`
        prompt += `- عدد الرسائل: ${contextInfo.messageCount}\n`
        if (contextInfo.previousTopics.length > 0) {
          prompt += `- المواضيع السابقة: ${contextInfo.previousTopics.join("، ")}\n`
        }
      } else {
        prompt += `\nContext Information:\n`
        prompt += `- Session Duration: ${Math.round(contextInfo.sessionDuration / 1000)} seconds\n`
        prompt += `- Message Count: ${contextInfo.messageCount}\n`
        if (contextInfo.previousTopics.length > 0) {
          prompt += `- Previous Topics: ${contextInfo.previousTopics.join(", ")}\n`
        }
      }
    }

    prompt +=
      language === "ar"
        ? "\nيرجى الرد بطريقة مفيدة ومهنية باللغة العربية فقط."
        : "\nPlease respond helpfully and professionally in English only."

    return prompt
  }

  // Calculate context understanding score
  private calculateContextUnderstanding(
    response: string,
    conversationHistory: ConversationMessage[],
    knowledgeItems: KnowledgeItem[],
  ): number {
    let score = 0.5 // Base score

    // Check if response references previous conversation
    const recentMessages = conversationHistory.slice(-3)
    const hasContextReference = recentMessages.some((msg) =>
      response.toLowerCase().includes(msg.content.toLowerCase().substring(0, 20)),
    )
    if (hasContextReference) score += 0.2

    // Check if response uses knowledge base information
    const usesKnowledge = knowledgeItems.some(
      (item) =>
        response.toLowerCase().includes(item.title.toLowerCase()) ||
        response.toLowerCase().includes(item.content.toLowerCase().substring(0, 50)),
    )
    if (usesKnowledge) score += 0.2

    // Check response length and detail
    if (response.length > 100) score += 0.1
    if (response.length > 300) score += 0.1

    return Math.min(score, 1.0)
  }

  // Analyze if human followup is needed
  private analyzeHumanFollowupNeed(content: string, language: "ar" | "en"): boolean {
    const followupKeywords =
      language === "ar"
        ? [
            "سعر",
            "تكلفة",
            "عرض سعر",
            "اتفاقية",
            "عقد",
            "تفاصيل تقنية",
            "تخصيص",
            "مشروع",
            "متطلبات خاصة",
            "استشارة",
            "اجتماع",
            "موعد",
          ]
        : [
            "price",
            "cost",
            "quote",
            "agreement",
            "contract",
            "technical details",
            "customization",
            "project",
            "special requirements",
            "consultation",
            "meeting",
            "appointment",
          ]

    const uncertaintyPhrases =
      language === "ar"
        ? ["قد يكون", "ربما", "غير متأكد", "يحتاج تأكيد", "للمزيد من المعلومات"]
        : ["might be", "maybe", "not sure", "needs confirmation", "for more information"]

    const lowerContent = content.toLowerCase()

    const hasFollowupKeywords = followupKeywords.some((keyword) => lowerContent.includes(keyword.toLowerCase()))

    const hasUncertainty = uncertaintyPhrases.some((phrase) => lowerContent.includes(phrase.toLowerCase()))

    return hasFollowupKeywords || hasUncertainty
  }

  // Calculate confidence score
  private calculateConfidence(
    content: string,
    conversationHistory: ConversationMessage[],
    knowledgeItems: KnowledgeItem[],
  ): number {
    let confidence = 0.7 // Base confidence

    // Higher confidence if using verified knowledge
    if (knowledgeItems.length > 0) {
      const usesVerifiedKnowledge = knowledgeItems.some(
        (item) =>
          item.isVerified &&
          (content.toLowerCase().includes(item.title.toLowerCase()) ||
            content.toLowerCase().includes(item.content.toLowerCase().substring(0, 50))),
      )
      if (usesVerifiedKnowledge) confidence += 0.2
    }

    // Lower confidence for very short responses
    if (content.length < 50) confidence -= 0.2

    // Higher confidence for detailed responses
    if (content.length > 200) confidence += 0.1

    // Lower confidence if expressing uncertainty
    const uncertaintyWords = ["قد", "ربما", "غير متأكد", "might", "maybe", "not sure"]
    const hasUncertainty = uncertaintyWords.some((word) => content.toLowerCase().includes(word.toLowerCase()))
    if (hasUncertainty) confidence -= 0.3

    return Math.min(Math.max(confidence, 0.1), 1.0)
  }

  // Get API status for monitoring
  async getAPIStatus(): Promise<{
    status: "online" | "offline" | "degraded"
    responseTime: number
    lastChecked: Date
  }> {
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
}

export const groqAI = new GroqAIService()
