import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

interface AIResponse {
  message: string
  analysis: {
    language: "ar" | "en"
    intent: string
    confidence: number
  }
}

class GroqService {
  private model = groq("llama-3.1-8b-instant")

  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Detect language
      const isArabic = /[\u0600-\u06FF]/.test(userMessage)
      const language = isArabic ? "ar" : "en"

      // System prompt with strict guidelines
      const systemPrompt =
        language === "ar"
          ? `أنت مساعد ذكي لشركة رؤيا كابيتال. تحدث باللهجة السورية بشكل مهني وودود.

القواعد الصارمة:
- إذا لم تعرف الجواب، قل "ما بعرف هالشي، بس ممكن تتواصل مع فريقنا على admin@ruyaacapital.com"
- لا تخمن أو تفترض أي معلومات
- لا تجاوب على أسئلة خارج نطاق عملنا
- كن مهني وودود بنفس الوقت
- استخدم اللهجة السورية الطبيعية

معلومات الشركة فقط:
- رؤيا كابيتال: شركة تطوير حلول الذكاء الاصطناعي
- نطور وكلاء ذكيين يقومون بمهام حقيقية
- الوكلاء يقدروا: يحجزوا مواعيد، يعالجوا طلبات، يديروا عملاء
- البريد الإلكتروني: admin@ruyaacapital.com

إذا السؤال مش متعلق بشغلنا، قل "هالسؤال مش من اختصاصي، بس ممكن تتواصل معنا على admin@ruyaacapital.com"`
          : `You are a professional AI assistant for Ruyaa Capital. Be friendly but strictly professional.

STRICT RULES:
- If you don't know something, say "I don't know that, but you can contact our team at admin@ruyaacapital.com"
- Never guess or assume information
- Don't answer questions outside our business scope
- Be professional and friendly
- Stay focused on our services only

Company Info ONLY:
- Ruyaa Capital: AI solutions development company
- We develop intelligent agents that perform real actions
- AI agents can: book appointments, process orders, manage customers
- Email: admin@ruyaacapital.com

If the question is not about our business, say "That's not my area of expertise, but you can contact us at admin@ruyaacapital.com"`

      const { text } = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userMessage,
        temperature: 0.3, // Lower temperature for more focused responses
        maxTokens: 200, // Shorter responses
      })

      return text
    } catch (error) {
      console.error("Groq service error:", error)
      const errorMsg = /[\u0600-\u06FF]/.test(userMessage)
        ? "عذراً، حدث خطأ تقني. تواصل معنا على admin@ruyaacapital.com"
        : "Sorry, technical error occurred. Contact us at admin@ruyaacapital.com"
      return errorMsg
    }
  }

  async checkHealth() {
    try {
      const startTime = Date.now()
      await generateText({
        model: this.model,
        prompt: "Hello",
        maxTokens: 10,
      })
      const responseTime = Date.now() - startTime

      return {
        status: "online" as const,
        responseTime,
        lastChecked: new Date(),
      }
    } catch (error) {
      return {
        status: "offline" as const,
        responseTime: 0,
        lastChecked: new Date(),
      }
    }
  }
}

export const groqService = new GroqService()
export const groqAI = groq("llama-3.1-8b-instant")
