"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getStoredEmployee, clearEmployee, type Employee } from "@/lib/services/auth"

interface AuthContextType {
  employee: Employee | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  employee: null,
  isLoading: true,
  logout: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const stored = getStoredEmployee()
    setEmployee(stored)
    setIsLoading(false)

    // Redirect to login if not authenticated and not on login page
    if (!stored && pathname !== "/login") {
      router.push("/login")
    }
    // Redirect to dashboard if authenticated and on login page
    if (stored && pathname === "/login") {
      router.push("/")
    }
  }, [pathname, router])

  const logout = () => {
    clearEmployee()
    setEmployee(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ employee, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
