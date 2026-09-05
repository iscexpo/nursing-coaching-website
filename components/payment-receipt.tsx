'use client'

import { QrCode } from 'lucide-react'
import { Button } from './ui/button'
import { SITE } from '@/lib/cms/site-data'

interface PaymentReceiptProps {
  receiptNumber: string
  date: string
  amount: number
  method: string
  studentName: string
  studentId: string
  courseName: string
  invoiceId: string
  transactionId?: string
  notes?: string
  onPrint?: () => void
}

export function PaymentReceipt({
  receiptNumber,
  date,
  amount,
  method,
  studentName,
  studentId,
  courseName,
  invoiceId,
  transactionId,
  notes,
  onPrint,
}: PaymentReceiptProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg print:shadow-none">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">{SITE.nameBn}</h1>
          <h2 className="text-xl font-semibold text-center text-gray-600">
            Payment Receipt
          </h2>
          <p className="text-center text-sm text-gray-500 mt-2">
            Receipt #{receiptNumber}
          </p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Receipt Date</p>
              <p className="text-lg font-semibold">
                {new Date(date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Payment Method</p>
              <p className="text-lg font-semibold capitalize">{method}</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600 font-medium">Invoice Number</p>
              <p className="text-lg font-semibold">{invoiceId}</p>
            </div>
            {transactionId && (
              <div>
                <p className="text-gray-600 font-medium">Transaction ID</p>
                <p className="text-lg font-semibold">{transactionId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Student & Course Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-600 font-medium mb-1">Student Name</p>
              <p className="font-semibold">{studentName}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Student ID</p>
              <p className="font-semibold">{studentId}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 font-medium mb-1">Course</p>
              <p className="font-semibold">{courseName}</p>
            </div>
          </div>
        </div>

        {/* Amount Section */}
        <div className="border-2 border-gray-300 rounded-lg p-6 mb-8 text-center bg-blue-50">
          <p className="text-gray-600 text-sm font-medium mb-2">
            Payment Amount
          </p>
          <p className="text-4xl font-bold text-blue-600">
            ৳ {amount.toLocaleString()}
          </p>
        </div>

        {/* Notes */}
        {notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-sm">
            <p className="font-medium text-yellow-900 mb-1">Notes</p>
            <p className="text-yellow-800">{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-6 mt-8">
          <p className="text-center text-xs text-gray-500 mb-4">
            This is an automatically generated receipt. No signature is
            required.
          </p>
          <div className="flex justify-center">
            <QrCode className="size-16 text-gray-400" />
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Generated on {new Date().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Print Button */}
      {onPrint && (
        <div className="mt-6 flex justify-center print:hidden">
          <Button onClick={onPrint}>Print Receipt</Button>
        </div>
      )}
    </div>
  )
}
