import { Hammer } from 'lucide-react'

/** Each of these is replaced as its §4 item is built. */
export default function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-card border border-dashed border-hairline-strong bg-surface">
      <div className="max-w-sm px-6 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-wash">
          <Hammer size={18} className="text-muted" aria-hidden="true" />
        </span>

        <h1 className="font-display mt-5 text-xl font-semibold tracking-[-0.01em]">{title}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          This module is next up in the build. Your role has access to it — the screen itself
          isn't finished yet.
        </p>
      </div>
    </div>
  )
}
