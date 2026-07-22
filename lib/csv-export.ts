/**
 * Utility for exporting data to CSV format
 */

export interface ExportColumn {
  key: string
  label: string
  formatter?: (value: any) => string
}

/**
 * Convert an array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
): string {
  // Create header row
  const headers = columns.map((col) => `"${col.label}"`).join(',')

  // Create data rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let value = item[col.key]
        if (col.formatter) {
          value = col.formatter(value)
        } else if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        // Escape quotes in values
        return `"${String(value).replace(/"/g, '""')}"`
      })
      .join(','),
  )

  return [headers, ...rows].join('\n')
}

/**
 * Download CSV file to user's device
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV and download it
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string,
): void {
  const csv = arrayToCSV(data, columns)
  downloadCSV(csv, filename)
}
