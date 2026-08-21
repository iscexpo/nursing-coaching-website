import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChartCard } from './chart-card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

const sample = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 2780 },
]

const meta: Meta<typeof ChartCard> = {
  title: 'Design System/ChartCard',
  component: ChartCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Card wrapper for recharts from `components/ui/chart-card.tsx:17` with loading/empty/error states. Dynamic import recommended in app.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ChartCard>

export const Default: Story = {
  args: {
    title: 'Revenue Trend',
    description: 'Last 30 days',
    children: (
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sample}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ),
  },
}

export const WithBar: Story = {
  args: {
    title: 'Monthly Revenue',
    children: (
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sample}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip />
            <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ),
  },
}

export const Loading: Story = {
  args: { isLoading: true, children: null },
}

export const Empty: Story = {
  args: { isEmpty: true, children: null },
}

export const ErrorState: Story = {
  args: { error: new Error('Failed to fetch report data'), children: null },
}
