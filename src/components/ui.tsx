import {
  Accessibility,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Apple,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Compass,
  Cross,
  Cpu,
  Download,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Flag,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Lock,
  LogOut,
  Map as MapIcon,
  Moon,
  Newspaper,
  Package,
  Pause,
  Play,
  Printer,
  Radio,
  RadioTower,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Skull,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrainFront,
  Trophy,
  Upload,
  User,
  Users,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

const ICONS: Record<string, LucideIcon> = {
  Accessibility,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Apple,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Compass,
  Cross,
  Cpu,
  Download,
  Droplets,
  Eye,
  EyeOff,
  FileText,
  Flag,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Lock,
  LogOut,
  Map: MapIcon,
  Moon,
  Newspaper,
  Package,
  Pause,
  Play,
  Printer,
  Radio,
  RadioTower,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShoppingBag,
  Skull,
  Sparkles,
  Star,
  Target,
  Trash2,
  TrainFront,
  Trophy,
  Upload,
  User,
  Users,
  Volume2,
  VolumeX,
  Wrench,
  X,
  Zap,
}

export function Icon({ name, size = 18, ...rest }: { name: string } & Omit<LucideProps, 'name'>) {
  const Component = ICONS[name] ?? Circle
  return <Component size={size} aria-hidden="true" {...rest} />
}

export function Panel({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cx('panel overflow-hidden', className)}>
      {(title || actions || eyebrow) && (
        <header className="panel-heading">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <h2 className="truncate text-base font-semibold tracking-wide text-slate-100">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cx('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold'
type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: '',
  ghost: 'bg-transparent border-transparent hover:border-sky-400/25 hover:bg-white/5',
  danger: 'btn-danger',
  success: 'btn-success',
  gold: 'btn-gold',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[0.68rem] tracking-[0.12em]',
  md: '',
  lg: 'px-6 py-3 text-sm',
}

export interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: string
  iconRight?: string
  loading?: boolean
  full?: boolean
}

export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(function NeonButton(
  { children, variant = 'secondary', size = 'md', icon, iconRight, loading, full, className, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      className={cx('btn', VARIANT_CLASS[variant], SIZE_CLASS[size], full && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        icon && <Icon name={icon} size={16} />
      )}
      <span className="truncate">{children}</span>
      {iconRight && <Icon name={iconRight} size={16} />}
    </button>
  )
})

export function IconButton({
  label,
  icon,
  className,
  ...rest
}: { label: string; icon: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={17} />
    </button>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'good' | 'bad' | 'warn' | 'mystery'
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'border-white/10 text-slate-300',
    good: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
    bad: 'border-rose-400/40 text-rose-300 bg-rose-500/10',
    warn: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
    mystery: 'border-violet-400/40 text-violet-200 bg-violet-500/10',
  }
  return <span className={cx('chip', tones[tone], className)}>{children}</span>
}

export function StatBar({
  label,
  value,
  max,
  color = '#38bdf8',
  icon,
  compact,
}: {
  label: string
  value: number
  max: number
  color?: string
  icon?: string
  compact?: boolean
}) {
  const safeMax = Math.max(1, max)
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)))
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 text-[0.7rem] uppercase tracking-[0.16em] text-slate-400">
        <span className="flex items-center gap-1.5">
          {icon && <Icon name={icon} size={13} style={{ color }} />}
          {label}
        </span>
        {!compact && (
          <span className="font-semibold text-slate-200">
            {value}
            <span className="text-slate-500">/{max}</span>
          </span>
        )}
      </div>
      <div className="stat-track" role="progressbar" aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={value} aria-label={label}>
        <div
          className="stat-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 12px ${color}66` }}
        />
      </div>
    </div>
  )
}

export function Ring({
  value,
  max = 100,
  label,
  color = '#38bdf8',
  size = 132,
}: {
  value: number
  max?: number
  label?: string
  color?: string
  size?: number
}) {
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = Math.max(0, Math.min(1, value / Math.max(1, max)))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)`, transition: 'stroke-dashoffset 700ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-50">{Math.round(value)}</span>
        {label && <span className="text-[0.6rem] uppercase tracking-[0.2em] text-slate-400">{label}</span>}
      </div>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cx('panel relative max-h-[88vh] w-full overflow-hidden', wide ? 'max-w-3xl' : 'max-w-lg')}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="panel-heading">
              <div>
                <h3 id="modal-title" className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-100">
                  {title}
                </h3>
                {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
              </div>
              <IconButton label="Close dialog" icon="X" onClick={onClose} />
            </header>
            <div className="max-h-[62vh] overflow-y-auto p-4">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/5 p-4">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm text-slate-200">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-400">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cx(
          'relative mt-1 h-6 w-11 shrink-0 rounded-full border transition',
          checked ? 'border-sky-400/60 bg-sky-500/30' : 'border-white/15 bg-white/5',
        )}
      >
        <span
          className={cx(
            'absolute top-0.5 h-4.5 w-4.5 rounded-full transition-transform',
            checked ? 'translate-x-[1.35rem] bg-sky-300' : 'translate-x-0.5 bg-slate-400',
          )}
          style={{ height: '1.125rem', width: '1.125rem' }}
        />
      </button>
    </label>
  )
}

export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.05,
  format,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  format?: (value: number) => string
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max' | 'step'>) {
  return (
    <label className="block py-2">
      <span className="mb-1 flex items-center justify-between text-sm text-slate-200">
        {label}
        <span className="font-mono text-xs text-slate-400">{format ? format(value) : Math.round(value * 100)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-sky-400"
        aria-label={label}
      />
    </label>
  )
}

export function EmptyState({ icon = 'Compass', title, description }: { icon?: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-300">
        <Icon name={icon} size={22} />
      </span>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-200">{title}</p>
      <p className="max-w-sm text-sm text-slate-400">{description}</p>
    </div>
  )
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-1.5 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-200">{value}</span>
    </div>
  )
}
