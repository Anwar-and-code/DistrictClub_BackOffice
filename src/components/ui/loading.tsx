"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

// ─── Page Loader ─────────────────────────────────────────────────────
// Full-page centered spinner for initial data loading

function PageLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500">Chargement...</p>
      </div>
    </div>
  )
}

// ─── Loading Overlay ─────────────────────────────────────────────────
// Transparent overlay with spinner, for sections/modals/cards during actions

function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-inherit">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
        {message && <p className="text-xs text-neutral-500">{message}</p>}
      </div>
    </div>
  )
}

// ─── Table Skeleton ──────────────────────────────────────────────────
// Reusable skeleton for table rows

function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-1 py-2">
          <div className="h-10 w-10 rounded-full bg-neutral-100 animate-pulse shrink-0" />
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn(
                "h-4 rounded",
                j === 0 ? "flex-1" : "w-24"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Card Skeleton ───────────────────────────────────────────────────
// Reusable skeleton for card grids

function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
          <div className="h-12 w-12 bg-neutral-100 rounded-xl mb-4" />
          <div className="h-4 bg-neutral-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-neutral-100 rounded w-1/3" />
        </div>
      ))}
    </>
  )
}

// ─── Inline Loader ───────────────────────────────────────────────────
// Small inline spinner for buttons/text actions

function InlineLoader({ text }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-500">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      {text}
    </span>
  )
}

export { PageLoader, LoadingOverlay, TableSkeleton, CardSkeleton, InlineLoader }
