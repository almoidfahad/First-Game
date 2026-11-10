import type { ReactNode } from 'react'
import { useGameStore } from '../store/useGameStore'
import { Icon, NeonButton } from './ui'

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  backTo = 'menu',
  wide,
}: {
  eyebrow: string
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  backTo?: Parameters<ReturnType<typeof useGameStore.getState>['navigate']>[0]
  wide?: boolean
}) {
  const navigate = useGameStore((store) => store.navigate)

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full flex-col px-4 py-6 sm:px-6">
      <div className={wide ? 'mx-auto w-full max-w-7xl' : 'mx-auto w-full max-w-5xl'}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <NeonButton variant="ghost" size="sm" icon="ChevronLeft" onClick={() => navigate(backTo)} className="-ml-2 mb-2">
              Back
            </NeonButton>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display-title mt-1 text-3xl text-slate-100 sm:text-4xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
        <main id="main">{children}</main>
        <p className="mt-8 flex items-center justify-center gap-2 text-[0.6rem] uppercase tracking-[0.24em] text-slate-600">
          <Icon name="Moon" size={12} /> Shadow City · The Last Light · v1.0
        </p>
      </div>
    </div>
  )
}
