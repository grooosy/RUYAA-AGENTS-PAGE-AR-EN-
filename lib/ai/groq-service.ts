import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface AIResponse {
  content: string
  responseTime: number
  confidence: number
  sources: string[]
  requiresHumanFollowup: boolean
  suggestedActions: string[]
}

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

interface GenerateOptions {
  userId?: string
  sessionId: string
  deviceInfo: any
  conversationContext?: string[]
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
        maxTokens: 1000,
        temperature: 0.7,
      })

      const responseTime = Date.now() - startTime
      const content = response.text

      // Analyze response for metadata
      const requiresHumanFollowup = this.analyzeHumanFollowupNeed(content)
      const suggestedActions = this.extractSuggestedActions(content)
      const confidence = this.calculateConfidence(content, conversationHistory)

      return {
        content,
        responseTime,
        confidence,
        sources: ["groq-ai", "ruyaa-knowledge-base"],
        requiresHumanFollowup,
        suggestedActions,
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
- قدم معلومات دقيقة عن خدماتنا
- وجه العملاء للتواصل المباشر للتفاصيل المحددة
- اقترح أسئلة متابعة مناسبة
- تجنب ذكر أسعار محددة واطلب التواصل المباشر

الوقت الحالي: ${options.realTimeData?.currentTime || "غير متوفر"}
مدة الجلسة: ${options.realTimeData?.sessionDuration ? Math.floor(options.realTimeData.sessionDuration / 1000) + " ثانية" : "غير متوفر"}

تذكر: أنت تمثل رؤيا كابيتال وتهدف لمساعدة العملاء في فهم خدماتنا وتوجيههم للحصول على الحلول المناسبة.`
  }

  private buildUserPrompt(conversationHistory: ConversationMessage[], options: GenerateOptions): string {
    let prompt = "سجل المحادثة:\n"

    conversationHistory.forEach((message, index) => {
      prompt += `${message.role === "user" ? "العميل" : "المساعد"}: ${message.content}\n`
    })

    if (options.conversationContext && options.conversationContext.length > 0) {
      prompt += "\nسياق المحادثة السابق:\n"
      options.conversationContext.forEach((context) => {
        prompt += `- ${context}\n`
      })
    }

    prompt += "\nيرجى الرد بطريقة مفيدة ومهنية، مع تقديم اقتراحات للأسئلة التالية إذا كان ذلك مناسباً."

    return prompt
  }

  private analyzeHumanFollowupNeed(content: string): boolean {
    const followupKeywords = [
      "سعر",
      "تكلفة",
      "عرض سعر",
      "اتفاقية",
      "عقد",
      "تفاصيل تقنية محددة",
      "تخصيص",
      "مشروع خاص",
      "متطلبات خاصة",
    ]

    return followupKeywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()))
  }

  private extractSuggestedActions(content: string): string[] {
    const actions: string[] = []

    if (content.includes("خدمات") || content.includes("حلول")) {
      actions.push("أخبرني عن خدمة محددة")
    }

    if (content.includes("وكيل ذكي") || content.includes("تدريب")) {
      actions.push("كيف يتم تدريب الوكيل؟")
    }

    if (content.includes("سعر") || content.includes("تكلفة")) {
      actions.push("التواصل للحصول على عرض سعر")
    }

    if (content.includes("دعم") || content.includes("صيانة")) {
      actions.push("ما هي خدمات الدعم المتاحة؟")
    }

    // Default actions if none detected
    if (actions.length === 0) {
      actions.push("أريد معرفة المزيد", "التحدث مع مختص")
    }

    return actions.slice(0, 3) // Limit to 3 actions
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
