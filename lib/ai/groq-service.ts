import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export class GroqAIService {
  private model = groq("llama-3.1-8b-instant")

  async testConnection(): Promise<boolean> {
    try {
      const { text } = await generateText({
        model: this.model,
        prompt: "Test connection",
        maxTokens: 10,
      })
      return !!text
    } catch (error) {
      console.error("Groq connection test failed:", error)
      throw error
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const systemPrompt = `أنت مساعد ذكي لشركة رؤيا كابيتال، شركة خدمات مالية واستثمارية رائدة في المملكة العربية السعودية.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال
- التخصص: الخدمات المالية والاستثمارية
- الموقع: المملكة العربية السعودية
- رقم الهاتف: +966 11 234 5678
- البريد الإلكتروني: info@ruyaacapital.com

الخدمات المقدمة:
1. الاستشارات المالية والاستثمارية
2. إدارة المحافظ الاستثمارية
3. التخطيط المالي الشخصي والمؤسسي
4. خدمات الوساطة المالية
5. تحليل الأسواق المالية
6. الاستثمار في الأسهم والسندات
7. صناديق الاستثمار
8. التمويل المؤسسي

تعليمات الرد:
- أجب باللغة العربية فقط
- كن مهذباً ومهنياً
- قدم معلومات دقيقة عن خدمات الشركة
- إذا لم تكن متأكداً من إجابة، وجه العميل للتواصل المباشر
- لا تقدم نصائح مالية محددة، بل وجه للاستشارة المتخصصة
- اذكر معلومات التواصل عند الحاجة`

      const { text } = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userMessage,
        maxTokens: 500,
        temperature: 0.3,
      })

      return text || "أعتذر، لم أتمكن من معالجة طلبك. يرجى التواصل معنا مباشرة على +966 11 234 5678"
    } catch (error) {
      console.error("Error generating response:", error)
      throw new Error("فشل في توليد الرد من الخدمة الذكية")
    }
  }
}
