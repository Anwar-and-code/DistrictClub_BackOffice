"use client"

import { AuthProvider, useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { NotificationBell } from "@/components/notifications/notification-bell"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoading, employee } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-neutral-950 flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-neutral-400">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppSidebar />
      <main className="ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-neutral-200 flex items-center justify-end px-8">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  )
}
