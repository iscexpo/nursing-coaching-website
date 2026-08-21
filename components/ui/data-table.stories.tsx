import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableTh,
  DataTableTd,
  DataTableCheckbox,
  DataTablePagination,
} from './data-table'
import { StatusBadge } from './status-badge'

type Row = { id: string; name: string; email: string; status: string }

const SAMPLE: Row[] = [
  {
    id: 'STU-001',
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    status: 'active',
  },
  {
    id: 'STU-002',
    name: 'Fatima Khan',
    email: 'fatima@example.com',
    status: 'pending',
  },
  {
    id: 'STU-003',
    name: 'Rahman Ali',
    email: 'rahman@example.com',
    status: 'inactive',
  },
  {
    id: 'STU-004',
    name: 'Sadia Islam',
    email: 'sadia@example.com',
    status: 'active',
  },
]

function TableDemo({
  sortable = false,
  selectable = false,
  showPagination = false,
  sticky = true,
}: {
  sortable?: boolean
  selectable?: boolean
  showPagination?: boolean
  sticky?: boolean
}) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [dir, setDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const handleSort = (col: string) => {
    if (sortCol === col) setDir(dir === 'asc' ? 'desc' : 'asc')
    else {
      setSortCol(col)
      setDir('asc')
    }
  }

  const sorted = [...SAMPLE].sort((a, b) => {
    if (!sortCol) return 0
    const av = (a as Record<string, string>)[sortCol]
    const bv = (b as Record<string, string>)[sortCol]
    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })

  const allSelected = selected.length === SAMPLE.length

  return (
    <div className="w-[720px] max-w-[95vw] space-y-3">
      <DataTable
        header={<span className="text-sm font-semibold">Students</span>}
        onExport={() => alert('export')}
      >
        <DataTableHead sticky={sticky}>
          {selectable && (
            <DataTableCheckbox
              checked={allSelected}
              indeterminate={selected.length > 0 && !allSelected}
              onChange={(c) => setSelected(c ? SAMPLE.map((r) => r.id) : [])}
            />
          )}
          <DataTableTh
            sortable={sortable}
            onSort={() => handleSort('name')}
            sortDirection={sortCol === 'name' ? dir : null}
          >
            Name
          </DataTableTh>
          <DataTableTh
            sortable={sortable}
            onSort={() => handleSort('email')}
            sortDirection={sortCol === 'email' ? dir : null}
          >
            Email
          </DataTableTh>
          <DataTableTh>Status</DataTableTh>
        </DataTableHead>
        <DataTableBody>
          {sorted.map((row) => (
            <DataTableRow key={row.id} selected={selected.includes(row.id)}>
              {selectable && (
                <DataTableCheckbox
                  checked={selected.includes(row.id)}
                  onChange={(c) =>
                    setSelected((prev) =>
                      c
                        ? [...prev, row.id]
                        : prev.filter((id) => id !== row.id),
                    )
                  }
                />
              )}
              <DataTableTd>{row.name}</DataTableTd>
              <DataTableTd>{row.email}</DataTableTd>
              <DataTableTd>
                <StatusBadge status={row.status} size="sm" />
              </DataTableTd>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
      {showPagination && (
        <DataTablePagination
          currentPage={page}
          totalPages={3}
          pageSize={pageSize}
          totalItems={28}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
      {selectable && selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} selected: {selected.join(', ')}
        </p>
      )}
    </div>
  )
}

const meta: Meta<typeof DataTable> = {
  title: 'Design System/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Composable table from `components/ui/data-table.tsx:7` — `DataTable` + `Head/Body/Row/Th/Td/Checkbox/Pagination`. Supports sticky head, sort, selection, pagination, export.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DataTable>

export const Default: Story = {
  render: () => <TableDemo />,
}

export const Sortable: Story = {
  render: () => <TableDemo sortable />,
}

export const Selectable: Story = {
  render: () => <TableDemo selectable />,
}

export const SortableAndSelectable: Story = {
  render: () => <TableDemo sortable selectable />,
}

export const WithPagination: Story = {
  render: () => <TableDemo showPagination />,
}

export const StickyDisabled: Story = {
  render: () => <TableDemo sticky={false} />,
}

export const Empty: Story = {
  render: () => (
    <div className="w-[720px] max-w-[95vw]">
      <DataTable header="Students">
        <DataTableHead>
          <DataTableTh>Name</DataTableTh>
          <DataTableTh>Email</DataTableTh>
        </DataTableHead>
        <DataTableBody>
          <tr>
            <DataTableTd
              className="text-center text-muted-foreground"
              align="center"
            >
              No students found
            </DataTableTd>
          </tr>
        </DataTableBody>
      </DataTable>
    </div>
  ),
}
