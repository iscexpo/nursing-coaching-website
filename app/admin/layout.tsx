import { redirect } from 'next/navigation'
import { getSession, isAdmin } from '@/lib/permissions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/auth/sign-in')
  }

  if (!isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
