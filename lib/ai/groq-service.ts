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
  private model = groq("llama-3.1-8b-instant")

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

  async testConnection(): Promise<boolean> {
    try {
      const response = await generateText({
        model: this.model,
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
      const userPrompt = this.buildUserPrompt(conversationHistory, options)

      const response = await generateText({
        model: this.model,
        system: this.systemPrompt,
        prompt: userPrompt,
        maxTokens: 800,
        temperature: 0.3,
      })

      const responseTime = Date.now() - startTime
      const content = response.text

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
    let confidence = 0.8

    if (content.includes("رؤيا كابيتال") || content.includes("وكيل ذكي")) {
      confidence += 0.1
    }

    if (content.length < 50) {
      confidence -= 0.2
    }

    if (content.length > 200) {
      confidence += 0.1
    }

    return Math.min(Math.max(confidence, 0.1), 1.0)
  }
}

export const groqAI = new GroqAIService()
