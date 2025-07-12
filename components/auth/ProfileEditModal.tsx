"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"
import { Loader2, Save, User, Mail, Phone, Building, Briefcase } from "lucide-react"
import { toast } from "sonner"

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { profile, updateProfile } = useAuth()
  const { t, isRTL } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    company: "",
    department: "",
    bio: "",
    status: "available" as const,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        company: profile.company || "",
        department: profile.department || "",
        bio: profile.bio || "",
        status: profile.status,
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await updateProfile(formData)

      if (error) {
        toast.error(t("profile.updateError"))
        console.error("Profile update error:", error)
      } else {
        toast.success(t("profile.updateSuccess"))
        onClose()
      }
    } catch (error) {
      toast.error(t("profile.updateError"))
      console.error("Profile update error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-lg bg-gray-900 border-gray-800 text-white ${isRTL ? "rtl" : "ltr"}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isRTL ? "text-right" : "text-left"}`}>
            {t("profile.editProfile")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {t("profile.fullName")}
              </Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t("profile.email")}
              </Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                className="bg-gray-800 border-gray-700 text-gray-400"
                disabled
              />
              <p className="text-xs text-gray-500">{t("profile.emailNotEditable")}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {t("profile.phone")}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {t("profile.company")}
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {t("profile.department")}
                </Label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("profile.status")}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="available">{t("status.available")}</SelectItem>
                  <SelectItem value="busy">{t("status.busy")}</SelectItem>
                  <SelectItem value="away">{t("status.away")}</SelectItem>
                  <SelectItem value="offline">{t("status.offline")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t("profile.bio")}</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                placeholder={t("profile.bioPlaceholder")}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
