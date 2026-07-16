import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

type Option = { value: string; label: string }

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  options: Option[]
  error?: string
  hint?: string
  placeholder?: string
}

/** Native <select> under the hood — keyboard and mobile behaviour come free. */
const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, error, hint, placeholder, id, className = '', ...rest },
  ref,
) {
  const selectId = id ?? rest.name ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${selectId}-error`
  const hintId = `${selectId}-hint`

  return (
    <div className={className}>
      <label htmlFor={selectId} className="block text-[13px] font-medium">
        {label}
      </label>

      <div className="relative mt-1.5">
        <select
          id={selectId}
          ref={ref}
          defaultValue=""
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`h-10 w-full appearance-none rounded-ctl border bg-surface pr-9 pl-3 text-[14px] transition-colors ${
            error
              ? 'border-clay focus:border-clay'
              : 'border-hairline-strong hover:border-muted/50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10'
          }`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
        />
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

export default Select
