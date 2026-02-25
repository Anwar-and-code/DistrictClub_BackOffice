"use client"

import { AuthProvider, useAuth } from "@/components/providers/auth-provider"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ShoppingBag, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ROUTE_PERMISSION_MAP } from "@/lib/permissions"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isLoading, employee, can } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

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

  // Route protection: check permission for current path
  const basePath = "/" + (pathname.split("/")[1] || "")
  const requiredPermission = ROUTE_PERMISSION_MAP[basePath]
  const hasAccess = !requiredPermission || can(requiredPermission)

  return (
    <div className="min-h-screen bg-neutral-50">
      <AppSidebar />
      <main className="ml-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-neutral-200 flex items-center justify-end px-8 gap-1">
          <Link
            href="/caisse"
            className="relative p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Caisse"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <NotificationBell />
        </div>
        {hasAccess ? children : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
            <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-950 mb-2">Accès refusé</h2>
            <p className="text-sm text-neutral-500 mb-6 max-w-md">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
            </p>
            <button
              onClick={() => router.push(employee.base_route || "/")}
              className="px-6 py-2.5 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
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
