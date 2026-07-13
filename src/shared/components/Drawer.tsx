import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

type DrawerProps = {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
}

/** A right-hand side panel. Same rules as Modal: Escape, backdrop, focus restore. */
export default function Drawer({ open, onClose, title, subtitle, children }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const previouslyFocused = document.activeElement as HTMLElement | null
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/25"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={reduced ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: '100%' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-hairline bg-paper outline-none"
          >
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-hairline px-5 py-4">
              <div className="min-w-0">
                <h2 className="font-display truncate text-lg font-semibold tracking-[-0.01em]">
                  {title}
                </h2>
                {subtitle && <p className="mt-0.5 truncate text-[13px] text-muted">{subtitle}</p>}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-ctl text-muted transition-colors hover:bg-wash hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
