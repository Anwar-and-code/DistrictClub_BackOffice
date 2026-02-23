"use client"

import { AuthProvider, useAuth } from "@/components/providers/auth-provider"
import { useRouter } from "next/navigation"

function CaisseGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, employee } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center animate-pulse">
            <span className="text-neutral-950 font-bold text-sm">P</span>
          </div>
          <span className="text-neutral-400">Chargement de la caisse...</span>
        </div>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return <>{children}</>
}

export default function CaisseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <CaisseGuard>{children}</CaisseGuard>
    </AuthProvider>
  )
}
