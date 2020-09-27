import React from 'react'

export interface Item {
  key: string
  selected ?: boolean
  disabled ?: boolean
  visible ?: boolean
  openSubrows ?: boolean
  [k: string]: any
}

export interface Column {
  id: string
  label: string
  type: string
  filterText?: string
  needle?: (item: Item) => string
  renderCell?: (item: Item, value: any, context: any) => JSX.Element
}

export type SortOrder = 'none' | 'ascending' | 'descending'

export interface Sort {
  column: string
  order: SortOrder
}

export type Labels = {[k in string]? : string}

export interface TableSorterProps {
  animatable?: boolean
  className?: string
  compact?: boolean
  context?: any
  columns: Array<Column>
  highContrast ?: boolean
  initialPage?: number
  id?: string
  items?: Array<Item>
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

declare const TableSorter: React.FC<TableSorterProps>

export default TableSorter
