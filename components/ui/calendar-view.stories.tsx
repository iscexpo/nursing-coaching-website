import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CalendarView } from './calendar-view'

const meta: Meta<typeof CalendarView> = {
  title: 'Design System/CalendarView',
  component: CalendarView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Monthly calendar with attendance color-coding from `components/ui/calendar-view.tsx:15`. Click date to mark, legend at bottom.',
      },
    },
  },
  argTypes: {
    isLoading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof CalendarView>

export const Default: Story = {
  args: {},
}

export const WithAttendance: Story = {
  args: {
    attendanceData: {
      '2026-07-01': 'present',
      '2026-07-02': 'absent',
      '2026-07-03': 'late',
      '2026-07-04': 'present',
      '2026-07-05': 'present',
      '2026-07-10': 'absent',
    },
    onDateClick: (d) => console.log('date', d),
    onMonthChange: (m, y) => console.log('month', m, y),
  },
}

export const Loading: Story = {
  args: { isLoading: true },
}

export const Interactive: Story = {
  render: function Render() {
    const data: Record<string, 'present' | 'absent' | 'late'> = {
      '2026-08-01': 'present',
      '2026-08-02': 'present',
      '2026-08-03': 'late',
      '2026-08-05': 'absent',
      '2026-08-10': 'present',
    }
    return (
      <CalendarView
        attendanceData={data}
        onDateClick={(d) => alert(`Mark ${d}`)}
        onMonthChange={(m, y) => console.log(m, y)}
      />
    )
  },
}
