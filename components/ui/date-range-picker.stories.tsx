import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { DateRangePicker } from './date-range-picker'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Design System/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Date range selector with presets (7d/30d/90d) from `components/ui/date-range-picker.tsx:23`.',
      },
    },
  },
  argTypes: {
    showPresets: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof DateRangePicker>

export const Default: Story = {
  args: {},
}

export const WithValues: Story = {
  args: {
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    showPresets: true,
    onApply: (s, e) => console.log('apply', s, e),
  },
}

export const WithoutPresets: Story = {
  args: { showPresets: false },
}

export const Interactive: Story = {
  render: function Render() {
    const [start, setStart] = useState('2026-08-01')
    const [end, setEnd] = useState('2026-08-20')
    return (
      <div className="max-w-md">
        <DateRangePicker
          startDate={start}
          endDate={end}
          onStartDateChange={setStart}
          onEndDateChange={setEnd}
          onApply={(s, e) => alert(`Apply ${s} to ${e}`)}
          showPresets
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Selected: {start} → {end}
        </p>
      </div>
    )
  },
}
