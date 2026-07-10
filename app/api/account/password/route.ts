import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/permissions'

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const res = await fetch(`${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      return NextResponse.json({ error: error.message || 'Failed to update password' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}