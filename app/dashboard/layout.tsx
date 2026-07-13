import { redirect } from 'next/navigation'
import { getSession } from '@/lib/permissions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  if (!session) {
    redirect('/auth/sign-in')
  }

  return <>{children}</>
}
