"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { loginEmployee, storeEmployee } from "@/lib/services/auth"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const employee = await loginEmployee(username, password)

      if (!employee) {
        toast.error("Identifiants incorrects")
        return
      }

      storeEmployee(employee)
      router.push(employee.base_route || "/")
    } catch {
      toast.error("Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-neutral-950 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="relative z-10 px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
              <span className="text-neutral-950 font-bold text-xl">P</span>
            </div>
            <span className="text-white text-2xl font-light tracking-tight">Padel House</span>
          </div>
          <h1 className="text-4xl font-light text-white leading-tight mb-4">
            Gérez vos réservations<br />
            <span className="text-neutral-500">en toute simplicité.</span>
          </h1>
          <p className="text-neutral-500 text-sm max-w-md">
            Interface d'administration pour la gestion des terrains, créneaux et réservations.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-neutral-50">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="h-10 w-10 rounded-lg bg-neutral-950 flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-neutral-950 text-xl font-light">Padel House</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-medium text-neutral-950 mb-1">Connexion</h2>
            <p className="text-neutral-500 text-sm">Accédez à votre espace d'administration</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Identifiant
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Entrez votre identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 bg-white border-neutral-200 focus:border-neutral-950 focus:ring-neutral-950 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 bg-white border-neutral-200 focus:border-neutral-950 focus:ring-neutral-950 rounded-lg text-sm"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-neutral-400">
            Propulsé par{" "}
            <a
              href="https://www.armasoft.ci"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-600 hover:text-neutral-950 transition-colors"
            >
              ArmaSOFT
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
