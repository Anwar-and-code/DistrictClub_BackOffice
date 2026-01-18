export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'

export interface Terrain {
  id: string
  code: string
  name: string
  is_active: boolean
  created_at: string
}

export interface TimeSlot {
  id: string
  start_time: string
  end_time: string
  price: number
  is_active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  terrain_id: string
  time_slot_id: string
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
  full_name: string | null
  phone: string | null
  created_at: string
}

export interface AvailableSlot {
  terrain_id: string
  terrain_code: string
  time_slot_id: string
  start_time: string
  end_time: string
  price: number
  is_reserved: boolean
  reservation_id: string | null
  reservation_status: ReservationStatus | null
}
