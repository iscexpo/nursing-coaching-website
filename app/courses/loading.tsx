import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
      <div className="space-y-12">
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-6 w-32 rounded-full" />
          <Skeleton className="mx-auto h-10 w-96 max-w-full" />
          <Skeleton className="mx-auto h-5 w-64 max-w-full" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
