import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

class GroqAIService {
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
      return false
    }
  }

  async checkHealth(): Promise<{
    status: "online" | "offline" | "degraded"
    responseTime: number
    lastChecked: Date
  }> {
    const startTime = Date.now()
    try {
      const isOnline = await this.testConnection()
      const responseTime = Date.now() - startTime

      return {
        status: isOnline ? (responseTime > 5000 ? "degraded" : "online") : "offline",
        responseTime,
        lastChecked: new Date(),
      }
    } catch (error) {
      return {
        status: "offline",
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
      }
    }
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Analyze user message to understand intent and context
      const messageAnalysis = this.analyzeUserMessage(userMessage)

      const systemPrompt = `أنت مساعد ذكي متقدم لشركة رؤيا كابيتال المتخصصة في تطوير الوكلاء الذكيين وحلول الذكاء الاصطناعي.

معلومات الشركة:
- اسم الشركة: رؤيا كابيتال (Ruyaa Capital)
- التخصص: تطوير الوكلاء الذكيين وحلول الذكاء الاصطناعي للشركات
- البريد الإلكتروني: admin@ruyaacapital.com
- الموقع: هذا موقع تجريبي منفصل عن الموقع الرئيسي

خدماتنا الأساسية:
1. تطوير الوكلاء الذكيين المخصصين للشركات
2. حلول الذكاء الاصطناعي التفاعلية
3. أتمتة العمليات التجارية باستخدام الذكاء الاصطناعي
4. تطوير روبوتات المحادثة الذكية
5. تحليل البيانات والتنبؤات الذكية
6. تدريب الفرق على استخدام تقنيات الذكاء الاصطناعي

ما هو الوكيل الذكي؟
الوكيل الذكي هو برنامج ذكي يمكنه:
- فهم اللغة الطبيعية والتفاعل مع المستخدمين
- تنفيذ مهام حقيقية وليس مجرد الرد على الأسئلة
- التعلم من التفاعلات وتحسين الأداء
- الاتصال بأنظمة أخرى وتنفيذ إجراءات
- اتخاذ قرارات ذكية بناءً على البيانات
- العمل بشكل مستقل لحل المشاكل

أمثلة على ما يمكن للوكلاء الذكيين فعله:
- حجز المواعيد وإدارة التقويم
- معالجة الطلبات والمدفوعات
- تحليل البيانات وإنشاء التقارير
- إدارة المخزون والطلبيات
- خدمة العملاء المتقدمة
- أتمتة المهام الإدارية

تعليمات مهمة:
- أجب باللغة العربية دائماً
- اشرح بوضوح ما هي الوكلاء الذكيين وكيف تعمل
- ركز على الإجراءات الحقيقية التي يمكن للوكلاء تنفيذها
- لا تتصرف كمستشار مالي أو شركة مالية
- هذا موقع منفصل عن أي موقع رئيسي
- لا تذكر أرقام هواتف - يوجد زر واتساب للتواصل
- فكر جيداً قبل الرد وحلل ما يريده المستخدم
- قدم أمثلة عملية وواقعية

تحليل الرسالة: ${messageAnalysis}`

      const { text } = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userMessage,
        maxTokens: 800,
        temperature: 0.4,
      })

      return text || "أعتذر، لم أتمكن من معالجة طلبك. يرجى التواصل معنا على admin@ruyaacapital.com"
    } catch (error) {
      console.error("Error generating response:", error)
      throw new Error("فشل في توليد الرد من الخدمة الذكية")
    }
  }

  private analyzeUserMessage(message: string): string {
    const lowerMessage = message.toLowerCase()

    // Detect language
    const isArabic = /[\u0600-\u06FF]/.test(message)
    const language = isArabic ? "عربي" : "إنجليزي"

    // Detect intent
    let intent = "عام"
    if (lowerMessage.includes("وكيل") || lowerMessage.includes("agent")) {
      intent = "استفسار عن الوكلاء الذكيين"
    } else if (lowerMessage.includes("خدمة") || lowerMessage.includes("service")) {
      intent = "استفسار عن الخدمات"
    } else if (lowerMessage.includes("كيف") || lowerMessage.includes("how")) {
      intent = "طلب شرح أو تعليمات"
    } else if (lowerMessage.includes("سعر") || lowerMessage.includes("price") || lowerMessage.includes("تكلفة")) {
      intent = "استفسار عن الأسعار"
    } else if (lowerMessage.includes("تواصل") || lowerMessage.includes("contact")) {
      intent = "طلب معلومات التواصل"
    }

    // Detect complexity
    const wordCount = message.split(" ").length
    const complexity = wordCount > 10 ? "معقد" : wordCount > 5 ? "متوسط" : "بسيط"

    return `اللغة: ${language}, النية: ${intent}, التعقيد: ${complexity}`
  }
}

// Export the service instance
export const groqService = new GroqAIService()
export const groqAI = new GroqAIService()
export { GroqAIService }
export default GroqAIService
