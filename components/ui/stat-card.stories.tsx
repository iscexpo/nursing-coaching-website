import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatCard } from './stat-card'
import { Users, BookOpen, CreditCard, TrendingUp } from 'lucide-react'

const meta: Meta<typeof StatCard> = {
  title: 'Design System/StatCard',
  component: StatCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Small stat card from `components/ui/stat-card.tsx:3` with `color` map (brand/green/gold/destructive) and icon.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof StatCard>

export const Default: Story = {
  args: {
    label: 'Total Students',
    value: '1,248',
    sub: '+12%',
    icon: Users,
    color: 'brand',
  },
}

export const AllColors: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Students" value="1,248" sub="+8%" icon={Users} color="brand" />
      <StatCard label="Present" value="98%" sub="today" icon={TrendingUp} color="green" />
      <StatCard label="Due" value="৳12,400" sub="pending" icon={CreditCard} color="gold" />
      <StatCard label="Failed" value="23" sub="exams" icon={BookOpen} color="destructive" />
    </div>
  ),
}

export const WithoutSub: Story = {
  args: { label: 'Active Courses', value: '12', icon: BookOpen, color: 'brand' },
}

export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard label="Total Revenue" value="৳245,000" sub="verified" icon={CreditCard} color="brand" />
      <StatCard label="Enrolled" value="842" sub="this month" icon={Users} color="green" />
    </div>
  ),
}
