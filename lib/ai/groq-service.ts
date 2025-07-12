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

  private detectLanguage(text: string): "ar" | "en" {
    // Check for Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/
    const hasArabic = arabicRegex.test(text)

    // Check for English words
    const englishWords = text.toLowerCase().match(/\b[a-z]+\b/g) || []
    const hasEnglish = englishWords.length > 0

    // If more than 50% Arabic characters, it's Arabic
    if (hasArabic && !hasEnglish) return "ar"
    if (hasEnglish && !hasArabic) return "en"

    // Mixed or unclear - default to Arabic
    return "ar"
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const detectedLanguage = this.detectLanguage(userMessage)

      const systemPrompt =
        detectedLanguage === "en"
          ? `You are an AI assistant for Ruyaa Capital, a company specializing in AI agent development and artificial intelligence solutions.

Company Information:
- Company Name: Ruyaa Capital
- Specialization: AI agent development and artificial intelligence solutions for businesses
- Email: admin@ruyaacapital.com
- This is a demo website separate from the main website

Our Services:
1. Custom AI agent development for companies
2. Interactive artificial intelligence solutions
3. Business process automation using AI
4. Smart chatbot development
5. Data analysis and intelligent predictions
6. Team training on AI technologies

What is an AI Agent?
An AI agent is an intelligent program that can:
- Understand natural language and interact with users
- Perform real tasks, not just answer questions
- Learn from interactions and improve performance
- Connect to other systems and execute actions
- Make intelligent decisions based on data
- Work independently to solve problems

Examples of what AI agents can do:
- Book appointments and manage calendars
- Process orders and payments
- Analyze data and create reports
- Manage inventory and orders
- Advanced customer service
- Automate administrative tasks

Important Instructions:
- Always respond in English when user writes in English
- Clearly explain what AI agents are and how they work
- Focus on real actions that agents can perform
- Do not act as a financial advisor or financial company
- This is a separate demo website
- Do not mention phone numbers - there's a WhatsApp button for contact
- Think carefully before responding and analyze what the user wants
- Provide practical and realistic examples`
          : `أنت مساعد ذكي متقدم لشركة رؤيا كابيتال المتخصصة في تطوير الوكلاء الذكيين وحلول الذكاء الاصطناعي.

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
- أجب باللغة العربية دائماً عندما يكتب المستخدم بالعربية
- اشرح بوضوح ما هي الوكلاء الذكيين وكيف تعمل
- ركز على الإجراءات الحقيقية التي يمكن للوكلاء تنفيذها
- لا تتصرف كمستشار مالي أو شركة مالية
- هذا موقع منفصل عن أي موقع رئيسي
- لا تذكر أرقام هواتف - يوجد زر واتساب للتواصل
- فكر جيداً قبل الرد وحلل ما يريده المستخدم
- قدم أمثلة عملية وواقعية`

      const { text } = await generateText({
        model: this.model,
        system: systemPrompt,
        prompt: userMessage,
        maxTokens: 800,
        temperature: 0.4,
      })

      return (
        text ||
        (detectedLanguage === "en"
          ? "I apologize, I couldn't process your request. Please contact us at admin@ruyaacapital.com"
          : "أعتذر، لم أتمكن من معالجة طلبك. يرجى التواصل معنا على admin@ruyaacapital.com")
      )
    } catch (error) {
      console.error("Error generating response:", error)
      throw new Error("Failed to generate AI response")
    }
  }
}

// Export the service instance
export const groqService = new GroqAIService()
export const groqAI = new GroqAIService()
export { GroqAIService }
export default GroqAIService
