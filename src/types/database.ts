export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELED' | 'EXPIRED'

export interface Terrain {
  id: number
  code: string
  is_active: boolean
  created_at: string
}

export interface TimeSlot {
  id: number
  start_time: string
  end_time: string
  price: number
  is_active: boolean
  created_at: string
}

export interface Client {
  id: string
  full_name: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Reservation {
  id: number
  terrain_id: number
  time_slot_id: number
  reservation_date: string
  user_id: string
  client_id?: string | null
  status: ReservationStatus
  duration_minutes: number
  actual_price: number | null
  created_at: string
  updated_at: string
  terrain?: Terrain
  time_slot?: TimeSlot
  user?: User
  client?: Client | null
}

export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  birth_date: string | null
  gender: 'M' | 'F' | 'O' | null
  role: 'JOUEUR' | 'GERANT' | 'EMPLOYE'
  created_at: string
}

export interface Employee {
  id: string
  username: string
  full_name: string | null
  role: 'gerant' | 'superviseur' | 'caissiere' | 'admin'
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export interface AvailableSlot {
  terrain_id: number
  terrain_code: string
  time_slot_id: number
  start_time: string
  end_time: string
  price: number
  is_reserved: boolean
  reservation_id: number | null
  reservation_status: ReservationStatus | null
}

// ─── Packages ────────────────────────────────────────────────────────

export interface Package {
  id: number
  name: string
  description: string | null
  total_sessions: number
  price: number
  regular_price: number
  duration_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ClientPackageStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'

export interface ClientPackage {
  id: number
  package_id: number
  user_id: string
  sessions_total: number
  sessions_used: number
  paid_amount: number
  payment_method: 'cash' | 'card' | 'transfer' | 'mixed' | null
  status: ClientPackageStatus
  notes: string | null
  assigned_by: string | null
  created_at: string
  expires_at: string | null
  // joined
  package?: Package
  user?: User
}

export type ClientPackageSessionStatus = 'USED' | 'CANCELLED'

export interface ClientPackageSession {
  id: number
  client_package_id: number
  reservation_id: number | null
  session_date: string
  terrain_id: number | null
  time_slot_id: number | null
  status: ClientPackageSessionStatus
  created_at: string
  // joined
  terrain?: Terrain
  time_slot?: TimeSlot
  reservation?: Reservation
}

// ─── Events ──────────────────────────────────────────────────────────

export type EventCategory = 'TOURNOI' | 'FORMATION' | 'SOCIAL' | 'ANIMATION' | 'COMPETITION' | 'AUTRE'

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED'

export interface EventImage {
  id: string
  event_id: string
  image_url: string
  caption: string | null
  display_order: number
}

export interface Event {
  id: string
  title: string
  subtitle: string | null
  description: string
  long_description: string | null
  category: EventCategory
  status: EventStatus
  start_date: string
  end_date: string | null
  location: string
  cover_image_url: string | null
  is_featured: boolean
  display_order: number
  tags: string[] | null
  price_info: string | null
  is_free: boolean
  contact_phone: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  event_images?: EventImage[]
}

// ─── Abonnements ─────────────────────────────────────────────────────

export type AbonnementStatus = 'ACTIVE' | 'PAUSED' | 'EXPIRED' | 'CANCELLED'

export interface Abonnement {
  id: number
  user_id: string
  terrain_id: number
  time_slot_id: number
  day_of_week: number
  start_date: string
  end_date: string
  status: AbonnementStatus
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  user?: User
  terrain?: Terrain
  time_slot?: TimeSlot
}
