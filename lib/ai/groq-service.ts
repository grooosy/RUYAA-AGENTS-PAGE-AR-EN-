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

interface RequestContext {
  userId?: string
  sessionId: string
  deviceInfo: any
  timestamp: string
  realTimeData?: {
    currentTime: string
    userLocation: string
    sessionDuration: number
    messageCount?: number
  }
}

class GroqAIService {
  // Updated to use a supported model
  private model = groq("llama-3.1-8b-instant")

  private systemPrompt = `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في حلول الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: حلول الوكلاء الذكيين والذكاء الاصطناعي للشركات
- رقم الهاتف: +963940632191
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

  async generateResponse(conversationHistory: ConversationMessage[], context: RequestContext): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      // Prepare the conversation for the AI
      const lastUserMessage = conversationHistory[conversationHistory.length - 1]?.content || ""

      const response = await generateText({
        model: this.model,
        system: this.systemPrompt,
        prompt: `المحادثة السابقة:
${conversationHistory.map((msg) => `${msg.role === "user" ? "العميل" : "المساعد"}: ${msg.content}`).join("\n")}

يرجى الرد بطريقة مفيدة ومهنية ومباشرة.`,
        temperature: 0.3,
        maxTokens: 500,
      })

      const responseTime = Date.now() - startTime

      // Determine if human followup is needed based on content
      const requiresHumanFollowup = this.shouldRequireHumanFollowup(response.text)

      return {
        content: response.text,
        responseTime,
        confidence: 0.85,
        sources: ["groq_ai"],
        requiresHumanFollowup,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)

      // Fallback response
      return {
        content: `عذراً، حدث خطأ تقني. 

للحصول على المساعدة الفورية، يرجى التواصل معنا مباشرة:
📞 (+963940632191)

سيكون فريقنا سعيداً لمساعدتك في أي استفسار حول خدمات رؤيا كابيتال.`,
        responseTime: Date.now() - startTime,
        confidence: 1.0,
        sources: ["fallback"],
        requiresHumanFollowup: true,
      }
    }
  }

  private shouldRequireHumanFollowup(content: string): boolean {
    const followupKeywords = [
      "سعر",
      "تكلفة",
      "عرض",
      "اقتباس",
      "price",
      "cost",
      "تفاصيل تقنية",
      "مواصفات",
      "specifications",
      "عقد",
      "اتفاقية",
      "contract",
      "موعد",
      "اجتماع",
      "meeting",
    ]

    return followupKeywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()))
  }
}

export const groqAI = new GroqAIService()
