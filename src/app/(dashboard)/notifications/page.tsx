"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Bell,
  Send,
  Users,
  User,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Smartphone,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Megaphone,
  CalendarCheck,
  CalendarClock,
  PartyPopper,
  Eye,
  Zap,
  Info,
  AlertTriangle,
  Mail,
  BellRing,
} from "lucide-react"
import {
  sendPushNotification,
  getNotificationLogs,
  getNotificationStats,
  getJoueurs,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TARGET_LABELS,
  NOTIFICATION_TYPE_OPTIONS,
  PAGE_SIZE,
  type NotificationLog,
  type NotificationStats,
  type SendNotificationParams,
  type Joueur,
  type TargetType,
} from "@/lib/services/notifications"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ─── Config ───────────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  reservation_confirmed: {
    bg: "bg-emerald-50 border-emerald-200",
    color: "text-emerald-700",
    icon: <CalendarCheck className="h-3.5 w-3.5" />,
  },
  reservation_reminder: {
    bg: "bg-blue-50 border-blue-200",
    color: "text-blue-700",
    icon: <CalendarClock className="h-3.5 w-3.5" />,
  },
  event_published: {
    bg: "bg-purple-50 border-purple-200",
    color: "text-purple-700",
    icon: <PartyPopper className="h-3.5 w-3.5" />,
  },
  custom: {
    bg: "bg-orange-50 border-orange-200",
    color: "text-orange-700",
    icon: <Megaphone className="h-3.5 w-3.5" />,
  },
}

const TARGET_ICONS: Record<string, React.ReactNode> = {
  single: <User className="h-3.5 w-3.5" />,
  multiple: <Users className="h-3.5 w-3.5" />,
  all: <Globe className="h-3.5 w-3.5" />,
}

// ─── Skeleton Components ──────────────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="h-3 w-20 bg-neutral-100 rounded animate-pulse mb-3" />
          <div className="h-7 w-16 bg-neutral-100 rounded animate-pulse mb-1" />
          <div className="h-2.5 w-24 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="border-b border-neutral-100 px-5 py-3">
        <div className="h-4 w-32 bg-neutral-100 rounded animate-pulse" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-neutral-50">
          <div className="h-9 w-9 rounded-lg bg-neutral-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-neutral-100 rounded animate-pulse w-48" />
            <div className="h-3 bg-neutral-100 rounded animate-pulse w-72" />
          </div>
          <div className="h-6 w-20 bg-neutral-100 rounded-full animate-pulse" />
          <div className="h-3.5 w-16 bg-neutral-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
