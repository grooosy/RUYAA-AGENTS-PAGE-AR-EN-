"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { connectionTester } from "@/lib/utils/connection-test"

interface ConnectionStatusProps {
  onStatusChange?: (allConnected: boolean) => void
}

export default function ConnectionStatus({ onStatusChange }: ConnectionStatusProps) {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null)

  const runTests = async () => {
    setIsLoading(true)
    try {
      const results = await connectionTester.runAllTests()
      setTestResults(results)
      setLastTestTime(new Date())

      const allConnected = results.every((result) => result.status === "success")
      onStatusChange?.(allConnected)
    } catch (error) {
      console.error("Error running connection tests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">حالة الاتصالات</CardTitle>
            <CardDescription>{lastTestTime && `آخر فحص: ${lastTestTime.toLocaleTimeString("ar-SA")}`}</CardDescription>
          </div>
          <Button
            onClick={runTests}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            فحص
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {testResults.map((result, index) => (
          <motion.div
            key={result.service}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              {result.status === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <div className="font-medium">{result.service}</div>
                <div className="text-sm text-gray-500">{result.message}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {result.responseTime && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {result.responseTime}ms
                </Badge>
              )}
              <Badge variant={result.status === "success" ? "default" : "destructive"}>
                {result.status === "success" ? "متصل" : "خطأ"}
              </Badge>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">جاري فحص الاتصالات...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
