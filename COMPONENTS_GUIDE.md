# ISC Expo - UI Components Guide

This guide documents all available UI components for use in the ISC Expo LMS admin dashboard.

---

## Form Components

### FormField
**File:** `components/ui/form-field.tsx`

Wraps form inputs with label, error message, and help text.

```tsx
import { FormField } from '@/components/ui/form-field'

<FormField
  label="Email Address"
  error={errors.email}
  helpText="We'll never share your email"
  required
>
  <input type="email" />
</FormField>
```

**Props:**
- `label?: string` - Field label
- `error?: string` - Error message
- `helpText?: string` - Help text below field
- `required?: boolean` - Show red asterisk
- `children: React.ReactNode` - Form control
- `className?: string` - Additional classes

---

### ConfirmDialog
**File:** `components/ui/confirm-dialog.tsx`

Modal dialog for confirming actions with loading state.

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const [isOpen, setIsOpen] = useState(false)

<ConfirmDialog
  isOpen={isOpen}
  title="Delete Course?"
  description="This action cannot be undone."
  confirmText="Delete"
  variant="destructive"
  onConfirm={async () => {
    await deleteCourse(id)
    setIsOpen(false)
  }}
  onCancel={() => setIsOpen(false)}
/>
```

**Props:**
- `isOpen: boolean` - Show/hide dialog
- `title: string` - Dialog title
- `description?: string` - Additional text
- `confirmText?: string` - Confirm button label
- `cancelText?: string` - Cancel button label
- `variant?: 'default' | 'destructive'` - Button style
- `isLoading?: boolean` - Loading state
- `onConfirm: () => void | Promise<void>` - Confirm handler
- `onCancel: () => void` - Cancel handler

---

### Alert
**File:** `components/ui/alert.tsx`

Colored alert banner with dismiss button.

```tsx
import { Alert } from '@/components/ui/alert'

<Alert
  variant="error"
  title="Payment Failed"
  message="Unable to process payment. Please try again."
  dismissible
/>
```

**Props:**
- `message: string` - Alert message
- `title?: string` - Alert title
- `variant?: 'error' | 'warning' | 'success' | 'info'` - Alert type
- `dismissible?: boolean` - Show X button
- `onDismiss?: () => void` - Dismiss handler
- `className?: string` - Additional classes

---

## Data Display Components

### StatusBadge
**File:** `components/ui/status-badge.tsx`

Colored badge for status display with icons.

```tsx
import { StatusBadge, EnrollmentStatusBadge } from '@/components/ui/status-badge'

// Generic usage
<StatusBadge status="active" />
<StatusBadge status="pending" size="sm" />

// Specialized usage
<EnrollmentStatusBadge status="approved" />
<PaymentStatusBadge status="verified" />
<ExamStatusBadge status="draft" />
```

**Props:**
- `status: string` - Status value
- `customLabel?: string` - Override status label
- `showIcon?: boolean` - Show icon (default true)
- `size?: 'sm' | 'md'` - Badge size
- `className?: string` - Additional classes

**Status Types:**
- `pending`, `approved`, `rejected`, `active`, `inactive`
- `completed`, `failed`, `warning`, `draft`, `published`

---

### DataTable with Enhanced Features
**File:** `components/ui/data-table.tsx`

Advanced table component with sorting, filtering, pagination.

```tsx
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableTh,
  DataTableTd,
  DataTableCheckbox,
  DataTablePagination,
} from '@/components/ui/data-table'

const [sortColumn, setSortColumn] = useState<string | null>(null)
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
const [page, setPage] = useState(1)
const [pageSize, setPageSize] = useState(10)

<DataTable
  header="Students"
  onExport={handleExport}
