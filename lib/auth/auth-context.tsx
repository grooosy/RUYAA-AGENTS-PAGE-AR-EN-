"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

// Temporary mock types while Supabase is disabled
type User = {
  id: string
  email: string
} | null

type Profile = {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "admin" | "agent" | "user"
  status: "available" | "busy" | "away" | "offline"
  provider: "email" | "google"
  phone: string | null
  company: string | null
  department: string | null
  bio: string | null
  preferences: any
  last_seen: string
  created_at: string
  updated_at: string
} | null

interface AuthContextType {
  user: User
  profile: Profile
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<any>) => Promise<{ error: any }>
  updateStatus: (status: any) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [profile, setProfile] = useState<Profile>(null)
  const [loading, setLoading] = useState(false) // Set to false since we're not loading anything

  // Mock authentication functions
  const signIn = async (email: string, password: string) => {
    // Mock successful sign in for demo purposes
    console.log("Mock sign in:", email)
    return { error: null }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    // Mock successful sign up for demo purposes
    console.log("Mock sign up:", email, fullName)
    return { error: null }
  }

  const signInWithGoogle = async () => {
    // Mock Google sign in
    console.log("Mock Google sign in")
    return { error: null }
  }

  const signOut = async () => {
    // Mock sign out
    console.log("Mock sign out")
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<any>) => {
    // Mock profile update
    console.log("Mock profile update:", updates)
    return { error: null }
  }

  const updateStatus = async (status: any) => {
    // Mock status update
    console.log("Mock status update:", status)
    return { error: null }
  }

  const refreshProfile = async () => {
    // Mock profile refresh
    console.log("Mock profile refresh")
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