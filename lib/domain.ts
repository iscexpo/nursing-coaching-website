function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://iscexpo.edu.bd'
}

function getSiteHostname(): string {
  try {
    return new URL(getSiteUrl()).hostname
  } catch {
    return 'iscexpo.edu.bd'
  }
}

export function deriveStudentEmail(phone: string): string {
  const normalized = phone.replace(/[^0-9]/g, '')
  const domain = getSiteHostname()
  return `student-${normalized}@${domain}`
}