>
  <DataTableHead sticky>
    <DataTableCheckbox
      checked={allSelected}
      onChange={handleSelectAll}
    />
    <DataTableTh
      sortable
      onSort={() => handleSort('name')}
      sortDirection={sortColumn === 'name' ? sortDir : null}
    >
      Name
    </DataTableTh>
    <DataTableTh>Email</DataTableTh>
  </DataTableHead>
  <DataTableBody>
    {students.map((student) => (
      <DataTableRow key={student.id} selected={selected.includes(student.id)}>
        <DataTableCheckbox
          checked={selected.includes(student.id)}
          onChange={(c) => handleSelectRow(student.id, c)}
        />
        <DataTableTd>{student.name}</DataTableTd>
        <DataTableTd>{student.email}</DataTableTd>
      </DataTableRow>
    ))}
  </DataTableBody>
</DataTable>

<DataTablePagination
  currentPage={page}
  totalPages={Math.ceil(total / pageSize)}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

---

## Filter & Search Components

### FilterBar
**File:** `components/ui/filter-bar.tsx`

Search bar with filter controls.

```tsx
import { FilterBar } from '@/components/ui/filter-bar'

const [search, setSearch] = useState('')
const [statusFilter, setStatusFilter] = useState('')

<FilterBar
  searchPlaceholder="Search by name, email, ID..."
  searchValue={search}
  onSearchChange={setSearch}
  filters={[
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ]}
  onClearFilters={() => {
    setSearch('')
    setStatusFilter('')
  }}
/>
```

**Props:**
- `searchPlaceholder?: string` - Search input placeholder
- `searchValue?: string` - Current search value
- `onSearchChange?: (value: string) => void` - Search handler
- `filters?: Array<FilterConfig>` - Filter definitions
- `onClearFilters?: () => void` - Clear handler
- `className?: string` - Additional classes

---

### BulkActions
**File:** `components/ui/bulk-actions.tsx`

Toolbar showing bulk action buttons for selected items.

```tsx
import { BulkActions } from '@/components/ui/bulk-actions'

<BulkActions
  selectedCount={selected.length}
  totalCount={students.length}
  actions={[
    {
      id: 'approve',
      label: 'Approve',
      icon: CheckCircle,
      onClick: async (ids) => {
        await approveEnrollments(ids)
      },
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: XCircle,
      onClick: async (ids) => {
        await rejectEnrollments(ids)
      },
    },
  ]}
  onSelectAll={(all) => {
    if (all) selectAll()
    else clearSelection()
  }}
/>
```

---

## Calendar & Date Components

### CalendarView
**File:** `components/ui/calendar-view.tsx`

Monthly calendar with attendance color coding.

```tsx
import { CalendarView } from '@/components/ui/calendar-view'

const attendanceData = {
  '2026-07-01': 'present',
  '2026-07-02': 'absent',
  '2026-07-03': 'late',
}

<CalendarView
  attendanceData={attendanceData}
  onDateClick={(date) => markAttendance(date)}
  onMonthChange={(month, year) => fetchAttendance(month, year)}
/>
```

**Props:**
- `attendanceData?: Record<string, 'present' | 'absent' | 'late'>` - Attendance records
- `onDateClick?: (date: string) => void` - Date click handler
- `onMonthChange?: (month: number, year: number) => void` - Month change handler
- `isLoading?: boolean` - Loading state
- `className?: string` - Additional classes

---

### DateRangePicker
**File:** `components/ui/date-range-picker.tsx`

Date range selector with presets.

```tsx
import { DateRangePicker } from '@/components/ui/date-range-picker'

const [startDate, setStartDate] = useState('')
const [endDate, setEndDate] = useState('')

<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  onApply={(start, end) => fetchReports(start, end)}
  showPresets
/>
```

**Props:**
- `startDate?: string` - Start date (YYYY-MM-DD)
- `endDate?: string` - End date (YYYY-MM-DD)
- `onStartDateChange?: (date: string) => void` - Start date handler
- `onEndDateChange?: (date: string) => void` - End date handler
- `onApply?: (start: string, end: string) => void` - Apply handler
- `showPresets?: boolean` - Show 7d/30d/90d presets
- `className?: string` - Additional classes

