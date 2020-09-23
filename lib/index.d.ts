import React from 'react'

export interface Item {
  key: string
  selected ?: boolean
  disabled ?: boolean
  [k: string]: any
}

export type Items = Array<Item>

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
  items?: Items
  itemsPerPage ?: number
  labels?: any
  loading?: boolean
  onColumnSort ?: (s: Sort) => void
  onRowSelectChange ?: (i: Items) => void
  pagination?: boolean
  searchable?: boolean
  selectable?: boolean
  sortable?: boolean
  summary?: boolean
  sort?: Sort
}

declare const TableSorter: React.FC<TableSorterProps>

export default TableSorter
