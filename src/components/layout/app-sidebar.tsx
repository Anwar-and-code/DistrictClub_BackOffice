"use client"

import { useState } from "react"
import {
  Calendar,
  LayoutDashboard,
  Users,
  MapPin,
  Clock,
  LogOut,
  ChevronRight,
  ChevronDown,
  UserCog,
  Settings,
  Wallet,
  ShoppingBag,
  Package,
  List,
  ShoppingCart,
  ArrowLeftRight,
  CalendarDays,
  FileBarChart,
  Receipt,
  PackageSearch,
  Bell,
  Gift,
  Repeat,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import { PERMISSIONS } from "@/lib/permissions"

interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  permission?: string
}

interface MenuGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  basePath: string
  permission?: string
  children: MenuItem[]
}

type NavItem = MenuItem | MenuGroup

function isGroup(item: NavItem): item is MenuGroup {
  return "children" in item
}

// ─── Navigation ──────────────────────────────────────────────────────
const mainItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: PERMISSIONS.DASHBOARD_VIEW },
  { title: "Caisse", url: "/caisse", icon: ShoppingBag, permission: PERMISSIONS.CAISSE_VIEW },
]

const gestionItems: NavItem[] = [
  { title: "Réservations", url: "/reservations", icon: Calendar, permission: PERMISSIONS.RESERVATIONS_VIEW },
  { title: "Courts", url: "/terrains", icon: MapPin, permission: PERMISSIONS.TERRAINS_VIEW },
  { title: "Créneaux", url: "/creneaux", icon: Clock, permission: PERMISSIONS.CRENEAUX_VIEW },
  { title: "Joueurs", url: "/joueurs", icon: Users, permission: PERMISSIONS.JOUEURS_VIEW },
  { title: "Événements", url: "/evenements", icon: CalendarDays, permission: PERMISSIONS.EVENEMENTS_VIEW },
  { title: "Packages", url: "/packages", icon: Gift, permission: PERMISSIONS.PACKAGES_VIEW },
  { title: "Abonnements", url: "/abonnements", icon: Repeat, permission: PERMISSIONS.ABONNEMENTS_VIEW },
  {
    title: "Produits",
    icon: Package,
    basePath: "/produits",
    permission: PERMISSIONS.PRODUITS_VIEW,
    children: [
      { title: "Liste", url: "/produits", icon: List },
      { title: "Achats", url: "/produits/achats", icon: ShoppingCart },
      { title: "Mouvements", url: "/produits/mouvements", icon: ArrowLeftRight },
    ],
  },
]

const adminItems: NavItem[] = [
  { title: "Employés", url: "/employes", icon: UserCog, permission: PERMISSIONS.EMPLOYES_VIEW },
  { title: "Dépenses", url: "/depenses", icon: Wallet, permission: PERMISSIONS.DEPENSES_VIEW },
  {
    title: "Rapports",
    icon: FileBarChart,
    basePath: "/rapports",
    permission: PERMISSIONS.DEPENSES_VIEW,
    children: [
      { title: "Caisse", url: "/rapports/caisse", icon: Receipt },
      { title: "Produits", url: "/rapports/produits", icon: PackageSearch },
    ],
  },
  { title: "Notifications", url: "/notifications", icon: Bell, permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { title: "Paramètres", url: "/parametres", icon: Settings, permission: PERMISSIONS.PARAMETRES_MANAGE },
]

// ─── Nav Link Component ──────────────────────────────────────────────
function NavLink({
  item,
  pathname,
  indent = false,
}: {
  item: MenuItem
  pathname: string
  indent?: boolean
}) {
  const isActive =
    pathname === item.url ||
    (item.url !== "/" && pathname.startsWith(item.url + "/"))
  const Icon = item.icon

  return (
    <Link
      href={item.url}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
        indent && "pl-10",
        isActive
          ? "bg-white text-neutral-950"
          : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
      {isActive && !indent && <ChevronRight className="h-4 w-4 ml-auto" />}
    </Link>
  )
}

// ─── Nav Group Component (dropdown) ──────────────────────────────────
function NavGroup({
  group,
  pathname,
}: {
  group: MenuGroup
  pathname: string
}) {
  const isGroupActive = pathname.startsWith(group.basePath)
  const [open, setOpen] = useState(isGroupActive)
  const Icon = group.icon

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          isGroupActive
            ? "text-white"
            : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{group.title}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 ml-auto transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="mt-1 space-y-0.5">
          {group.children.map((child) => (
            <NavLink
              key={child.url}
              item={child}
              pathname={pathname}
              indent
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Render section helper ───────────────────────────────────────────
function NavSection({
  items,
  pathname,
  can,
}: {
  items: NavItem[]
  pathname: string
  can: (p: string) => boolean
}) {
  const filtered = items.filter((item) => {
    const perm = item.permission
    if (!perm) return true
    return can(perm)
  })

  // Legacy fallback: if all items are filtered out but items exist, show all (no permissions configured yet)
  const visible = filtered.length === 0 && items.length > 0 ? items : filtered

  if (visible.length === 0) return null

  return (
    <div className="space-y-0.5">
      {visible.map((item) =>
        isGroup(item) ? (
          <NavGroup key={item.basePath} group={item} pathname={pathname} />
        ) : (
          <NavLink key={item.url} item={item} pathname={pathname} />
        )
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════
export function AppSidebar() {
  const pathname = usePathname()
  const { employee, logout, can } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-neutral-950 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-neutral-950 font-bold text-sm">D</span>
          </div>
          <span className="text-white font-medium">District Club</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {/* Main */}
        <NavSection items={mainItems} pathname={pathname} can={can} />

        {/* Gestion */}
        {(() => {
          const section = <NavSection items={gestionItems} pathname={pathname} can={can} />
          return section ? (
            <div>
              <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
                Gestion
              </p>
              {section}
            </div>
          ) : null
        })()}

        {/* Administration */}
        {(() => {
          const section = <NavSection items={adminItems} pathname={pathname} can={can} />
          return section ? (
            <div>
              <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
                Administration
              </p>
              {section}
            </div>
          ) : null
        })()}
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
            <p className="text-xs text-neutral-500 capitalize">{employee?.profile_display_name || employee?.role}</p>
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
