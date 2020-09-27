import React from 'react'

export interface Item {
  key: string
  selected ?: boolean
  disabled ?: boolean
  visible ?: boolean
  openSubrows ?: boolean
  [k: string]: any
}

export interface Context {}

export interface Column<T, C> {
  id: string
  label: string
  type: string
  filterText?: string
  needle?: (item: T) => string
  renderCell?: (item: T, value: any, context: C) => JSX.Element
}

export type SortOrder = 'none' | 'ascending' | 'descending'

export interface Sort {
  column: string
  order: SortOrder
}

export type Labels = {[k in string]? : string}

export interface TableSorterProps<T, C> {
  animatable?: boolean
  className?: string
  compact?: boolean
  context?: C
  columns: Array<Column<T, C>>
  highContrast ?: boolean
  initialPage?: number
  id?: string
  items?: Array<T>
  itemsPerPage ?: number
  labels?: any
  loading?: boolean
  onColumnSort ?: (s: Sort) => void
  onRowSelectChange ?: (i: Items) => void
  pagination?: boolean
  searchable?: boolean
  selectable?: boolean
  sortable?: boolean
  striped?: boolean
  summary?: boolean
  sort?: Sort
}

declare const TableSorter: <T, C>(props: TableSorterProps<T, C>) => JSX.Element

export default TableSorter
