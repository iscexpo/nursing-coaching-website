import * as XLSX from 'xlsx'
import { normalizePhoneNumbers } from '@/lib/sms'

export type SheetSmsPayload = {
  title: string
  content: string
  file: File
}

export async function extractPhoneNumbersFromSheet(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
  })

  const values = rows.flatMap((row) => {
    return Object.values(row).map((value) => {
      if (typeof value === 'string' || typeof value === 'number')
        return String(value)
      return null
    })
  })

  return normalizePhoneNumbers(values)
}
