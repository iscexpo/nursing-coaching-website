import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { FilterBar } from './filter-bar'

const meta: Meta<typeof FilterBar> = {
  title: 'Design System/FilterBar',
  component: FilterBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Search + filter controls from `components/ui/filter-bar.tsx:27`. Used in admin lists with `onClearFilters`.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof FilterBar>

export const Default: Story = {
  render: function Render() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    return (
      <FilterBar
        searchPlaceholder="Search by name, email, ID..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            value: status,
            onChange: setStatus,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'pending', label: 'Pending' },
            ],
          },
        ]}
        onClearFilters={() => {
          setSearch('')
          setStatus('')
        }}
      />
    )
  },
}

export const MultipleFilters: Story = {
  render: function Render() {
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [category, setCategory] = useState('')
    const [date, setDate] = useState('')
    return (
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            value: status,
            onChange: setStatus,
            options: [
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
            ],
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            value: category,
            onChange: setCategory,
            options: [
              { value: 'icon', label: 'Icon' },
              { value: 'isc', label: 'ISC' },
            ],
          },
          {
            name: 'date',
            label: 'Date',
            type: 'date',
            value: date,
            onChange: setDate,
          },
        ]}
        onClearFilters={() => {
          setSearch('')
          setStatus('')
          setCategory('')
          setDate('')
        }}
      />
    )
  },
}

export const NoSearch: Story = {
  render: function Render() {
    const [status, setStatus] = useState('active')
    return (
      <FilterBar
        filters={[
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            value: status,
            onChange: setStatus,
            options: [
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ],
          },
        ]}
        onClearFilters={() => setStatus('')}
      />
    )
  },
}

export const EmptyState: Story = {
  render: () => <FilterBar searchPlaceholder="Search..." />,
}
