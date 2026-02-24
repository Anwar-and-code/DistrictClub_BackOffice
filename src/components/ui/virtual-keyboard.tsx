"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Delete, ArrowBigUp, X, Space } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Constants ──────────────────────────────────────────────────────

const AZERTY_ROWS_LOWER = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
  ["SHIFT", "w", "x", "c", "v", "b", "n", "'", ".", "BACKSPACE"],
]

const AZERTY_ROWS_UPPER = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["A", "Z", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["Q", "S", "D", "F", "G", "H", "J", "K", "L", "M"],
  ["SHIFT", "W", "X", "C", "V", "B", "N", "'", ".", "BACKSPACE"],
]

const NUMPAD_ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  ["CLEAR", "0", "BACKSPACE"],
]

const STORAGE_KEY = "padel_virtual_keyboard_enabled"

// ─── Helpers ────────────────────────────────────────────────────────

/** Use the native setter to properly trigger React's onChange */
function setNativeInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = input instanceof HTMLTextAreaElement
    ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")
    : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
  proto?.set?.call(input, value)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function isNumericInput(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  if (el instanceof HTMLTextAreaElement) return false
  const t = el.type?.toLowerCase()
  const im = el.inputMode?.toLowerCase()
  if (t === "number" || t === "tel") return true
  if (im === "numeric" || im === "decimal" || im === "tel") return true
  if (el.dataset.vkType === "numeric") return true
  return false
}

function shouldShowKeyboard(el: Element | null): el is HTMLInputElement | HTMLTextAreaElement {
  if (!el) return false
  if (el instanceof HTMLTextAreaElement) return true
  if (el instanceof HTMLInputElement) {
    const skip = ["checkbox", "radio", "file", "submit", "button", "hidden", "range", "color", "date", "time", "datetime-local"]
    return !skip.includes(el.type?.toLowerCase())
  }
  return false
}

// ─── Hook: read/write setting ───────────────────────────────────────

export function useVirtualKeyboardEnabled(): [boolean, (v: boolean) => void] {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    setEnabled(stored === null ? true : stored === "true")
  }, [])

  const set = useCallback((v: boolean) => {
    setEnabled(v)
    localStorage.setItem(STORAGE_KEY, String(v))
  }, [])

  return [enabled, set]
}

// ─── Component ──────────────────────────────────────────────────────

interface VirtualKeyboardProps {
  enabled?: boolean
}

