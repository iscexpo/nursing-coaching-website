import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Alert } from './alert'

const meta: Meta<typeof Alert> = {
  title: 'Design System/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Colored alert banner from `components/ui/alert.tsx:52` with variant icons (AlertCircle/AlertTriangle/CheckCircle/Info). Used for form-level errors.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'warning', 'success', 'info'],
    },
    dismissible: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Alert>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Heads up',
    message: 'New courses will be available from next week.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Payment verified',
    message: 'Your bKash transaction TX123 has been verified.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Pending verification',
    message: 'Your payment is awaiting admin approval.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Payment failed',
    message: 'Unable to process payment. Please try again.',
  },
}

export const WithoutTitle: Story = {
  args: {
    variant: 'error',
    message: 'Unable to process payment. Please try again.',
  },
}

export const NonDismissible: Story = {
  args: {
    variant: 'info',
    title: 'Heads up',
    message: 'This alert cannot be dismissed.',
    dismissible: false,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-xl">
      <Alert variant="error" title="Error" message="Something went wrong." />
      <Alert
        variant="warning"
        title="Warning"
        message="Please check your inputs."
      />
      <Alert
        variant="success"
        title="Success"
        message="Enrollment created successfully."
      />
      <Alert
        variant="info"
        title="Info"
        message="Your session will expire in 5 minutes."
      />
    </div>
  ),
}

export const DismissibleInteractive: Story = {
  args: {
    variant: 'warning',
    title: 'Dismiss me',
    message: 'Click X to dismiss (uses internal useState, onDismiss callback).',
    onDismiss: () => console.log('dismissed'),
  },
  play: async () => {
    // interaction test placeholder — a11y check ensures button has aria-label="Dismiss"
  },
}
