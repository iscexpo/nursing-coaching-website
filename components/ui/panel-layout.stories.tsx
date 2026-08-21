import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PanelLayout } from './panel-layout'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Settings,
} from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'courses', label: 'Courses', icon: GraduationCap, group: 'Academics' },
  { id: 'students', label: 'Students', icon: Users, group: 'Students' },
  { id: 'payments', label: 'Payments', icon: CreditCard, group: 'Finance' },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    group: 'System',
    badge: 3,
  },
]

const meta: Meta<typeof PanelLayout> = {
  title: 'Design System/PanelLayout',
  component: PanelLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Admin layout shell from `components/ui/panel-layout.tsx:17` with collapsible groups, mobile drawer, `next/link`, and `useTranslations(admin.groups)`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof PanelLayout>

export const Default: Story = {
  args: {
    siteName: 'ISC Expo',
    panelTitle: 'Admin Panel',
    userName: 'Admin One',
    welcomeMessage: 'Logged in as Admin',
    tabs: TABS,
    activeTab: 'overview',
    onTabChange: () => {},
    onSignOut: () => alert('sign out'),
    children: (
      <div className="rounded-2xl border border-border bg-card p-8">
        <p className="text-sm">Main content area — active tab: overview</p>
      </div>
    ),
  },
}

export const WithGroups: Story = {
  args: {
    siteName: 'ISC Expo',
    panelTitle: 'Admin Panel',
    userName: 'Admin One',
    tabs: TABS,
    activeTab: 'students',
    onTabChange: () => {},
    onSignOut: () => {},
    children: (
      <div className="rounded-2xl border bg-card p-6 text-sm">
        Students tab content
      </div>
    ),
  },
}

export const LongTabs: Story = {
  args: {
    siteName: 'ISC Expo - Icon Skill & Career Expo',
    panelTitle: 'Admin Panel',
    userName: 'Miraz Islam',
    welcomeMessage: 'Director',
    tabs: [
      ...TABS,
      { id: 'extra1', label: 'Extra item', icon: Settings, group: 'System' },
      { id: 'extra2', label: 'Another', icon: Settings, group: 'System' },
    ],
    activeTab: 'courses',
    onTabChange: () => {},
    onSignOut: () => {},
    children: (
      <div className="p-4 text-sm">Scroll the sidebar to see groups.</div>
    ),
  },
}
