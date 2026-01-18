import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Pour l'authentification custom avec employees, on laisse le client gérer
  // Le middleware vérifie juste si on est sur la page login
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  
  // On laisse passer toutes les requêtes - la vérification se fait côté client
  // via le AuthProvider
  return NextResponse.next()
}
