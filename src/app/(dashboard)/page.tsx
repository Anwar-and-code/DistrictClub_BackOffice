import { Calendar, Users, MapPin, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

const stats = [
  {
    label: "Réservations",
    sublabel: "Aujourd'hui",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Calendar,
  },
  {
    label: "Utilisateurs",
    sublabel: "Actifs",
    value: "245",
    change: "+18",
    trend: "up",
    icon: Users,
  },
  {
    label: "Terrains",
    sublabel: "Disponibles",
    value: "4/4",
    change: "100%",
    trend: "up",
    icon: MapPin,
  },
  {
    label: "Revenus",
    sublabel: "Ce mois",
    value: "1.2M",
    change: "+12%",
    trend: "up",
    icon: TrendingUp,
  },
]

const recentReservations = [
  { terrain: "A", time: "18:00", client: "Koné A.", status: "confirmed" },
  { terrain: "B", time: "18:00", client: "Diallo M.", status: "confirmed" },
  { terrain: "C", time: "19:30", client: "Touré S.", status: "pending" },
  { terrain: "A", time: "21:00", client: "Bamba K.", status: "confirmed" },
  { terrain: "D", time: "16:00", client: "Coulibaly F.", status: "confirmed" },
]

const popularSlots = [
  { time: "18:00 - 19:30", count: 24, percentage: 100 },
  { time: "19:30 - 21:00", count: 22, percentage: 92 },
  { time: "16:00 - 17:30", count: 18, percentage: 75 },
  { time: "17:30 - 19:00", count: 15, percentage: 63 },
  { time: "21:00 - 22:30", count: 12, percentage: 50 },
]

export default function DashboardPage() {
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-950">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1 capitalize">{today}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-5 border border-neutral-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-neutral-100 rounded-lg">
                <stat.icon className="h-4 w-4 text-neutral-600" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stat.change}
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
              </div>
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-950">{stat.value}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {stat.label} · {stat.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="font-medium text-neutral-950">Réservations récentes</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Les 5 dernières réservations</p>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentReservations.map((res, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-neutral-950 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{res.terrain}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-950">{res.client}</p>
                    <p className="text-xs text-neutral-500">Terrain {res.terrain} · {res.time}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  res.status === 'confirmed' 
                    ? 'bg-emerald-50 text-emerald-700' 
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {res.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Slots */}
        <div className="bg-white rounded-xl border border-neutral-200">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h2 className="font-medium text-neutral-950">Créneaux populaires</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Cette semaine</p>
          </div>
          <div className="p-5 space-y-4">
            {popularSlots.map((slot, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">{slot.time}</span>
                  <span className="font-medium text-neutral-950">{slot.count}</span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-neutral-950 rounded-full transition-all duration-500"
                    style={{ width: `${slot.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
