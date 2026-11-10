import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import { Icon, cx } from './ui'

export function Toast() {
  const toast = useGameStore((store) => store.toast)
  const dismiss = useGameStore((store) => store.dismissToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => dismiss(), 4200)
    return () => window.clearTimeout(timer)
  }, [toast, dismiss])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4" aria-live="polite" aria-atomic="true">
      {toast && (
        <div
          key={toast.id}
          className={cx(
            'pointer-events-auto flex max-w-md items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur',
            toast.tone === 'bad'
              ? 'border-rose-400/40 bg-rose-950/85 text-rose-100'
              : toast.tone === 'good'
                ? 'border-emerald-400/40 bg-emerald-950/85 text-emerald-100'
                : 'border-sky-400/40 bg-sky-950/85 text-sky-100',
          )}
          role="status"
        >
          <Icon
            name={toast.tone === 'bad' ? 'AlertTriangle' : toast.tone === 'good' ? 'BadgeCheck' : 'Info'}
            size={16}
            className="mt-0.5 shrink-0"
          />
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss notification"
            className="text-current/70 hover:text-white"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