export default function NotificationsPage() {
  const [tab, setTab] = useState<"auto" | "send" | "history">("auto")

  // Stats
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // History
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [logsLoading, setLogsLoading] = useState(true)
  const [logsCount, setLogsCount] = useState(0)
  const [logsPage, setLogsPage] = useState(1)
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const totalPages = Math.ceil(logsCount / PAGE_SIZE)

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null)

  // Send form
  const [sending, setSending] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [targetType, setTargetType] = useState<TargetType>("all")
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [joueurs, setJoueurs] = useState<Joueur[]>([])
  const [joueursLoading, setJoueursLoading] = useState(false)
  const [searchJoueur, setSearchJoueur] = useState("")

  // ─── Load stats ──────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getNotificationStats()
      setStats(data)
    } catch (err) {
      console.error("Error loading stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // ─── Load logs with pagination ───────────────────────────────
  const loadLogs = useCallback(async (page: number, type: string, search: string) => {
    setLogsLoading(true)
    try {
      const { data, count } = await getNotificationLogs({
        page,
        type: type || undefined,
        search: search || undefined,
      })
      setLogs(data)
      setLogsCount(count)
    } catch (err) {
      console.error("Error loading logs:", err)
    } finally {
      setLogsLoading(false)
    }
  }, [])

  // ─── Load joueurs for targeting ──────────────────────────────
  const loadJoueurs = useCallback(async (search?: string) => {
    setJoueursLoading(true)
    try {
      const data = await getJoueurs(search)
      setJoueurs(data)
    } catch (err) {
      console.error("Error loading joueurs:", err)
    } finally {
      setJoueursLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  useEffect(() => {
    loadLogs(logsPage, filterType, searchQuery)
  }, [logsPage, filterType, loadLogs])

  useEffect(() => {
    setLogsPage(1)
    loadLogs(1, filterType, searchQuery)
  }, [searchQuery, filterType])

  useEffect(() => {
    if (targetType !== "all") {
      loadJoueurs()
    }
  }, [targetType, loadJoueurs])

  // Debounced joueur search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (targetType !== "all") {
        loadJoueurs(searchJoueur || undefined)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchJoueur, targetType, loadJoueurs])

  // ─── Send ────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Le titre et le message sont requis")
      return
    }
    if (targetType !== "all" && selectedUserIds.length === 0) {
      toast.error("Sélectionnez au moins un joueur")
      return
    }

    setSending(true)
    try {
      const params: SendNotificationParams = {
        type: "custom",
        title: title.trim(),
        body: body.trim(),
        target_type: targetType,
        target_user_ids: targetType === "all" ? [] : selectedUserIds,
        sent_by: "backoffice",
      }
      const result = await sendPushNotification(params)
      toast.success(`Notification envoyée ! ${result.sent} envoyé(s), ${result.failed} échoué(s)`)
      setTitle("")
      setBody("")
      setSelectedUserIds([])
      setTargetType("all")
      loadStats()
      loadLogs(1, filterType, searchQuery)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setSending(false)
    }
  }

  const toggleJoueur = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const successRate = stats && stats.total_sent + stats.total_failed > 0
    ? Math.round((stats.total_sent / (stats.total_sent + stats.total_failed)) * 100)
    : 0

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">Notifications</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Gérez et envoyez des notifications push aux joueurs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Bell className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total envoyées</span>
            </div>
            <p className="text-2xl font-bold text-neutral-950">{stats.total_notifications}</p>
            <p className="text-xs text-neutral-400 mt-0.5">notifications</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Délivrées</span>
            </div>
            <p className="text-2xl font-bold text-neutral-950">{stats.total_sent}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{successRate}% de réussite</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-2 text-neutral-500 mb-1">
              <Smartphone className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Appareils</span>
            </div>
            <p className="text-2xl font-bold text-neutral-950">{stats.active_devices}</p>
            <p className="text-xs text-neutral-400 mt-0.5">appareils actifs</p>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Échouées</span>
            </div>
            <p className="text-2xl font-bold text-neutral-950">{stats.total_failed}</p>
            <p className="text-xs text-neutral-400 mt-0.5">non délivrées</p>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-lg mb-6 w-fit">
        {([
          { key: "auto" as const, label: "Automatiques", icon: <Zap className="h-4 w-4" /> },
          { key: "send" as const, label: "Envoyer", icon: <Send className="h-4 w-4" /> },
          { key: "history" as const, label: "Historique", icon: <BarChart3 className="h-4 w-4" />, badge: logsCount > 0 ? logsCount : undefined },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              tab === t.key
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            )}
          >
            {t.icon}
            {t.label}
            {t.badge !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-neutral-200 text-neutral-600 rounded-full">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* AUTOMATIQUES TAB                                              */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === "auto" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-neutral-950">Notifications automatiques</h2>
            <span className="text-xs text-neutral-400">— Déclenchées automatiquement par le système</span>
          </div>

          {/* Reservation confirmed */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CalendarCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold text-neutral-950">Réservation confirmée</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">Actif</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-full"><BellRing className="h-2.5 w-2.5" />Push</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-full"><Mail className="h-2.5 w-2.5" />Email</span>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Envoie automatiquement une notification push et un email au joueur lorsqu&apos;une réservation est <strong className="text-neutral-700">confirmée</strong>.
                </p>
                <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Exemple de notification :</p>
                  <p className="text-xs font-medium text-neutral-800">Réservation confirmée ✅</p>
                  <p className="text-xs text-neutral-500">Votre réservation du Terrain A le 15/03 à 14h est confirmée.</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-xs text-neutral-400">Déclenché par : trigger PostgreSQL sur la table <code className="px-1 py-0.5 bg-neutral-200/70 rounded text-[11px]">reservations</code> (status → CONFIRMED)</p>
            </div>
          </div>

          {/* Reservation reminder 2h */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold text-neutral-950">Rappel de réservation</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full">Actif</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-full"><BellRing className="h-2.5 w-2.5" />Push</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-full"><Mail className="h-2.5 w-2.5" />Email</span>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Envoie un rappel push et email <strong className="text-neutral-700">2 heures avant</strong> le début de chaque réservation confirmée.
                </p>
                <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Exemple de notification :</p>
                  <p className="text-xs font-medium text-neutral-800">Rappel ⏰</p>
                  <p className="text-xs text-neutral-500">Votre réservation sur Terrain A commence dans 2h (14:00). À bientôt !</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-xs text-neutral-400">Déclenché par : <code className="px-1 py-0.5 bg-neutral-200/70 rounded text-[11px]">pg_cron</code> — vérifie toutes les 15 min les réservations à venir dans les 2h</p>
            </div>
          </div>

          {/* Event published */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-start gap-4 p-5">
              <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                <PartyPopper className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold text-neutral-950">Événement publié</h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 rounded-full">Actif</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-full"><BellRing className="h-2.5 w-2.5" />Push</span>
                  <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-full"><Mail className="h-2.5 w-2.5" />Email</span>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Envoie une notification push et un email à <strong className="text-neutral-700">tous les joueurs</strong> de l&apos;application lorsqu&apos;un événement est publié.
                </p>
                <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500 mb-1">Exemple de notification :</p>
                  <p className="text-xs font-medium text-neutral-800">Nouvel événement 🎉</p>
                  <p className="text-xs text-neutral-500">Tournoi de Padel ce samedi ! Inscrivez-vous dès maintenant.</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-xs text-neutral-400">Déclenché par : trigger PostgreSQL sur la table <code className="px-1 py-0.5 bg-neutral-200/70 rounded text-[11px]">events</code> (status → PUBLISHED)</p>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800">Prérequis pour le fonctionnement</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                <strong>Push :</strong> Les joueurs doivent avoir installé l&apos;app mobile et accepté les notifications. Les tokens FCM sont enregistrés automatiquement.<br />
                <strong>Email :</strong> Les joueurs doivent avoir un email renseigné dans leur profil. Les emails sont envoyés via Resend (noreply@armasoft.ci).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* SEND TAB                                                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === "send" && (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-100">
            <div className="h-8 w-8 rounded-lg bg-neutral-950 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-950">Nouvelle notification</h2>
              <p className="text-xs text-neutral-400">Envoyez une notification push personnalisée</p>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Titre <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nouveau tournoi ce week-end !"
                className={cn(
                  "w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 transition-colors",
                  title.length > 50
                    ? "border-red-300 focus:border-red-400"
                    : title.length > 40
                      ? "border-amber-300 focus:border-amber-400"
                      : "border-neutral-200 focus:border-neutral-400"
                )}
                maxLength={50}
              />
              <div className="flex items-center justify-between mt-1">
                {title.length > 40 && title.length <= 50 && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Approche de la limite
                  </p>
                )}
                {title.length === 0 && <span />}
                <p className={cn(
                  "text-xs text-right",
                  title.length > 50 ? "text-red-500 font-medium" : title.length > 40 ? "text-amber-500" : "text-neutral-400"
                )}>{title.length}/50</p>
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Message <span className="text-red-400">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Le contenu de votre notification..."
                rows={3}
                className={cn(
                  "w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10 transition-colors resize-none",
                  body.length > 178
                    ? "border-red-300 focus:border-red-400"
                    : body.length > 150
                      ? "border-amber-300 focus:border-amber-400"
                      : "border-neutral-200 focus:border-neutral-400"
                )}
                maxLength={178}
              />
              <div className="flex items-center justify-between mt-1">
                {body.length > 150 && body.length <= 178 && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Approche de la limite iOS
                  </p>
                )}
                {body.length === 0 && <span />}
                <p className={cn(
                  "text-xs text-right",
                  body.length > 178 ? "text-red-500 font-medium" : body.length > 150 ? "text-amber-500" : "text-neutral-400"
                )}>{body.length}/178</p>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                iOS affiche ~50 car. pour le titre et ~178 car. pour le message sur l&apos;écran de verrouillage
              </p>
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Destinataires</label>
              <div className="flex gap-2 flex-wrap">
                {(["all", "multiple", "single"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTargetType(t); setSelectedUserIds([]) }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all",
                      targetType === t
                        ? "bg-neutral-950 text-white border-neutral-950"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    {TARGET_ICONS[t]}
                    {NOTIFICATION_TARGET_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Player picker */}
            {targetType !== "all" && (
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="p-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="text"
                      value={searchJoueur}
                      onChange={(e) => setSearchJoueur(e.target.value)}
                      placeholder="Rechercher un joueur..."
                      className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950/10"
                    />
                  </div>
                  {selectedUserIds.length > 0 && (
                    <span className="shrink-0 px-2.5 py-1 bg-neutral-950 text-white text-xs font-medium rounded-full">
                      {selectedUserIds.length} sélectionné{selectedUserIds.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-neutral-50">
                  {joueursLoading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded bg-neutral-100 animate-pulse" />
                          <div className="h-8 w-8 rounded-full bg-neutral-100 animate-pulse" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-neutral-100 rounded animate-pulse w-32" />
                            <div className="h-2.5 bg-neutral-100 rounded animate-pulse w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : joueurs.length === 0 ? (
                    <div className="p-6 text-center">
                      <Users className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">Aucun joueur trouvé</p>
                    </div>
                  ) : (
                    joueurs.map((j) => {
                      const isSelected = selectedUserIds.includes(j.id)
                      const initials = `${j.first_name?.charAt(0) || ""}${j.last_name?.charAt(0) || ""}`.toUpperCase()
                      return (
                        <button
                          key={j.id}
                          onClick={() => {
                            if (targetType === "single") {
                              setSelectedUserIds(isSelected ? [] : [j.id])
                            } else {
                              toggleJoueur(j.id)
                            }
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                            isSelected ? "bg-neutral-50" : "hover:bg-neutral-50"
                          )}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded flex items-center justify-center border-2 transition-all shrink-0",
                              targetType === "single" ? "rounded-full" : "rounded",
                              isSelected
                                ? "bg-neutral-950 border-neutral-950"
                                : "border-neutral-300"
                            )}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                            )}
                          </div>
                          <div className="h-8 w-8 rounded-full bg-neutral-950 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-medium">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {j.first_name} {j.last_name}
                            </p>
                            <p className="text-xs text-neutral-400 truncate">{j.email}</p>
                          </div>
                          {j.phone && (
                            <span className="text-xs text-neutral-400 shrink-0">{j.phone}</span>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              {targetType === "all"
                ? `Sera envoyée à ${stats?.active_devices ?? "—"} appareils (push uniquement)`
                : `${selectedUserIds.length} joueur(s) sélectionné(s)`}
            </p>
            <button
              onClick={handleSend}
              disabled={sending || !title.trim() || !body.trim() || (targetType !== "all" && selectedUserIds.length === 0)}
              className="flex items-center gap-2 px-6 py-2.5 bg-neutral-950 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {sending ? "Envoi en cours..." : "Envoyer"}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* HISTORY TAB                                                 */}
      {/* ════════════════════════════════════════════════════════════ */}
      {tab === "history" && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Rechercher par titre ou message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-950/10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 bg-white"
            >
              {NOTIFICATION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {logsLoading ? (
            <TableSkeleton />
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-xl border border-neutral-200 p-16 text-center">
              <Bell className="h-12 w-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-500">Aucune notification trouvée</p>
              <p className="text-xs text-neutral-400 mt-1">
                {searchQuery || filterType
                  ? "Essayez de modifier vos filtres"
                  : "Les notifications envoyées apparaîtront ici"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Notification</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Cible</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Résultat</th>
                    <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {logs.map((log) => {
                    const style = TYPE_STYLES[log.type] || TYPE_STYLES.custom
                    return (
                      <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-5 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              style.bg,
                              style.color
                            )}
                          >
                            {style.icon}
                            {NOTIFICATION_TYPE_LABELS[log.type]}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <p className="text-sm font-medium text-neutral-950 truncate">{log.title}</p>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{log.body}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                            {TARGET_ICONS[log.target_type]}
                            {NOTIFICATION_TARGET_LABELS[log.target_type]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {log.total_sent}
                            </span>
                            {log.total_failed > 0 && (
                              <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                                <XCircle className="h-3.5 w-3.5" />
                                {log.total_failed}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <p className="text-xs text-neutral-600">
                              {format(new Date(log.created_at), "dd MMM yyyy", { locale: fr })}
                            </p>
                            <p className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.created_at), "HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!logsLoading && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Page {logsPage} sur {totalPages} &middot; {logsCount} notification{logsCount > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                  disabled={logsPage === 1}
                  className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = totalPages <= 7
                    ? i + 1
                    : logsPage <= 4
                      ? i + 1
                      : logsPage >= totalPages - 3
                        ? totalPages - 6 + i
                        : logsPage - 3 + i
                  return (
                    <button
                      key={page}
                      onClick={() => setLogsPage(page)}
                      className={cn(
                        "h-9 w-9 rounded-lg text-sm font-medium transition-colors",
                        page === logsPage
                          ? "bg-neutral-950 text-white"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      {page}
                    </button>
                  )
                })}
                <button
                  onClick={() => setLogsPage((p) => Math.min(totalPages, p + 1))}
                  disabled={logsPage === totalPages}
                  className="p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                */}
      {/* ════════════════════════════════════════════════════════════ */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedLog(null)} />
          <div className="relative bg-white rounded-xl w-full max-w-md mx-4 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-100 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Détail de la notification</h3>
                  <p className="text-xs text-neutral-400">#{selectedLog.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-neutral-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Type badge */}
              <div>
                {(() => {
                  const style = TYPE_STYLES[selectedLog.type] || TYPE_STYLES.custom
                  return (
                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border", style.bg, style.color)}>
                      {style.icon}
                      {NOTIFICATION_TYPE_LABELS[selectedLog.type]}
                    </span>
                  )
                })()}
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Titre</p>
                  <p className="text-sm font-semibold text-neutral-950">{selectedLog.title}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Message</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{selectedLog.body}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Cible</p>
                  <p className="text-sm font-medium text-neutral-950 flex items-center gap-1.5 mt-0.5">
                    {TARGET_ICONS[selectedLog.target_type]}
                    {NOTIFICATION_TARGET_LABELS[selectedLog.target_type]}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Envoyé par</p>
                  <p className="text-sm font-medium text-neutral-950 mt-0.5">
                    {selectedLog.sent_by || "Système"}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-600">Envoyées</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">{selectedLog.total_sent}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-500">Échouées</p>
                  <p className="text-lg font-bold text-red-600 mt-0.5">{selectedLog.total_failed}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
                <Clock className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-xs text-neutral-500">Date d&apos;envoi</p>
                  <p className="text-sm font-medium text-neutral-950">
                    {format(new Date(selectedLog.created_at), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Data payload */}
              {selectedLog.data && Object.keys(selectedLog.data).length > 0 && (
                <div>
                  <p className="text-xs text-neutral-500 mb-2">Données supplémentaires</p>
                  <pre className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-3 overflow-x-auto text-neutral-600">
                    {JSON.stringify(selectedLog.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
