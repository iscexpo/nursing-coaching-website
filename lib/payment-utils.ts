export type PaymentMethod = 'bkash' | 'nagad' | 'cash' | 'bank'

export type PaymentFormValues = {
  amount: number | ''
  method: PaymentMethod
  transactionId: string
  senderNumber: string
  notes: string
}

export function getPaymentValidationErrors(
  values: Pick<
    PaymentFormValues,
    'amount' | 'method' | 'transactionId' | 'senderNumber'
  >,
  dueAmount: number,
) {
  const errors: Partial<Record<keyof PaymentFormValues, string>> = {}

  if (!values.amount || Number(values.amount) <= 0) {
    errors.amount = 'পরিমাণ আবশ্যক'
  } else if (Number(values.amount) > dueAmount) {
    errors.amount = 'পরিমাণ বকেয়া পরিমাণের বেশি হতে পারে না'
  }

  if (values.method !== 'cash' && values.method !== 'bank') {
    if (!values.transactionId?.trim()) {
      errors.transactionId = 'ট্রানজেকশন ID আবশ্যক'
    }
    if (!values.senderNumber?.trim()) {
      errors.senderNumber = 'প্রেরক নম্বর আবশ্যক'
    }
  }

  return errors
}
