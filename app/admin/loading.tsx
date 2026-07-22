import { Loader2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function AdminLoading() {
  const t = await getTranslations('common')
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-8 animate-spin text-brand" />
        <p className="font-heading text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  )
}
