import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { BulkActions } from './bulk-actions'
import { CheckCircle, XCircle, Download, Trash2 } from 'lucide-react'

const meta: Meta<typeof BulkActions> = {
  title: 'Design System/BulkActions',
  component: BulkActions,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Bulk toolbar from `components/ui/bulk-actions.tsx:52`. Hidden when `selectedCount===0`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof BulkActions>

export const WithSelection: Story = {
  args: {
    selectedCount: 3,
    selectedIds: ['1', '2', '3'],
    totalCount: 10,
    actions: [
      { id: 'approve', label: 'Approve', icon: CheckCircle, onClick: async () => {} },
      { id: 'reject', label: 'Reject', icon: XCircle, variant: 'destructive', onClick: async () => {} },
    ],
  },
}

export const SingleAction: Story = {
  args: {
    selectedCount: 2,
    selectedIds: ['1', '2'],
    totalCount: 10,
    actions: [{ id: 'export', label: 'Export', icon: Download, onClick: async () => {} }],
  },
}

export const ManyActions: Story = {
  args: {
    selectedCount: 5,
    selectedIds: ['1', '2', '3', '4', '5'],
    totalCount: 5,
    actions: [
      { id: 'approve', label: 'Approve', icon: CheckCircle, onClick: async () => {} },
      { id: 'reject', label: 'Reject', icon: XCircle, variant: 'destructive', onClick: async () => {} },
      { id: 'export', label: 'Export', icon: Download, onClick: async () => {} },
      { id: 'delete', label: 'Delete', icon: Trash2, variant: 'destructive', onClick: async () => {} },
    ],
  },
}

export const HiddenWhenEmpty: Story = {
  args: {
    selectedCount: 0,
    selectedIds: [],
    totalCount: 10,
    actions: [{ id: 'approve', label: 'Approve', icon: CheckCircle, onClick: async () => {} }],
  },
  parameters: {
    docs: { description: { story: 'Returns null when selectedCount===0 — viewport shows nothing.' } },
  },
}

export const Interactive: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['a', 'b'])
    return (
      <BulkActions
        selectedCount={selected.length}
        selectedIds={selected}
        totalCount={6}
        actions={[
          {
            id: 'clear',
            label: `Clear (${selected.length})`,
            icon: XCircle,
            variant: 'destructive',
            onClick: () => setSelected([]),
          },
        ]}
        onSelectAll={(all) => setSelected(all ? ['a', 'b', 'c', 'd', 'e', 'f'] : [])}
        onClearSelection={() => setSelected([])}
      />
    )
  },
}
