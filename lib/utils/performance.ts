// Enhanced performance utilities for 3D effects and mobile optimization
export const isMobile = () => {
  if (typeof window === "undefined") return false
  return window.innerWidth <= 768
}

export const isReducedMotion = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export const isLowPerformanceDevice = () => {
  if (typeof window === "undefined") return false

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2

  // Check device memory (if available)
  const memory = (navigator as any).deviceMemory || 4

  // Check if it's a low-end device
  return cores < 4 || memory < 4
}

export const shouldDisable3DEffects = () => {
  return isMobile() || isReducedMotion() || isLowPerformanceDevice()
}

// Enhanced debounce utility for resize events
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Enhanced RAF throttle for smooth 3D animations
export const rafThrottle = (func: Function) => {
  let rafId: number | null = null
  return function throttledFunction(...args: any[]) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func(...args)
        rafId = null
      })
    }
  }
}

// Linear interpolation for smooth 3D transitions
export const lerp = (start: number, end: number, factor: number) => {
  return start + (end - start) * factor
}

// Easing functions for enhanced 3D animations
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Enhanced memory cleanup utility for 3D effects
export const cleanup3DEffects = (elements: NodeListOf<Element>) => {
  elements.forEach((element) => {
    const el = element as HTMLElement
    el.style.transform = ""
    el.style.transition = ""
    el.style.willChange = "auto"
    el.style.transformStyle = "flat"
    el.classList.add("cleanup")

    // Remove depth layers
    const depthLayers = el.querySelectorAll(".depth-layer")
    depthLayers.forEach((layer) => layer.remove())
  })
}

// Performance monitoring for 3D effects
export const measurePerformance = (name: string, fn: Function) => {
  if (typeof window === "undefined") return fn()

  const start = performance.now()
  const result = fn()
  const end = performance.now()

  if (end - start > 16) {
    // More than one frame (60fps = 16.67ms per frame)
    console.warn(`Performance warning: ${name} took ${end - start}ms`)
  }

  return result
}

// Enhanced intersection observer for 3D performance optimization
export const createVisibilityObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window === "undefined") return null

  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: "100px", // Increased margin for better 3D effect preparation
    threshold: 0.1,
  })
}

// GPU acceleration detection
export const hasGPUAcceleration = () => {
  if (typeof window === "undefined") return false

  const canvas = document.createElement("canvas")
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

  if (!gl) return false

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
  if (!debugInfo) return true // Assume GPU acceleration if we can't detect

  const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
  return !renderer.toLowerCase().includes("software")
}

// 3D effect capability detection
export const supports3DEffects = () => {
  if (shouldDisable3DEffects()) return false

  // Check for CSS 3D transform support
  const testElement = document.createElement("div")
  testElement.style.transform = "translateZ(0)"

  return testElement.style.transform !== ""
}

// Optimized event listener management for 3D effects
export class EventManager {
  private listeners: Map<Element, Array<{ event: string; handler: EventListener; options?: any }>> = new Map()

  addListener(element: Element, event: string, handler: EventListener, options?: any) {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, [])
    }

    this.listeners.get(element)!.push({ event, handler, options })
    element.addEventListener(event, handler, options)
  }

  removeAllListeners(element: Element) {
    const elementListeners = this.listeners.get(element)
    if (elementListeners) {
      elementListeners.forEach(({ event, handler, options }) => {
        element.removeEventListener(event, handler, options)
      })
      this.listeners.delete(element)
    }
  }

  cleanup() {
    this.listeners.forEach((_, element) => {
      this.removeAllListeners(element)
    })
    this.listeners.clear()
  }
}

// Frame rate monitor for 3D performance
export class FrameRateMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60

  update() {
    this.frameCount++
    const currentTime = performance.now()

    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount
      this.frameCount = 0
      this.lastTime = currentTime
    }
  }

  getFPS() {
    return this.fps
  }

  isPerformanceGood() {
    return this.fps >= 30 // Consider 30+ FPS as good performance
  }
}
