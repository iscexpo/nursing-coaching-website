import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  StatusBadge,
  EnrollmentStatusBadge,
  PaymentStatusBadge,
  ExamStatusBadge,
  AttendanceStatusBadge,
  MethodBadge,
  InvoiceStatusBadge,
} from './status-badge'

const meta: Meta<typeof StatusBadge> = {
  title: 'Design System/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Colored badge with icons from `components/ui/status-badge.tsx:105`. Toggle via toolbar Locale EN/BN for i18n labels.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: [
        'pending',
        'approved',
        'rejected',
        'active',
        'inactive',
        'completed',
        'failed',
        'warning',
        'draft',
        'published',
      ],
    },
    size: { control: 'select', options: ['sm', 'md'] },
    showIcon: { control: 'boolean' },
    customLabel: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof StatusBadge>

export const Default: Story = {
  args: { status: 'pending' },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[
        'pending',
        'approved',
        'rejected',
        'active',
        'inactive',
        'completed',
        'failed',
        'warning',
        'draft',
        'published',
      ].map((s) => (
        <StatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <StatusBadge status="approved" size="sm" />
      <StatusBadge status="approved" size="md" />
    </div>
  ),
}

export const WithoutIcon: Story = {
  args: { status: 'approved', showIcon: false },
}

export const CustomLabel: Story = {
  args: { status: 'pending', customLabel: 'Awaiting review' },
}

export const UnknownStatusFallback: Story = {
  args: { status: 'custom-unknown' as string, customLabel: 'Custom' },
}

export const EnrollmentVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {[
        'pending',
        'approved',
        'rejected',
        'active',
        'completed',
        'expired',
        'suspended',
      ].map((s) => (
        <EnrollmentStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const PaymentVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {['pending', 'verified', 'rejected', 'completed', 'failed'].map((s) => (
        <PaymentStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const ExamVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {['draft', 'active', 'completed', 'published'].map((s) => (
        <ExamStatusBadge key={s} status={s} />
      ))}
    </div>
  ),
}

export const Attendance: Story = {
  render: () => (
    <div className="flex gap-2">
      <AttendanceStatusBadge status="present" />
      <AttendanceStatusBadge status="absent" />
      <AttendanceStatusBadge status="late" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Uses `useTranslations(common)` — toggle locale toolbar BN/EN to see labels.',
      },
    },
  },
}

export const MethodsAndInvoices: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex gap-2">
        <MethodBadge method="bkash" />
        <MethodBadge method="nagad" />
        <MethodBadge method="cash" />
        <MethodBadge method="bank" />
        <MethodBadge method="unknown" />
      </div>
      <div className="flex gap-2">
        <InvoiceStatusBadge status="paid" />
        <InvoiceStatusBadge status="partial" />
        <InvoiceStatusBadge status="unpaid" />
        <InvoiceStatusBadge status="overdue" />
      </div>
    </div>
  ),
}
