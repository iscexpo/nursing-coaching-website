'use client'

import { useState, useMemo, useCallback } from 'react'

interface UseDataTableOptions<T> {
  data: T[]
  defaultSort?: { key: keyof T; direction: 'asc' | 'desc' }
  defaultPageSize?: number
  searchKeys?: (keyof T)[]
  filterFns?: Record<string, (item: T, value: string) => boolean>
}

interface SortState {
  key: string | null
  direction: 'asc' | 'desc'
}

interface UseDataTableReturn<T> {
  sortedData: T[]
  sort: SortState
  setSort: (key: keyof T) => void
  searchValue: string
  setSearchValue: (v: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  clearFilters: () => void
  page: number
  setPage: (p: number) => void
  pageSize: number
  setPageSize: (s: number) => void
  totalPages: number
  totalItems: number
  pagedData: T[]
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  isSelected: (id: string) => boolean
  hasSelection: boolean
}

export function useDataTable<T extends { id: string }>({
  data,
  defaultSort,
  defaultPageSize = 25,
  searchKeys = [],
  filterFns = {},
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [sort, setSortState] = useState<SortState>({
    key: defaultSort ? String(defaultSort.key) : null,
    direction: defaultSort?.direction ?? 'asc',
  })
  const [searchValue, setSearchValue] = useState('')
  const [filters, setFiltersState] = useState<Record<string, string>>({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const setSort = useCallback((key: keyof T) => {
    setSortState((prev) => ({
      key: String(key),
      direction:
        prev.key === String(key) && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }, [])

  const setFilter = useCallback((key: string, value: string) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
    setSearchValue('')
    setPage(1)
  }, [])

  const filteredData = useMemo(() => {
    let result = data

    if (searchValue && searchKeys.length > 0) {
      const q = searchValue.toLowerCase()
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key]
          return val != null && String(val).toLowerCase().includes(q)
        }),
      )
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value && filterFns[key]) {
        result = result.filter((item) => filterFns[key](item, value))
      }
    }

    return result
  }, [data, searchValue, searchKeys, filters, filterFns])

  const sortedData = useMemo(() => {
    if (!sort.key) return filteredData
    const key = sort.key as keyof T
    const dir = sort.direction === 'asc' ? 1 : -1
    return [...filteredData].sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number')
        return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })
  }, [filteredData, sort])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id))
      if (allSelected) return new Set()
      return new Set(ids)
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  )

  return {
    sortedData,
    sort,
    setSort,
    searchValue,
    setSearchValue,
    filters,
    setFilter,
    clearFilters,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems: sortedData.length,
    pagedData,
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedIds.size > 0,
  }
}
