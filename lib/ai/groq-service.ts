import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface AIResponse {
  content: string
  responseTime: number
  confidence: number
  sources: string[]
  requiresHumanFollowup: boolean
}

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

interface GenerateOptions {
  userId?: string
  sessionId: string
  deviceInfo: any
  timestamp?: string
  realTimeData?: {
    currentTime: string
    userLocation: string
    sessionDuration: number
    messageCount?: number
  }
}

class GroqAIService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || ""
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: "Test connection",
        maxTokens: 10,
      })
      return !!response.text
    } catch (error) {
      console.error("Groq connection test failed:", error)
      return false
    }
  }

  async generateResponse(conversationHistory: ConversationMessage[], options: GenerateOptions): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      const systemPrompt = this.buildSystemPrompt(options)
      const userPrompt = this.buildUserPrompt(conversationHistory, options)

      const response = await generateText({
        model: groq("llama-3.1-8b-instant"),
        system: systemPrompt,
        prompt: userPrompt,
        maxTokens: 800,
        temperature: 0.3,
      })

      const responseTime = Date.now() - startTime
      const content = response.text

      // Analyze response for metadata
      const requiresHumanFollowup = this.analyzeHumanFollowupNeed(content)
      const confidence = this.calculateConfidence(content, conversationHistory)

      return {
        content,
        responseTime,
        confidence,
        sources: ["groq-ai", "ruyaa-knowledge-base"],
        requiresHumanFollowup,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      throw new Error("فشل في توليد الاستجابة من الذكاء الاصطناعي")
    }
  }

  private buildSystemPrompt(options: GenerateOptions): string {
    return `أنت مساعد ذكي متخصص لشركة رؤيا كابيتال، شركة رائدة في مجال الوكلاء الذكيين والحلول التقنية المتقدمة.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: تطوير وتدريب الوكلاء الذكيين للشركات
- رقم التواصل: +963940632191
- الموقع: سوريا

خدماتنا الرئيسية:
1. تطوير وكلاء ذكيين مخصصين للشركات
2. تدريب الوكلاء الذكيين على بيانات الشركة
3. دمج الوكلاء الذكيين مع أنظمة الشركة الحالية
4. خدمات الدعم والصيانة المستمرة
5. استشارات تقنية متخصصة

مبادئ الرد:
- كن مفيداً ومهذباً ومهنياً
- استخدم اللغة العربية بطلاقة
- قدم معلومات دقيقة عن خدماتنا فقط
- وجه العملاء للتواصل المباشر للتفاصيل المحددة
- تجنب ذكر أسعار محددة أو معلومات تقنية مفصلة
- لا تقدم اقتراحات أو نصائح خارج نطاق خدماتنا
- ركز على الإجابة المباشرة على السؤال المطروح

تذكر: أنت تمثل رؤيا كابيتال وتهدف لمساعدة العملاء في فهم خدماتنا وتوجيههم للحصول على الحلول المناسبة.`
  }

  private buildUserPrompt(conversationHistory: ConversationMessage[], options: GenerateOptions): string {
    let prompt = "سجل المحادثة:\n"

    conversationHistory.forEach((message, index) => {
      prompt += `${message.role === "user" ? "العميل" : "المساعد"}: ${message.content}\n`
    })

    prompt += "\nيرجى الرد بطريقة مفيدة ومهنية ومباشرة."

    return prompt
  }

  private analyzeHumanFollowupNeed(content: string): boolean {
    const followupKeywords = [
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
    ]

    return followupKeywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()))
  }

  private calculateConfidence(content: string, conversationHistory: ConversationMessage[]): number {
    let confidence = 0.8 // Base confidence

    // Increase confidence for specific service mentions
    if (content.includes("رؤيا كابيتال") || content.includes("وكيل ذكي")) {
      confidence += 0.1
    }

    // Decrease confidence for very short responses
    if (content.length < 50) {
      confidence -= 0.2
    }

    // Increase confidence for longer, detailed responses
    if (content.length > 200) {
      confidence += 0.1
    }

    return Math.min(Math.max(confidence, 0.1), 1.0)
  }
}

export const groqAI = new GroqAIService()
