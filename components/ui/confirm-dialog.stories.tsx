import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { ConfirmDialog } from './confirm-dialog'
import { Button } from './button'

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Design System/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal from `components/ui/confirm-dialog.tsx:18` with Esc handling, focus ref, and async confirm state. Replaces `window.confirm()`.',
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
    isLoading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ConfirmDialog>

export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Delete course?',
    description: 'This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    variant: 'default',
    onConfirm: () => console.log('confirm'),
    onCancel: () => console.log('cancel'),
  },
}

export const Destructive: Story = {
  args: {
    isOpen: true,
    title: 'Delete student?',
    description: 'The student record will be permanently removed.',
    confirmText: 'Delete',
    cancelText: 'Keep',
    variant: 'destructive',
    onConfirm: async () => await new Promise((r) => setTimeout(r, 800)),
    onCancel: () => {},
  },
}

export const Loading: Story = {
  args: {
    isOpen: true,
    title: 'Processing',
    description: 'Please wait...',
    isLoading: true,
    onConfirm: () => {},
    onCancel: () => {},
  },
}

export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false)
    const [last, setLast] = useState<string>('none')
    return (
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <span className="text-xs text-muted-foreground">last: {last}</span>
        <ConfirmDialog
          isOpen={open}
          title="Approve enrollment?"
          description="The student will be notified."
          confirmText="Approve"
          cancelText="Cancel"
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 600))
            setLast('confirmed')
            setOpen(false)
          }}
          onCancel={() => {
            setLast('cancelled')
            setOpen(false)
          }}
        />
      </div>
    )
  },
}
