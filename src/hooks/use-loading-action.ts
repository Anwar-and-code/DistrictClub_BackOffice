import { useState, useCallback } from "react"
import { toast } from "sonner"

type ToastMessages = {
  loading?: string
  success?: string
  error?: string | ((err: unknown) => string)
}

/**
 * Hook pour encapsuler toute action async avec un état loading + toast automatique.
 *
 * Usage:
 * ```ts
 * const [action, isLoading] = useLoadingAction(
 *   async () => { await deleteItem(id) },
 *   { success: "Supprimé", error: "Erreur lors de la suppression" }
 * )
 *
 * <Button loading={isLoading} onClick={action}>Supprimer</Button>
 * ```
 *
 * Ou avec toast.promise (loading visible) :
 * ```ts
 * const [action, isLoading] = useLoadingAction(
 *   async () => { await saveItem(data) },
 *   { loading: "Enregistrement...", success: "Enregistré", error: "Erreur" }
 * )
 * ```
 */
export function useLoadingAction<T = void>(
  fn: () => Promise<T>,
  messages?: ToastMessages
): [() => Promise<T | undefined>, boolean] {
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (): Promise<T | undefined> => {
    if (isLoading) return undefined
    setIsLoading(true)

    try {
      if (messages?.loading) {
        const errorFn = messages.error
        await toast.promise(fn(), {
          loading: messages.loading,
          success: messages.success || "Terminé",
          error: typeof errorFn === "function"
            ? (err: unknown) => errorFn(err)
            : (messages.error as string) || "Une erreur est survenue",
        })
        return undefined
      } else {
        const result = await fn()
        if (messages?.success) toast.success(messages.success)
        return result
      }
    } catch (err: unknown) {
      if (!messages?.loading) {
        const errorFn = messages?.error
        const msg = typeof errorFn === "function"
          ? errorFn(err)
          : (errorFn as string) || "Une erreur est survenue"
        toast.error(msg)
      }
      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [fn, messages, isLoading])

  return [execute, isLoading]
}

/**
 * Version plus flexible qui accepte des paramètres dynamiques.
 *
 * Usage:
 * ```ts
 * const [execute, isLoading] = useLoadingCallback(
 *   async (id: string) => { await deleteItem(id) },
 *   { success: "Supprimé", error: "Erreur" }
 * )
 *
 * <Button loading={isLoading} onClick={() => execute(item.id)}>Supprimer</Button>
 * ```
 */
export function useLoadingCallback<TArgs extends unknown[], TResult = void>(
  fn: (...args: TArgs) => Promise<TResult>,
  messages?: ToastMessages
): [(...args: TArgs) => Promise<TResult | undefined>, boolean] {
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (...args: TArgs): Promise<TResult | undefined> => {
    if (isLoading) return undefined
    setIsLoading(true)

    try {
      if (messages?.loading) {
        const errorFn = messages.error
        await toast.promise(fn(...args), {
          loading: messages.loading,
          success: messages.success || "Terminé",
          error: typeof errorFn === "function"
            ? (err: unknown) => errorFn(err)
            : (messages.error as string) || "Une erreur est survenue",
        })
        return undefined
      } else {
        const result = await fn(...args)
        if (messages?.success) toast.success(messages.success)
        return result
      }
    } catch (err: unknown) {
      if (!messages?.loading) {
        const errorFn = messages?.error
        const msg = typeof errorFn === "function"
          ? errorFn(err)
          : (errorFn as string) || "Une erreur est survenue"
        toast.error(msg)
      }
      return undefined
    } finally {
      setIsLoading(false)
    }
  }, [fn, messages, isLoading])

  return [execute, isLoading]
}
