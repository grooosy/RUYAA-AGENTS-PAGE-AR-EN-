import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

class GroqService {
  private model = groq("llama-3.1-8b-instant")

  async generateResponse(userMessage: string): Promise<string> {
    const isArabic = /[\u0600-\u06FF]/.test(userMessage)

    try {
      const systemPrompt = isArabic
        ? `أنت مساعد رؤيا كابيتال. اجب بإيجاز ومهنية باللهجة السورية.

إذا ما بتعرف الجواب، قل: "ما بعرف هالشي، تواصل مع فريقنا على admin@ruyaacapital.com"

معلومات الشركة:
- رؤيا كابيتال: تطوير وكلاء ذكيين
- الوكلاء يقدروا: يحجزوا مواعيد، يعالجوا طلبات، يديروا عملاء
- التواصل: admin@ruyaacapital.com`
        : `You are Ruyaa Capital assistant. Answer briefly and professionally.

If you don't know, say: "I don't know that, contact our team at admin@ruyaacapital.com"

Company info:
- Ruyaa Capital: AI agent development
- Agents can: book appointments, process orders, manage customers
- Contact: admin@ruyaacapital.com`

      const { text } = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userMessage,
        temperature: 0.2,
        maxTokens: 150,
      })

      return text
    } catch (error) {
      return isArabic
        ? "خطأ تقني. تواصل معنا على admin@ruyaacapital.com"
        : "Technical error. Contact admin@ruyaacapital.com"
    }
  }
}

export const groqService = new GroqService()
export const groqAI = groqService
