import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <Loader2 className="size-10 animate-spin text-brand" />
          <div className="absolute inset-0 rounded-full bg-brand/10 animate-pulse-ring" />
        </div>
        <p className="font-heading text-sm text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    </div>
  )
}
