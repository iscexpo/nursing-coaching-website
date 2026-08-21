'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Database, RefreshCw } from 'lucide-react'

type DatabaseHealth = {
  ok: boolean
  missingTables: string[]
  missingColumns: string[]
  error: string | null
}

export function DatabaseHealthBanner() {
  const t = useTranslations('admin.common')
  const [health, setHealth] = useState<DatabaseHealth | null>(null)
  const [checking, setChecking] = useState(true)

  const check = useCallback(async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        const data = await res.json()
        setHealth(data)
      } else {
        setHealth({
          ok: false,
          missingTables: [],
          missingColumns: [],
          error: t('dbHealthCheckFailed'),
        })
      }
    } catch {
      setHealth({
        ok: false,
        missingTables: [],
        missingColumns: [],
        error: t('dbHealthCheckFailed'),
      })
    } finally {
      setChecking(false)
    }
  }, [t])

  useEffect(() => {
    check()
  }, [check])

  if (checking) return null
  if (!health || health.ok) return null

  const missing = [
    ...health.missingTables.map((m) => `${t('dbMissingTable')} ${m}`),
    ...health.missingColumns.map((m) => `${t('dbMissingColumn')} ${m}`),
  ]

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 shadow-sm">
      <AlertTriangle className="size-5 shrink-0 text-destructive" />
      <div className="flex-1 min-w-0">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Database className="size-4 text-destructive" />
          {t('dbHealthWarning')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {health.error || missing.join('; ') || t('dbHealthUnknown')}
        </p>
      </div>
      <button
        onClick={check}
        className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80"
      >
        <RefreshCw className={`size-3.5 ${checking ? 'animate-spin' : ''}`} />
        {t('retry')}
      </button>
    </div>
  )
}
