import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type RevealProps = {
  children: ReactNode
  /** Stagger position within a group, in seconds. */
  delay?: number
  className?: string
}

/**
 * Scroll-triggered reveal. Motion is purposeful and small (§7.4):
 * an 8px rise and a fade, once, and nothing at all when the user
 * has asked for reduced motion.
 */
export default function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
