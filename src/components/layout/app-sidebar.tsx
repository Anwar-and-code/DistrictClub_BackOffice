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
  BarChart3,
  Settings,
  Wallet,
  ShoppingBag,
  Package,
  List,
  ShoppingCart,
  ArrowLeftRight,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface MenuItem {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  basePath: string
  children: MenuItem[]
}

type NavItem = MenuItem | MenuGroup

function isGroup(item: NavItem): item is MenuGroup {
  return "children" in item
}

// ─── Navigation ──────────────────────────────────────────────────────
const mainItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Caisse", url: "/caisse", icon: ShoppingBag },
]

const gestionItems: NavItem[] = [
  { title: "Réservations", url: "/reservations", icon: Calendar },
  { title: "Terrains", url: "/terrains", icon: MapPin },
  { title: "Créneaux", url: "/creneaux", icon: Clock },
  { title: "Joueurs", url: "/joueurs", icon: Users },
  {
    title: "Produits",
    icon: Package,
    basePath: "/produits",
    children: [
      { title: "Liste", url: "/produits", icon: List },
      { title: "Achats", url: "/produits/achats", icon: ShoppingCart },
      { title: "Mouvements", url: "/produits/mouvements", icon: ArrowLeftRight },
    ],
  },
]

const adminItems: NavItem[] = [
  { title: "Employés", url: "/employes", icon: UserCog },
  { title: "Dépenses", url: "/depenses", icon: Wallet },
  { title: "Statistiques", url: "/statistiques", icon: BarChart3 },
  { title: "Paramètres", url: "/parametres", icon: Settings },
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
}: {
  items: NavItem[]
  pathname: string
}) {
  return (
    <div className="space-y-0.5">
      {items.map((item) =>
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {/* Main */}
        <NavSection items={mainItems} pathname={pathname} />

        {/* Gestion */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
            Gestion
          </p>
          <NavSection items={gestionItems} pathname={pathname} />
        </div>

        {/* Administration */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
            Administration
          </p>
          <NavSection items={adminItems} pathname={pathname} />
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
