"use client"

import { useAuth } from "@/components/providers/auth-provider"

interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAll, canAny } = useAuth()

  if (permission) {
    return can(permission) ? <>{children}</> : <>{fallback}</>
  }

  if (permissions) {
    const allowed = requireAll ? canAll(permissions) : canAny(permissions)
    return allowed ? <>{children}</> : <>{fallback}</>
  }

  return <>{children}</>
}
