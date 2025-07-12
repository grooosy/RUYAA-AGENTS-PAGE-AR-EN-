"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  updateStatus: (status: Profile["status"]) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error getting session:", sessionError)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
        }

        if (session?.user && mounted) {
          await fetchProfile(session.user.id)
        }

        if (mounted) {
          setLoading(false)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (!mounted) return

      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)
        // Update last seen
        try {
          await supabase.rpc("update_user_last_seen", {
            user_uuid: session.user.id,
          })
        } catch (error) {
          console.error("Error updating last seen:", error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          // Profile doesn't exist, this is normal for new users
          console.log("Profile not found for user:", userId)
          return
        }
        console.error("Error fetching profile:", error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error("Error in fetchProfile:", error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
        return { error }
      }

      console.log("Sign in successful:", data.user?.email)
      return { error: null }
    } catch (error) {
      console.error("Sign in exception:", error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (error) {
        console.error("Sign up error:", error)
        return { error }
      }

      console.log("Sign up successful:", data.user?.email)
      return { error: null }
    } catch (error) {
      console.error("Sign up exception:", error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Google sign in error:", error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Google sign in exception:", error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
      } else {
        console.log("Sign out successful")
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error("Sign out exception:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: "No user logged in" }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", user.id)

      if (error) {
        console.error("Update profile error:", error)
        return { error }
      }

      await refreshProfile()
      return { error: null }
    } catch (error) {
      console.error("Update profile exception:", error)
      return { error }
    }
  }

  const updateStatus = async (status: Profile["status"]) => {
    if (!user) return { error: "No user logged in" }

    try {
      const { error } = await supabase.rpc("update_user_status", {
        user_uuid: user.id,
        new_status: status,
      })

      if (error) {
        console.error("Update status error:", error)
        return { error }
      }

      await refreshProfile()
      return { error: null }
    } catch (error) {
      console.error("Update status exception:", error)
      return { error }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    updateStatus,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
