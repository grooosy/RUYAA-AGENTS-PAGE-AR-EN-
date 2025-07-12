interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: Date
  userAgent: string
  url: string
}

class ChatErrorHandler {
  private errors: ErrorInfo[] = []
  private maxErrors = 50

  constructor() {
    this.setupGlobalErrorHandling()
  }

  private setupGlobalErrorHandling() {
    // Handle JavaScript errors
    window.addEventListener("error", (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })
    })
  }

  logError(error: Partial<ErrorInfo>) {
    const errorInfo: ErrorInfo = {
      message: error.message || "Unknown error",
      stack: error.stack,
      componentStack: error.componentStack,
      timestamp: error.timestamp || new Date(),
      userAgent: error.userAgent || navigator.userAgent,
      url: error.url || window.location.href,
    }

    this.errors.push(errorInfo)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Chat Error:", errorInfo)
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(errorInfo)
    }
  }

  private async sendToMonitoring(error: ErrorInfo) {
    try {
      // This would typically send to a service like Sentry, LogRocket, etc.
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(error),
      })
    } catch (monitoringError) {
      console.warn("Failed to send error to monitoring:", monitoringError)
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  clearErrors(): void {
    this.errors = []
  }

  getErrorSummary() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    const recentErrors = this.errors.filter((error) => error.timestamp > oneHourAgo)

    return {
      total: this.errors.length,
      recent: recentErrors.length,
      mostCommon: this.getMostCommonError(),
      lastError: this.errors[this.errors.length - 1],
    }
  }

  private getMostCommonError(): string | null {
    if (this.errors.length === 0) return null

    const errorCounts = this.errors.reduce(
      (acc, error) => {
        const key = error.message.substring(0, 100) // First 100 chars
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const mostCommon = Object.entries(errorCounts).reduce((a, b) => (errorCounts[a[0]] > errorCounts[b[0]] ? a : b))

    return mostCommon[0]
  }

  // Utility method to wrap async functions with error handling
  wrapAsync<T extends any[], R>(fn: (...args: T) => Promise<R>, context?: string): (...args: T) => Promise<R | null> {
    return async (...args: T) => {
      try {
        return await fn(...args)
      } catch (error) {
        this.logError({
          message: `Error in ${context || "async function"}: ${error}`,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        })
        return null
      }
    }
  }

  // Utility method to wrap sync functions with error handling
  wrapSync<T extends any[], R>(fn: (...args: T) => R, context?: string): (...args: T) => R | null {
    return (...args: T) => {
      try {
        return fn(...args)
      } catch (error) {
        this.logError({
          message: `Error in ${context || "sync function"}: ${error}`,
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        })
        return null
      }
    }
  }
}

// Create singleton instance
export const chatErrorHandler = new ChatErrorHandler()

// Export utility functions
export const logChatError = (error: Partial<ErrorInfo>) => {
  chatErrorHandler.logError(error)
}

export const getChatErrors = () => {
  return chatErrorHandler.getErrors()
}

export const clearChatErrors = () => {
  chatErrorHandler.clearErrors()
}

export const getChatErrorSummary = () => {
  return chatErrorHandler.getErrorSummary()
}

export const wrapAsyncWithErrorHandling = <T extends any[], R>(fn: (...args: T) => Promise<R>, context?: string) => {
  return chatErrorHandler.wrapAsync(fn, context)
}

export const wrapSyncWithErrorHandling = <T extends any[], R>(fn: (...args: T) => R, context?: string) => {
  return chatErrorHandler.wrapSync(fn, context)
}