---

## Chart & Report Components

### ChartCard
**File:** `components/ui/chart-card.tsx`

Card wrapper for chart components with loading/empty states.

```tsx
import { ChartCard } from '@/components/ui/chart-card'

<ChartCard
  title="Revenue Trend"
  description="Last 30 days"
  isLoading={isLoading}
  isEmpty={data.length === 0}
  error={error}
>
  <LineChart data={data}>
    {/* Recharts content */}
  </LineChart>
</ChartCard>
```

**Props:**
- `title?: string` - Card title
- `description?: string` - Subtitle
- `isLoading?: boolean` - Loading state
- `isEmpty?: boolean` - Empty state
- `error?: Error | null` - Error state
- `children: React.ReactNode` - Chart content
- `className?: string` - Additional classes

---

## Print Components

### PaymentReceipt
**File:** `components/payment-receipt.tsx`

Printable payment receipt with QR code.

```tsx
import { PaymentReceipt } from '@/components/payment-receipt'

<PaymentReceipt
  receiptNumber="RCP-2026-001"
  date={new Date().toISOString()}
  amount={5000}
  method="bKash"
  studentName="Ahmed Hassan"
  studentId="STU-001"
  courseName="B.Sc Nursing"
  invoiceId="INV-001"
  transactionId="TXN-2026-001"
  notes="Payment received successfully"
  onPrint={() => window.print()}
/>
```

---

## Modal Components

### StudentProfileModal
**File:** `app/admin/components/student-profile-modal.tsx`

Quick-view modal for student details.

```tsx
import { StudentProfileModal } from '@/app/admin/components/student-profile-modal'

const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

<StudentProfileModal
  student={selectedStudent}
  isOpen={!!selectedStudent}
  onClose={() => setSelectedStudent(null)}
/>
```

---

## Error Handling

### ErrorBoundary
**File:** `components/error-boundary.tsx`

React error boundary component with retry UI.

```tsx
import { ErrorBoundary } from '@/components/error-boundary'

<ErrorBoundary
  onError={(error, errorInfo) => {
    console.error('Component error:', error, errorInfo)
  }}
>
  <SomeComponent />
</ErrorBoundary>
```

**Props:**
- `children: React.ReactNode` - Children to protect
- `fallback?: (error: Error, retry: () => void) => React.ReactNode` - Custom error UI
- `onError?: (error: Error, errorInfo: ErrorInfo) => void` - Error handler

---

## Utility Functions

### CSV Export
**File:** `lib/csv-export.ts`

```tsx
import { exportToCSV, arrayToCSV } from '@/lib/csv-export'

// Export data with custom columns
exportToCSV(
  students,
  [
    { key: 'name', label: 'Student Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'status', label: 'Status', formatter: (v) => v.toUpperCase() },
  ],
  'students.csv'
)

// Or manually create CSV
const csv = arrayToCSV(students, columns)
downloadCSV(csv, 'students.csv')
```

---

## Loading Skeletons
**File:** `components/ui/skeleton.tsx`

```tsx
import { 
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  DashboardSkeleton 
} from '@/components/ui/skeleton'

// Generic skeleton
<Skeleton className="h-8 w-32" />

// Table loading
<TableSkeleton rows={10} />

// Cards
<CardSkeleton />
<StatCardSkeleton />

// Full dashboard
<DashboardSkeleton />
```

---

## Best Practices

1. **Use ErrorBoundary** on all admin tab panels to gracefully handle component errors
2. **Wrap tables with Suspense** + `TableSkeleton` for loading states
3. **Always show loading states** for async operations
4. **Use StatusBadge** for status displays (consistency)
5. **Use FilterBar** + pagination for large lists
6. **Use ConfirmDialog** before destructive actions
7. **Use BulkActions** for batch operations
8. **Keep forms with FormField** for consistent styling

---

**Last Updated:** July 22, 2026  
**Version:** 1.0
