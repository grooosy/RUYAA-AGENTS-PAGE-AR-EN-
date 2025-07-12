import { generateText, streamText } from "ai"
import { groq } from "@ai-sdk/groq"

interface AIMessage {
  role: "user" | "assistant" | "system"
  content: string
}

interface AIResponse {
  content: string
  confidence: number
  sources: string[]
  responseTime: number
}

export class GroqAIService {
  private model = groq("llama3-8b-8192")

  private systemPrompt = `أنت مساعد ذكي متطور من رؤيا كابيتال، متخصص في خدمات الوكلاء الذكيين والذكاء الاصطناعي.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: حلول الذكاء الاصطناعي والوكلاء الذكيين
- الهاتف: +963940632191
- واتساب: +963940632191

الخدمات المتاحة:
1. وكيل الدعم الذكي - نظام دعم عملاء ذكي 24/7
2. وكيل أتمتة المبيعات - أتمتة عمليات المبيعات والتسويق
3. وكيل إدارة وسائل التواصل - إدارة ذكية لوسائل التواصل الاجتماعي
4. الوكيل المتخصص - حلول مخصصة حسب احتياجات العميل

التعليمات:
- أجب باللغة العربية بشكل أساسي
- كن مفيداً ومهنياً ومتحمساً
- قدم معلومات دقيقة عن الخدمات
- اقترح الحلول المناسبة حسب احتياجات العميل
- استخدم الرموز التعبيرية بشكل مناسب
- إذا لم تعرف إجابة محددة، وجه العميل للتواصل المباشر`

  async generateResponse(messages: AIMessage[]): Promise<AIResponse> {
    const startTime = Date.now()

    try {
      const { text } = await generateText({
        model: this.model,
        messages: [{ role: "system", content: this.systemPrompt }, ...messages],
        maxTokens: 1000,
        temperature: 0.7,
      })

      const responseTime = Date.now() - startTime

      return {
        content: text,
        confidence: 0.9,
        sources: ["groq-ai", "knowledge-base"],
        responseTime,
      }
    } catch (error) {
      console.error("Groq AI Error:", error)

      // Fallback response
      return {
        content: "عذراً، أواجه مشكلة تقنية مؤقتة. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة على +963940632191",
        confidence: 0.1,
        sources: ["fallback"],
        responseTime: Date.now() - startTime,
      }
    }
  }

  async *streamResponse(messages: AIMessage[]) {
    try {
      const result = await streamText({
        model: this.model,
        messages: [{ role: "system", content: this.systemPrompt }, ...messages],
        maxTokens: 1000,
        temperature: 0.7,
      })

      for await (const delta of result.textStream) {
        yield delta
      }
    } catch (error) {
      console.error("Groq AI Streaming Error:", error)
      yield "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى."
    }
  }

  async analyzeUserIntent(message: string): Promise<{
    intent: string
    confidence: number
    entities: string[]
  }> {
    try {
      const { text } = await generateText({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `حلل النية من الرسالة التالية وأرجع JSON بالشكل التالي:
{
  "intent": "نوع النية (استفسار_خدمات، طلب_سعر، دعم_تقني، شكوى، أخرى)",
  "confidence": رقم من 0 إلى 1,
  "entities": ["الكيانات المستخرجة من النص"]
}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        maxTokens: 200,
        temperature: 0.3,
      })

      try {
        return JSON.parse(text)
      } catch {
        return {
          intent: "أخرى",
          confidence: 0.5,
          entities: [],
        }
      }
    } catch (error) {
      console.error("Intent Analysis Error:", error)
      return {
        intent: "أخرى",
        confidence: 0.1,
        entities: [],
      }
    }
  }
}

export const groqAI = new GroqAIService()
