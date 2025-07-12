"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"
import { Loader2, Mail, Lock, User, Chrome, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, loading } = useAuth()
  const { t, isRTL } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("signin")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: { [key: string]: string } = {}

    if (!signInData.email.trim()) {
      newErrors.email = t("auth.emailRequired")
    } else if (!validateEmail(signInData.email)) {
      newErrors.email = t("auth.emailInvalid")
    }

    if (!signInData.password) {
      newErrors.password = t("auth.passwordRequired")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signIn(signInData.email, signInData.password)

      if (error) {
        console.error("Sign in error:", error)

        // Handle specific error messages
        let errorMessage = t("auth.signInError")
        if (error.message?.includes("Invalid login credentials")) {
          errorMessage = t("auth.invalidCredentials")
        } else if (error.message?.includes("Email not confirmed")) {
          errorMessage = t("auth.emailNotConfirmed")
        } else if (error.message?.includes("Too many requests")) {
          errorMessage = t("auth.tooManyRequests")
        }

        toast.error(errorMessage)
        setErrors({ general: errorMessage })
      } else {
        toast.success(t("auth.signInSuccess"))
        onClose()
        // Reset form
        setSignInData({ email: "", password: "" })
      }
    } catch (error) {
      console.error("Sign in exception:", error)
      toast.error(t("auth.signInError"))
      setErrors({ general: t("auth.signInError") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: { [key: string]: string } = {}

    if (!signUpData.fullName.trim()) {
      newErrors.fullName = t("auth.nameRequired")
    }

    if (!signUpData.email.trim()) {
      newErrors.email = t("auth.emailRequired")
    } else if (!validateEmail(signUpData.email)) {
      newErrors.email = t("auth.emailInvalid")
    }

    if (!signUpData.password) {
      newErrors.password = t("auth.passwordRequired")
    } else if (!validatePassword(signUpData.password)) {
      newErrors.password = t("auth.passwordTooShort")
    }

    if (!signUpData.confirmPassword) {
      newErrors.confirmPassword = t("auth.confirmPasswordRequired")
    } else if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = t("auth.passwordMismatch")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName)

      if (error) {
        console.error("Sign up error:", error)

        // Handle specific error messages
        let errorMessage = t("auth.signUpError")
        if (error.message?.includes("User already registered")) {
          errorMessage = t("auth.userAlreadyExists")
        } else if (error.message?.includes("Password should be at least")) {
          errorMessage = t("auth.passwordTooShort")
        } else if (error.message?.includes("Invalid email")) {
          errorMessage = t("auth.emailInvalid")
        }

        toast.error(errorMessage)
        setErrors({ general: errorMessage })
      } else {
        toast.success(t("auth.signUpSuccess"))
        toast.info(t("auth.checkEmail"))
        onClose()
        // Reset form
        setSignUpData({ email: "", password: "", confirmPassword: "", fullName: "" })
      }
    } catch (error) {
      console.error("Sign up exception:", error)
      toast.error(t("auth.signUpError"))
      setErrors({ general: t("auth.signUpError") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await signInWithGoogle()

      if (error) {
        console.error("Google sign in error:", error)
        toast.error(t("auth.googleSignInError"))
        setErrors({ general: t("auth.googleSignInError") })
      } else {
        // Don't close modal immediately for OAuth as it redirects
        toast.success(t("auth.redirectingToGoogle"))
      }
    } catch (error) {
      console.error("Google sign in exception:", error)
      toast.error(t("auth.googleSignInError"))
      setErrors({ general: t("auth.googleSignInError") })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md bg-gray-900 border-gray-800 text-white ${isRTL ? "rtl" : "ltr"}`}>
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold text-center ${isRTL ? "text-right" : "text-left"}`}>
            {t("auth.welcome")}
          </DialogTitle>
        </DialogHeader>

        {errors.general && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{errors.general}</span>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="signin" className="data-[state=active]:bg-cyan-600">
              {t("auth.signIn")}
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-cyan-600">
              {t("auth.signUp")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("auth.email")}
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInData.email}
                  onChange={(e) => {
                    setSignInData({ ...signInData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: "" })
                  }}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.email ? "border-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  placeholder={t("auth.emailPlaceholder")}
                />
                {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("auth.password")}
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInData.password}
                  onChange={(e) => {
                    setSignInData({ ...signInData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: "" })
                  }}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.password ? "border-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  placeholder={t("auth.passwordPlaceholder")}
                />
                {errors.password && <span className="text-red-400 text-sm">{errors.password}</span>}
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.signingIn")}
                  </div>
                ) : (
                  t("auth.signIn")
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t("auth.fullName")}
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpData.fullName}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, fullName: e.target.value })
                    if (errors.fullName) setErrors({ ...errors, fullName: "" })
                  }}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.fullName ? "border-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  placeholder={t("auth.fullNamePlaceholder")}
                />
                {errors.fullName && <span className="text-red-400 text-sm">{errors.fullName}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t("auth.email")}
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpData.email}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: "" })
                  }}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.email ? "border-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  placeholder={t("auth.emailPlaceholder")}
                />
                {errors.email && <span className="text-red-400 text-sm">{errors.email}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("auth.password")}
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpData.password}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: "" })
                  }}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.password ? "border-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  placeholder={t("auth.passwordPlaceholder")}
                />
                {errors.password && <span className="text-red-400 text-sm">{errors.password}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {t("auth.confirmPassword")}
                </Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  value={signUpData.confirmPassword}
                  onChange={(e) => {
                    setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" })
                  }}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.confirmPassword ? "border-red-500" : ""}`}
                  required
                  disabled={isLoading}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                />
                {errors.confirmPassword && <span className="text-red-400 text-sm">{errors.confirmPassword}</span>}
              </div>

              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.signingUp")}
                  </div>
                ) : (
                  t("auth.signUp")
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-400">{t("auth.or")}</span>
          </div>
        </div>

        <Button onClick={handleGoogleSignIn} variant="outline" className="w-full bg-transparent" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("auth.redirectingToGoogle")}
            </div>
          ) : (
            <>
              <Chrome className="w-4 h-4 mr-2" />
              {t("auth.continueWithGoogle")}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
