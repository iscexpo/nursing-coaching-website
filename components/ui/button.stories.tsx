import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import { Trash2, Loader2, ArrowRight, Plus } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'shadcn `base-nova` Button built on `components/ui/button.tsx:1` with `cva` variants and Base UI primitive. Source `app/globals.css:77` tokens.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: { layout: 'padded' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="default">default</Button>
      <Button size="lg">lg</Button>
      <Button size="icon" aria-label="icon">
        <Plus />
      </Button>
      <Button size="icon-sm" aria-label="icon-sm">
        <Plus />
      </Button>
      <Button size="icon-lg" aria-label="icon-lg">
        <Plus />
      </Button>
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button>
        <Plus /> New Course
      </Button>
      <Button variant="outline">
        Continue <ArrowRight data-icon="inline-end" />
      </Button>
      <Button variant="destructive">
        <Trash2 /> Delete
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="flex gap-3">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Outline disabled
      </Button>
    </div>
  ),
}

export const LoadingLike: Story = {
  render: () => (
    <Button disabled>
      <Loader2 className="animate-spin" /> Processing...
    </Button>
  ),
}

export const AsLink: Story = {
  args: {
    variant: 'link',
    children: 'Link button',
  },
}
