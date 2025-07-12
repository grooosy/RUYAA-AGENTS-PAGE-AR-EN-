import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { knowledgeManager } from "./knowledge-manager"

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
  language: "arabic" | "english"
  confidence: number
  sources: string[]
  contextUnderstanding: number
  responseTime: number
  needsHumanFollowup: boolean
}

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  timestamp?: Date
}

interface ChatContext {
  messages: ChatMessage[]
  language: "arabic" | "english"
  topics: string[]
  lastActivity: Date
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

class GroqService {
  private context: ChatContext = {
    messages: [],
    language: "arabic",
    topics: [],
    lastActivity: new Date(),
  }

  private model = groq("llama-3.1-8b-instant")
  private readonly API_TIMEOUT = 30000 // 30 seconds
  private readonly MAX_RETRIES = 3

  // Detect language from user input
  private detectLanguage(text: string): "arabic" | "english" {
    // Arabic Unicode range and common Arabic words
    const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    const arabicWords = [
      "في",
      "من",
      "إلى",
      "على",
      "هذا",
      "هذه",
      "التي",
      "الذي",
      "كيف",
      "ماذا",
      "أين",
      "متى",
      "لماذا",
      "نعم",
      "لا",
      "شكرا",
      "مرحبا",
      "السلام",
      "وعليكم",
    ]

    // Check for Arabic characters
    if (arabicPattern.test(text)) {
      return "arabic"
    }

    // Check for Arabic words
    const words = text.toLowerCase().split(/\s+/)
    const arabicWordCount = words.filter((word) => arabicWords.includes(word)).length

    if (arabicWordCount > 0) {
      return "arabic"
    }

    return "english"
  }

  // Extract topics from conversation
  private extractTopics(messages: ChatMessage[]): string[] {
    const topics: string[] = []
    const recentMessages = messages.slice(-5) // Last 5 messages

    recentMessages.forEach((msg) => {
      if (msg.role === "user") {
        const text = msg.content.toLowerCase()

        // Arabic topics
        if (text.includes("خدمات") || text.includes("خدمة")) topics.push("services")
        if (text.includes("أسعار") || text.includes("تكلفة") || text.includes("سعر")) topics.push("pricing")
        if (text.includes("تواصل") || text.includes("اتصال") || text.includes("هاتف")) topics.push("contact")
        if (text.includes("شركة") || text.includes("معلومات")) topics.push("company")

        // English topics
        if (text.includes("service") || text.includes("help")) topics.push("services")
        if (text.includes("price") || text.includes("cost") || text.includes("pricing")) topics.push("pricing")
        if (text.includes("contact") || text.includes("phone") || text.includes("email")) topics.push("contact")
        if (text.includes("company") || text.includes("about") || text.includes("information")) topics.push("company")
      }
    })

    return [...new Set(topics)]
  }

  // Calculate context understanding score
  private calculateContextUnderstanding(userMessage: string, conversationHistory: ChatMessage[]): number {
    let score = 0.5 // Base score

    // Check if message relates to previous topics
    const currentTopics = this.extractTopics([{ role: "user", content: userMessage }])
    const previousTopics = this.extractTopics(conversationHistory)

    const topicOverlap = currentTopics.filter((topic) => previousTopics.includes(topic)).length
    if (topicOverlap > 0) {
      score += 0.3
    }

    // Check for follow-up indicators
    const followUpIndicators = ["أيضا", "كذلك", "بالإضافة", "وماذا عن", "also", "additionally", "what about", "and"]

    const hasFollowUp = followUpIndicators.some((indicator) =>
      userMessage.toLowerCase().includes(indicator.toLowerCase()),
    )

    if (hasFollowUp) {
      score += 0.2
    }

    return Math.min(score, 1.0)
  }

  // Search knowledge base for relevant information
  private async searchKnowledgeBase(
    query: string,
    language: "arabic" | "english",
  ): Promise<{
    content: string
    sources: string[]
    confidence: number
  }> {
    try {
      const knowledgeItems = await knowledgeManager.searchKnowledge(query, {
        language,
        verified: true,
        limit: 5,
      })

      if (knowledgeItems.length === 0) {
        return {
          content: "",
          sources: [],
          confidence: 0,
        }
      }

      const content = knowledgeItems.map((item) => `${item.title}: ${item.content}`).join("\n\n")

      const sources = knowledgeItems.map((item) => item.title)
      const confidence = Math.min(knowledgeItems.length * 0.2, 1.0)

      return { content, sources, confidence }
    } catch (error) {
      console.error("Error searching knowledge base:", error)
      return {
        content: "",
        sources: [],
        confidence: 0,
      }
    }
  }

