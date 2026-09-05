export const inputCls =
  'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
export const labelCls = 'block text-sm font-medium text-foreground'

export type AddFormState = {
  userId: string
  selectedCourseIds: string[]
  notes: string
  discount: string
}

export type EditState = {
  status: string
  notes: string
  startDate: string
  endDate: string
  discount: string
}
