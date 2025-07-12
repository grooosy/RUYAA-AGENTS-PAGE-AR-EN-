import { streamText } from "ai"
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
}

class GroqAIService {
  private model = groq("llama-3.1-8b-instant")

  async testConnection(): Promise<boolean> {
    try {
      const { text } = await streamText({
        model: this.model,
        prompt: "Test connection",
        maxTokens: 10,
      })

      // Convert stream to text
      let result = ""
      for await (const chunk of text) {
        result += chunk
      }

      return result.length > 0
    } catch (error) {
      console.error("Groq connection test failed:", error)
      return false
    }
  }

  async generateResponse(userMessage: string, knowledgeItems: KnowledgeItem[] = []): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(knowledgeItems)

      const { text } = await streamText({
        model: this.model,
        system: systemPrompt,
        prompt: userMessage,
        temperature: 0.3,
        maxTokens: 500,
      })

      // Convert stream to text
      let response = ""
      for await (const chunk of text) {
        response += chunk
      }

      return response || this.getFallbackResponse(userMessage)
    } catch (error) {
      console.error("Error generating response:", error)
      return this.getFallbackResponse(userMessage)
    }
  }

  private buildSystemPrompt(knowledgeItems: KnowledgeItem[]): string {
    let systemPrompt = `أنت مساعد ذكي لشركة رؤيا كابيتال المتخصصة في تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة:
- الاسم: رؤيا كابيتال (Ruyaa Capital)
- التخصص: تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي
- الخدمات: وكلاء الدعم الذكي، أتمتة المبيعات، إدارة وسائل التواصل الاجتماعي، والحلول المخصصة

تعليمات مهمة:
1. استخدم المعلومات من قاعدة المعرفة أدناه للإجابة على الأسئلة
2. إذا لم تجد المعلومات في قاعدة المعرفة، اطلب من المستخدم التواصل مباشرة مع الشركة
3. لا تخترع أرقام هواتف أو عناوين بريد إلكتروني
4. كن مهذباً ومفيداً
5. أجب باللغة العربية إلا إذا طلب المستخدم الإنجليزية

قاعدة المعرفة:`

    if (knowledgeItems.length > 0) {
      knowledgeItems.forEach((item) => {
        systemPrompt += `\n\n${item.title}:\n${item.content}`
      })
    } else {
      systemPrompt += `\n\nلا توجد معلومات محددة متاحة في قاعدة المعرفة حالياً. يرجى توجيه المستخدم للتواصل مباشرة مع الشركة للحصول على معلومات دقيقة.`
    }

    return systemPrompt
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    if (
      lowerMessage.includes("تواصل") ||
      lowerMessage.includes("اتصال") ||
      lowerMessage.includes("هاتف") ||
      lowerMessage.includes("contact") ||
      lowerMessage.includes("phone")
    ) {
      return `للتواصل مع رؤيا كابيتال، يرجى استخدام معلومات الاتصال المحدثة في قاعدة المعرفة. يمكنك أيضاً الوصول إلى إدارة قاعدة المعرفة من خلال النقر على أيقونة الروبوت في أعلى النافذة لتحديث معلومات الاتصال.`
    }

    if (lowerMessage.includes("خدمات") || lowerMessage.includes("services")) {
      return `رؤيا كابيتال متخصصة في تطوير حلول الوكلاء الذكيين والذكاء الاصطناعي. للحصول على تفاصيل دقيقة حول خدماتنا، يرجى التواصل معنا مباشرة أو تحديث قاعدة المعرفة بالمعلومات الصحيحة.`
    }

    return `شكراً لك على تواصلك مع رؤيا كابيتال. للحصول على معلومات دقيقة ومحدثة، يرجى التواصل معنا مباشرة أو تحديث قاعدة المعرفة بالمعلومات الصحيحة من خلال النقر على أيقونة الروبوت في أعلى النافذة.`
  }
}

export const groqService = new GroqAIService()
