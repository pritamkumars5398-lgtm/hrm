import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

export default function Modal({ open, onClose, title, description, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  // Handle focus and overflow only when `open` changes
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    
    // Slight delay to let animation start before focusing
    requestAnimationFrame(() => {
      panelRef.current?.focus()
    })

    return () => {
      document.body.style.overflow = ''
      previouslyFocused?.focus()
    }
  }, [open])

  // Handle Escape key with latest onClose
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1c1d1a]/20 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={reduced ? false : { opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            /* §7.2 narrow exception: a faint shadow, because a border alone doesn't
               read as "above" the dimmed page behind it. `shadow-overlay` is the
               one sanctioned shadow token — never a raw value. */
            className="relative w-full max-w-sm rounded-card border border-hairline bg-surface shadow-overlay outline-none"
          >
            <div className="flex items-start justify-between gap-4 border-b border-hairline p-5">
              <div>
                <h2 className="text-[15px] font-semibold">{title}</h2>
                {description && (
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p>
                )}
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

            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
