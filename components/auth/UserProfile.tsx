"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth/auth-context"
import { useLanguage } from "@/contexts/LanguageContext"
import { Settings, LogOut, Circle } from "lucide-react"
import ProfileEditModal from "./ProfileEditModal"

const statusColors = {
  available: "bg-green-500",
  busy: "bg-red-500",
  away: "bg-yellow-500",
  offline: "bg-gray-500",
}

const statusLabels = {
  available: { ar: "متاح", en: "Available" },
  busy: { ar: "مشغول", en: "Busy" },
  away: { ar: "غائب", en: "Away" },
  offline: { ar: "غير متصل", en: "Offline" },
}

export default function UserProfile() {
  const { user, profile, signOut, updateStatus } = useAuth()
  const { t, language, isRTL } = useLanguage()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  if (!user || !profile) return null

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleStatusChange = async (newStatus: typeof profile.status) => {
    await updateStatus(newStatus)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || ""} />
              <AvatarFallback className="bg-cyan-600 text-white">
                {getInitials(profile.full_name || profile.email)}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-gray-900 ${statusColors[profile.status]}`}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className={`w-80 bg-gray-900 border-gray-800 text-white ${isRTL ? "rtl" : "ltr"}`}
          align={isRTL ? "start" : "end"}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || ""} />
                  <AvatarFallback className="bg-cyan-600 text-white">
                    {getInitials(profile.full_name || profile.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{profile.full_name || t("profile.noName")}</p>
                  <p className="text-xs text-gray-400 truncate">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {profile.role}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {profile.provider === "google" ? "Google" : t("auth.email")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-wider">
            {t("profile.status")}
          </DropdownMenuLabel>

          {Object.entries(statusLabels).map(([status, labels]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status as typeof profile.status)}
              className={`flex items-center gap-2 cursor-pointer ${profile.status === status ? "bg-gray-800" : ""}`}
            >
              <Circle
                className={`h-3 w-3 fill-current ${statusColors[status as keyof typeof statusColors].replace("bg-", "text-")}`}
              />
              <span>{labels[language]}</span>
              {profile.status === status && <span className="ml-auto text-xs text-cyan-400">✓</span>}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuItem
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>{t("profile.editProfile")}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-gray-800" />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("auth.signOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileEditModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  )
}
