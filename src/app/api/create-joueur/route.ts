import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    if (!SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { first_name, last_name, email, phone, gender, birth_date } = body

    if (!first_name || !last_name || !email || !phone || !gender) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { error } = await supabase.from('profiles').insert({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      gender,
      birth_date: birth_date || null,
      role: 'JOUEUR',
    })

    if (error) {
      console.error('[API] create-joueur error:', error.message, error.code, error.details, error.hint)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'duplicate_email', message: 'Un joueur avec cet email existe déjà' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] create-joueur unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