export default function VirtualKeyboard({ enabled = true }: VirtualKeyboardProps) {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<"numeric" | "text">("text")
  const [shifted, setShifted] = useState(false)
  const activeRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
  const kbRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)

  // ── Detect focus ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }

    const onFocusIn = (e: FocusEvent) => {
      if (closingRef.current) return
      const target = e.target as Element
      // If focus moved to the keyboard itself, ignore
      if (kbRef.current?.contains(target)) return
      if (shouldShowKeyboard(target)) {
        activeRef.current = target
        setMode(isNumericInput(target) ? "numeric" : "text")
        setVisible(true)
        setShifted(false)
      }
    }

    const onFocusOut = (e: FocusEvent) => {
      const related = e.relatedTarget as Element | null
      // If focus moved to the keyboard, don't hide
      if (kbRef.current?.contains(related)) return
      // Small delay to allow keyboard click to register
      setTimeout(() => {
        if (!kbRef.current?.contains(document.activeElement)) {
          // Only hide if activeElement is not another input
          if (!shouldShowKeyboard(document.activeElement)) {
            setVisible(false)
            activeRef.current = null
          }
        }
      }, 100)
    }

    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)
    return () => {
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
    }
  }, [enabled])

  // ── Close keyboard manually ───────────────────────────────────
  const handleClose = useCallback(() => {
    closingRef.current = true
    setVisible(false)
    activeRef.current?.blur()
    activeRef.current = null
    setTimeout(() => { closingRef.current = false }, 200)
  }, [])

  // ── Key press ─────────────────────────────────────────────────
  const handleKey = useCallback((key: string) => {
    const input = activeRef.current
    if (!input) return

    // Keep focus on the original input
    input.focus()

    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? input.value.length
    const val = input.value

    if (key === "BACKSPACE") {
      if (start !== end) {
        setNativeInputValue(input, val.slice(0, start) + val.slice(end))
        requestAnimationFrame(() => input.setSelectionRange(start, start))
      } else if (start > 0) {
        setNativeInputValue(input, val.slice(0, start - 1) + val.slice(start))
        requestAnimationFrame(() => input.setSelectionRange(start - 1, start - 1))
      }
    } else if (key === "CLEAR") {
      setNativeInputValue(input, "")
    } else if (key === "SHIFT") {
      setShifted(s => !s)
    } else if (key === "SPACE") {
      const nv = val.slice(0, start) + " " + val.slice(end)
      setNativeInputValue(input, nv)
      requestAnimationFrame(() => input.setSelectionRange(start + 1, start + 1))
    } else {
      const nv = val.slice(0, start) + key + val.slice(end)
      setNativeInputValue(input, nv)
      requestAnimationFrame(() => input.setSelectionRange(start + 1, start + 1))
      // Auto-lowercase after one uppercase letter
      if (shifted) setShifted(false)
    }
  }, [shifted])

  // ── Prevent keyboard clicks from stealing focus ───────────────
  const preventFocusSteal = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  if (!enabled) return null

  const textRows = shifted ? AZERTY_ROWS_UPPER : AZERTY_ROWS_LOWER

  return (
    <div
      ref={kbRef}
      onMouseDown={preventFocusSteal}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-200 ease-out",
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      )}
    >
      {/* Backdrop gradient */}
      <div className="bg-gradient-to-t from-black/60 to-transparent h-3" />

      <div className="bg-neutral-900 border-t border-neutral-700 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        {/* Top bar: close button */}
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider select-none">
            {mode === "numeric" ? "Clavier numérique" : "Clavier"}
          </span>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Keys */}
        <div className="px-1 pb-2">
          {mode === "numeric" ? (
            /* ── Numeric pad ──────────────────────────────── */
            <div className="max-w-[280px] mx-auto">
              {NUMPAD_ROWS.map((row, ri) => (
                <div key={ri} className="flex gap-1.5 mb-1.5 justify-center">
                  {row.map((key) => {
                    const isAction = key === "BACKSPACE" || key === "CLEAR"
                    return (
                      <button
                        key={key}
                        onClick={() => handleKey(key)}
                        className={cn(
                          "h-12 rounded-lg font-semibold text-lg transition-all active:scale-95 select-none flex items-center justify-center",
                          isAction
                            ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-300 w-20"
                            : "bg-white hover:bg-neutral-200 text-neutral-900 shadow-sm border border-neutral-600 w-20"
                        )}
                      >
                        {key === "BACKSPACE" ? <Delete className="h-5 w-5" /> : key === "CLEAR" ? "C" : key}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            /* ── Text keyboard (AZERTY) ──────────────────── */
            <div className="max-w-[600px] mx-auto">
              {textRows.map((row, ri) => (
                <div key={ri} className="flex gap-1 mb-1 justify-center">
                  {row.map((key, ki) => {
                    const isShift = key === "SHIFT"
                    const isBksp = key === "BACKSPACE"
                    const isAction = isShift || isBksp
                    const w = isAction ? "w-14" : "w-11"

                    return (
                      <button
                        key={`${ri}-${ki}`}
                        onClick={() => handleKey(key)}
                        className={cn(
                          "h-11 rounded-lg font-medium text-sm transition-all active:scale-95 select-none flex items-center justify-center",
                          w,
                          isShift && shifted
                            ? "bg-white text-neutral-900"
                            : isAction
                              ? "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                              : "bg-white hover:bg-neutral-200 text-neutral-900 shadow-sm border border-neutral-600"
                        )}
                      >
                        {isShift ? <ArrowBigUp className="h-5 w-5" /> : isBksp ? <Delete className="h-5 w-5" /> : key}
                      </button>
                    )
                  })}
                </div>
              ))}
              {/* Space bar row */}
              <div className="flex gap-1 justify-center">
                <button
                  onClick={() => handleKey("@")}
                  className="h-11 w-11 rounded-lg font-medium text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-all active:scale-95 select-none flex items-center justify-center"
                >
                  @
                </button>
                <button
                  onClick={() => handleKey("SPACE")}
                  className="h-11 flex-1 max-w-[320px] rounded-lg font-medium text-sm bg-white hover:bg-neutral-200 text-neutral-400 shadow-sm border border-neutral-600 transition-all active:scale-95 select-none flex items-center justify-center gap-2"
                >
                  <Space className="h-4 w-4" />
                  espace
                </button>
                <button
                  onClick={() => handleKey("-")}
                  className="h-11 w-11 rounded-lg font-medium text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-300 transition-all active:scale-95 select-none flex items-center justify-center"
                >
                  -
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
