export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const { validateEnv } = await import('@/lib/env')
  validateEnv()

  if (process.env.NODE_ENV !== 'test') {
    const { assertDatabaseReady } = await import('@/lib/db/health')
    await assertDatabaseReady()
  }
}
