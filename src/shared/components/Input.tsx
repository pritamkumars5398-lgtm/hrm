import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  /** Adds a show/hide toggle and manages the type itself. */
  revealable?: boolean
  hint?: string
}

/** Border + background step only — no shadow, 6px radius (§7.2). */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, revealable, id, className = '', type = 'text', ...rest },
  ref,
) {
  const [revealed, setRevealed] = useState(false)
  const inputId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const resolvedType = revealable ? (revealed ? 'text' : 'password') : type

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-[13px] font-medium">
        {label}
      </label>

      <div className="relative mt-1.5">
        <input
          id={inputId}
          ref={ref}
          type={resolvedType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`h-10 w-full rounded-ctl border bg-surface px-3 text-[14px] transition-colors placeholder:text-muted/60 ${
            revealable ? 'pr-10' : ''
          } ${
            error
              ? 'border-clay focus:border-clay'
              : 'border-hairline-strong focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 hover:border-muted/50'
          }`}
          {...rest}
        />

        {revealable && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center text-muted hover:text-ink"
          >
            {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-[12px] text-clay">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export default Input
