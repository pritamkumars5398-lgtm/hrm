import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'premium'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  // Accent is reserved for primary actions only — §7.3
  primary: 'bg-gradient-to-r from-[#10b981] to-[#15803d] text-white border border-[#10b981]/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden',
  secondary: 'bg-surface text-ink border border-hairline-strong hover:bg-wash',
  ghost: 'bg-transparent text-ink border border-transparent hover:bg-wash',
  inverse: 'bg-paper text-pine-deep border border-paper hover:bg-white',
  premium: 'bg-gradient-to-r from-[#10b981] to-[#15803d] text-white border border-[#10b981]/30 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] relative overflow-hidden',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

// No box-shadow in any state — elevation comes from borders and background steps (§7.2)
const base =
  'inline-flex items-center justify-center gap-2 rounded-ctl font-medium tracking-[-0.006em] ' +
  'transition-colors duration-150 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none'

type BaseProps = {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { to?: undefined; href?: undefined }

type InternalLinkProps = BaseProps & { to: string; href?: undefined }
type ExternalLinkProps = BaseProps & { href: string; to?: undefined }

export default function Button(props: ButtonProps | InternalLinkProps | ExternalLinkProps) {
  const { variant = 'primary', size = 'md', children, className = '' } = props
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={cls}>
        {children}
      </Link>
    )
  }

  if ('href' in props && props.href) {
    return (
      <a href={props.href} className={cls}>
        {children}
      </a>
    )
  }

  const { variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonProps
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
