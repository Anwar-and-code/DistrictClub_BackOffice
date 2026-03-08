// ============================================================
// RBAC: Permissions, types et helpers
// ============================================================

export const PERMISSIONS = {
  DASHBOARD_VIEW:      'dashboard.view',
  CAISSE_VIEW:         'caisse.view',
  CAISSE_MANAGE:       'caisse.manage',
  RESERVATIONS_VIEW:   'reservations.view',
  RESERVATIONS_MANAGE: 'reservations.manage',
  TERRAINS_VIEW:       'terrains.view',
  TERRAINS_MANAGE:     'terrains.manage',
  CRENEAUX_VIEW:       'creneaux.view',
  CRENEAUX_MANAGE:     'creneaux.manage',
  JOUEURS_VIEW:        'joueurs.view',
  JOUEURS_MANAGE:      'joueurs.manage',
  PRODUITS_VIEW:       'produits.view',
  PRODUITS_MANAGE:     'produits.manage',
  DEPENSES_VIEW:       'depenses.view',
  DEPENSES_MANAGE:     'depenses.manage',
  EMPLOYES_VIEW:       'employes.view',
  EMPLOYES_MANAGE:     'employes.manage',
  PARAMETRES_MANAGE:   'parametres.manage',
  EVENEMENTS_VIEW:     'evenements.view',
  EVENEMENTS_MANAGE:   'evenements.manage',
  NOTIFICATIONS_VIEW:  'notifications.view',
  NOTIFICATIONS_MANAGE:'notifications.manage',
  PACKAGES_VIEW:       'packages.view',
  PACKAGES_MANAGE:     'packages.manage',
  ABONNEMENTS_VIEW:    'abonnements.view',
  ABONNEMENTS_MANAGE:  'abonnements.manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export interface Profile {
  id: string
  name: string
  display_name: string
  description: string | null
  base_route: string
  hierarchy_level: number
  is_system: boolean
  created_at: string
  permissions?: string[]
}

export interface EmployeeWithProfile {
  id: string
  username: string
  full_name: string | null
  role: string
  is_active: boolean
  profile_id: string | null
  profile_name: string | null
  profile_display_name: string | null
  base_route: string
  hierarchy_level: number
  permissions: string[]
}

// Catégories de permissions pour l'UI
export const PERMISSION_CATEGORIES = [
  { key: 'Dashboard',     label: 'Dashboard' },
  { key: 'Caisse',        label: 'Caisse' },
  { key: 'Réservations',  label: 'Réservations' },
  { key: 'Terrains',      label: 'Terrains' },
  { key: 'Créneaux',      label: 'Créneaux' },
  { key: 'Joueurs',       label: 'Joueurs' },
  { key: 'Produits',      label: 'Produits' },
  { key: 'Dépenses',      label: 'Dépenses' },
  { key: 'Employés',      label: 'Employés' },
  { key: 'Paramètres',    label: 'Paramètres' },
  { key: 'Événements',    label: 'Événements' },
  { key: 'Notifications', label: 'Notifications' },
  { key: 'Packages',      label: 'Packages' },
  { key: 'Abonnements',   label: 'Abonnements' },
] as const

// Routes disponibles pour base_route
export const AVAILABLE_ROUTES = [
  { value: '/',              label: 'Dashboard' },
  { value: '/caisse',        label: 'Caisse' },
  { value: '/reservations',  label: 'Réservations' },
  { value: '/terrains',      label: 'Terrains' },
  { value: '/creneaux',      label: 'Créneaux' },
  { value: '/joueurs',       label: 'Joueurs' },
  { value: '/produits',      label: 'Produits' },
  { value: '/depenses',      label: 'Dépenses' },
  { value: '/evenements',    label: 'Événements' },
  { value: '/notifications', label: 'Notifications' },
  { value: '/packages',      label: 'Packages' },
  { value: '/abonnements',   label: 'Abonnements' },
] as const

// Map route → permission requise pour y accéder
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  '/':              PERMISSIONS.DASHBOARD_VIEW,
  '/caisse':        PERMISSIONS.CAISSE_VIEW,
  '/reservations':  PERMISSIONS.RESERVATIONS_VIEW,
  '/terrains':      PERMISSIONS.TERRAINS_VIEW,
  '/creneaux':      PERMISSIONS.CRENEAUX_VIEW,
  '/joueurs':       PERMISSIONS.JOUEURS_VIEW,
  '/produits':      PERMISSIONS.PRODUITS_VIEW,
  '/depenses':      PERMISSIONS.DEPENSES_VIEW,
  '/employes':      PERMISSIONS.EMPLOYES_VIEW,
  '/parametres':    PERMISSIONS.PARAMETRES_MANAGE,
  '/evenements':    PERMISSIONS.EVENEMENTS_VIEW,
  '/notifications': PERMISSIONS.NOTIFICATIONS_VIEW,
  '/packages':      PERMISSIONS.PACKAGES_VIEW,
  '/abonnements':   PERMISSIONS.ABONNEMENTS_VIEW,
}

// Helper : vérifie si l'utilisateur a une permission
export function hasPermission(userPermissions: string[], permission: string): boolean {
  return userPermissions.includes(permission)
}

// Helper : vérifie si l'utilisateur a toutes les permissions listées
export function hasAllPermissions(userPermissions: string[], required: string[]): boolean {
  return required.every(p => userPermissions.includes(p))
}

// Helper : vérifie si l'utilisateur a au moins une des permissions listées
export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  return required.some(p => userPermissions.includes(p))
}
