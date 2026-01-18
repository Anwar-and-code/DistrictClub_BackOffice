export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'EXPIRED'

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

export interface Reservation {
  id: number
  terrain_id: number
  time_slot_id: number
  reservation_date: string
  user_id: string
  status: ReservationStatus
  created_at: string
  updated_at: string
  terrain?: Terrain
  time_slot?: TimeSlot
  user?: User
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
