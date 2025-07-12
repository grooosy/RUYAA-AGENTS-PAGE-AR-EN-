import { createClient } from "@/lib/supabase/client"
import { groqAI } from "@/lib/ai/groq-service"

interface ConnectionTestResult {
  service: string
  status: "success" | "error"
  message: string
  responseTime?: number
}

export class ConnectionTester {
  async testSupabaseConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("profiles").select("count").limit(1)

      if (error) {
        return {
          service: "Supabase",
          status: "error",
          message: `خطأ في الاتصال: ${error.message}`,
          responseTime: Date.now() - startTime,
        }
      }

      return {
        service: "Supabase",
        status: "success",
        message: "الاتصال بقاعدة البيانات ناجح",
        responseTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        service: "Supabase",
        status: "error",
        message: `فشل في الاتصال: ${error}`,
        responseTime: Date.now() - startTime,
      }
    }
  }

  async testGroqConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now()

    try {
      const testMessages = [{ role: "user" as const, content: "مرحبا" }]

      const response = await groqAI.generateResponse(testMessages)

      if (response.content) {
        return {
          service: "Groq AI",
          status: "success",
          message: "الاتصال بـ Groq AI ناجح",
          responseTime: Date.now() - startTime,
        }
      } else {
        return {
          service: "Groq AI",
          status: "error",
          message: "لم يتم الحصول على رد من Groq AI",
          responseTime: Date.now() - startTime,
        }
      }
    } catch (error) {
      return {
        service: "Groq AI",
        status: "error",
        message: `فشل في الاتصال بـ Groq AI: ${error}`,
        responseTime: Date.now() - startTime,
      }
    }
  }

  async testKnowledgeBase(): Promise<ConnectionTestResult> {
    const startTime = Date.now()

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("search_knowledge_base", {
        p_query: "خدمات",
        p_limit: 1,
      })

      if (error) {
        return {
          service: "Knowledge Base",
          status: "error",
          message: `خطأ في قاعدة المعرفة: ${error.message}`,
          responseTime: Date.now() - startTime,
        }
      }

      return {
        service: "Knowledge Base",
        status: "success",
        message: `قاعدة المعرفة تعمل بشكل صحيح (${data?.length || 0} نتائج)`,
        responseTime: Date.now() - startTime,
      }
    } catch (error) {
      return {
        service: "Knowledge Base",
        status: "error",
        message: `فشل في اختبار قاعدة المعرفة: ${error}`,
        responseTime: Date.now() - startTime,
      }
    }
  }

  async runAllTests(): Promise<ConnectionTestResult[]> {
    const tests = [this.testSupabaseConnection(), this.testGroqConnection(), this.testKnowledgeBase()]

    return Promise.all(tests)
  }
}

export const connectionTester = new ConnectionTester()
