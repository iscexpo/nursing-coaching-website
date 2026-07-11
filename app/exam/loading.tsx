import { Loader2 } from 'lucide-react'

export default function ExamLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-brand" />
        <p className="font-heading text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    </div>
  )
}
