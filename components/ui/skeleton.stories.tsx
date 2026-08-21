import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Skeleton, StatCardSkeleton, TableSkeleton, CardSkeleton, DashboardSkeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Design System/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Shimmer skeletons from `components/ui/skeleton.tsx:1` using `app/globals.css:252` `.skeleton` (shimmer 1.8s). Respects `prefers-reduced-motion`.',
      },
    },
  },
  argTypes: {
    className: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
  args: { className: 'h-8 w-32' },
}

export const TextBlock: Story = {
  render: () => (
    <div className="space-y-2 max-w-sm">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  ),
}

export const StatCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <StatCardSkeleton />
    </div>
  ),
}

export const Table: Story = {
  render: () => <TableSkeleton rows={5} />,
}

export const TableCustomRows: Story = {
  args: { className: 'h-10 w-full' },
  render: () => <TableSkeleton rows={8} />,
}

export const Card: Story = {
  render: () => (
    <div className="max-w-sm">
      <CardSkeleton />
    </div>
  ),
}

export const Dashboard: Story = {
  render: () => <DashboardSkeleton />,
  parameters: { layout: 'fullscreen' },
}

export const All: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Inline</p>
        <Skeleton className="h-8 w-32" />
      </section>
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Table (5 rows)</p>
        <TableSkeleton rows={5} />
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCardSkeleton />
        <CardSkeleton />
      </section>
    </div>
  ),
}
