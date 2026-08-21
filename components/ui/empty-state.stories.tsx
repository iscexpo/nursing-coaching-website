import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EmptyState } from './empty-state'
import { Search, Inbox, FileX } from 'lucide-react'

const meta: Meta<typeof EmptyState> = {
  title: 'Design System/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Icon + heading + description + CTA from `components/ui/empty-state.tsx:4`. Used when lists are empty.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {
    title: 'No courses found',
    description: 'Add a new course or change the filter.',
  },
}

export const WithAction: Story = {
  args: {
    title: 'No students yet',
    description: 'Get started by adding your first student.',
    actionLabel: 'Add Student',
    onAction: () => alert('action'),
  },
}

export const NoDescription: Story = {
  args: { title: 'No results' },
}

export const CustomIcon: Story = {
  args: {
    icon: Search,
    title: 'No results found',
    description: 'Try a different keyword.',
  },
}

export const AllIcons: Story = {
  render: () => (
    <div className="grid gap-6 sm:grid-cols-3">
      <EmptyState icon={Inbox} title="Inbox empty" description="No messages." />
      <EmptyState
        icon={Search}
        title="Search empty"
        description="No matches."
      />
      <EmptyState
        icon={FileX}
        title="No file"
        description="Upload a file."
        actionLabel="Upload"
        onAction={() => {}}
      />
    </div>
  ),
}
