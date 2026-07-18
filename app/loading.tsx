import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-10 animate-spin text-brand" />
        <p className="font-heading text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
