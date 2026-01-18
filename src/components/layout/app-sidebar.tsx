"use client"

import {
  Calendar,
  LayoutDashboard,
  Users,
  MapPin,
  Clock,
  LogOut,
  ChevronRight,
  UserCog,
  BarChart3,
  Settings,
  Bell,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Réservations", url: "/reservations", icon: Calendar },
  { title: "Terrains", url: "/terrains", icon: MapPin },
  { title: "Créneaux", url: "/creneaux", icon: Clock },
  { title: "Joueurs", url: "/joueurs", icon: Users },
]

const adminMenuItems = [
  { title: "Employés", url: "/employes", icon: UserCog },
  { title: "Dépenses", url: "/depenses", icon: Wallet },
  { title: "Statistiques", url: "/statistiques", icon: BarChart3 },
  { title: "Paramètres", url: "/parametres", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { employee, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-950 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-neutral-950 font-bold text-sm">P</span>
          </div>
          <span className="text-white font-medium">Padel House</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.url || 
              (item.url !== "/" && pathname.startsWith(item.url))
            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-white text-neutral-950"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            )
          })}
        </div>

        {/* Admin Section */}
        <div className="mt-6 pt-6 border-t border-neutral-800">
          <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
            Administration
          </p>
          <div className="space-y-1">
            {adminMenuItems.map((item) => {
              const isActive = pathname === item.url || 
                (item.url !== "/" && pathname.startsWith(item.url))
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white text-neutral-950"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {employee?.full_name?.charAt(0) || employee?.username?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {employee?.full_name || employee?.username}
            </p>
            <p className="text-xs text-neutral-500 capitalize">{employee?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ArmaSOFT */}
      <div className="px-6 py-4 border-t border-neutral-800">
        <p className="text-xs text-neutral-600 text-center">
          Propulsé par{" "}
          <a
            href="https://www.armasoft.ci"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ArmaSOFT
          </a>
        </p>
      </div>
    </aside>
  )
}