  // Generate system prompt based on language and context
  private generateSystemPrompt(language: "arabic" | "english", knowledgeContent: string): string {
    const basePromptArabic = `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الذكاء الاصطناعي والوكلاء الذكيين.

قواعد مهمة:
- اجب باللغة العربية فقط
- كن مفيداً ومهذباً ومهنياً
- استخدم المعلومات المتوفرة في قاعدة المعرفة
- إذا لم تكن متأكداً من معلومة، اطلب من العميل التواصل مباشرة
- لا تقدم معلومات تواصل خاطئة
- ركز على خدمات الشركة وحلول الذكاء الاصطناعي

معلومات الشركة:
${knowledgeContent || "رؤيا كابيتال شركة متخصصة في تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي."}`

    const basePromptEnglish = `You are an intelligent assistant for Ruyaa Capital, a company specialized in AI solutions and intelligent agents.

Important rules:
- Respond in English only
- Be helpful, polite, and professional
- Use information available in the knowledge base
- If you're unsure about information, ask the client to contact directly
- Don't provide incorrect contact information
- Focus on company services and AI solutions

Company Information:
${knowledgeContent || "Ruyaa Capital is a company specialized in developing intelligent agent solutions and artificial intelligence."}`

    return language === "arabic" ? basePromptArabic : basePromptEnglish
  }

  // Main chat method
  async chat(userMessage: string): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // Detect language and update context
      const detectedLanguage = this.detectLanguage(userMessage)
      this.context.language = detectedLanguage
      this.context.lastActivity = new Date()

      // Add user message to context
      this.context.messages.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      })

      // Update topics
      this.context.topics = this.extractTopics(this.context.messages)

      // Calculate context understanding
      const contextUnderstanding = this.calculateContextUnderstanding(userMessage, this.context.messages.slice(0, -1))

      // Search knowledge base
      const knowledgeResult = await this.searchKnowledgeBase(userMessage, detectedLanguage)

      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt(detectedLanguage, knowledgeResult.content)

      // Prepare conversation history for AI
      const conversationHistory = this.context.messages
        .slice(-10) // Last 10 messages for context
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      // Call Groq API
      const result = await streamText({
        model: this.model,
        system: systemPrompt,
        messages: conversationHistory,
        temperature: 0.7,
        maxTokens: 500,
      })

      // Get the response text
      const responseText = await result.text

      // Add assistant response to context
      this.context.messages.push({
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      })

      // Calculate response metrics
      const responseTime = Date.now() - startTime
      const confidence = Math.min(knowledgeResult.confidence * 0.6 + contextUnderstanding * 0.4, 1.0)

      // Determine if human followup is needed
      const needsHumanFollowup =
        confidence < 0.5 ||
        userMessage.toLowerCase().includes("تواصل") ||
        userMessage.toLowerCase().includes("contact") ||
        userMessage.toLowerCase().includes("speak to human")

      return {
        content: responseText,
        language: detectedLanguage,
        confidence,
        sources: knowledgeResult.sources,
        contextUnderstanding,
        responseTime,
        needsHumanFollowup,
      }
    } catch (error) {
      console.error("Error in chat:", error)

      const errorMessage =
        this.context.language === "arabic"
          ? "عذراً، حدث خطأ في النظام. يرجى المحاولة مرة أخرى."
          : "Sorry, there was a system error. Please try again."

      return {
        content: errorMessage,
        language: this.context.language,
        confidence: 0,
        sources: [],
        contextUnderstanding: 0,
        responseTime: Date.now() - startTime,
        needsHumanFollowup: true,
      }
    }
  }

  // Clear conversation context
  clearContext(): void {
    this.context = {
      messages: [],
      language: "arabic",
      topics: [],
      lastActivity: new Date(),
    }
  }

  // Get current context
  getContext(): ChatContext {
    return { ...this.context }
  }

  // Check API health
  async checkHealth(): Promise<{ status: "online" | "offline" | "degraded"; responseTime: number }> {
    const startTime = Date.now()

    try {
      const result = await streamText({
        model: this.model,
        messages: [{ role: "user", content: "test" }],
        maxTokens: 10,
      })

      await result.text
      const responseTime = Date.now() - startTime

      return {
        status: responseTime < 5000 ? "online" : "degraded",
        responseTime,
      }
    } catch (error) {
      return {
        status: "offline",
        responseTime: Date.now() - startTime,
      }
    }
  }
}

export const groqService = new GroqService()
