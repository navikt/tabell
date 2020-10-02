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

export interface Column<CustomItem extends Item = Item, CustomContent extends Context = Context> {
  id: string
  label: string
  type: string
  filterText?: string
  needle?: (item: CustomItem) => string
  dateFormat?: string
  renderCell?: (item: CustomItem, value: any, context: CustomContent) => JSX.Element
}

export type SortOrder = 'none' | 'ascending' | 'descending'

export interface Sort {
  column: string
  order: SortOrder
}

export type Labels = {[k in string]? : string}

export interface TableSorterProps <CustomItem extends Item = Item, CustomContent extends Context = Context> {
  animatable?: boolean
  className?: string
  compact?: boolean
  context?: C
  columns: Array<Column<CustomItem, CustomContent>>
  highContrast ?: boolean
  initialPage?: number
  id?: string
  items?: Array<CustomItem>
  itemsPerPage ?: number
  labels?: any
  loading?: boolean
  onColumnSort ?: (s: Sort) => void
  onRowSelectChange ?: (i: Array<CustomItem>) => void
  pagination?: boolean
  searchable?: boolean
  selectable?: boolean
  sortable?: boolean
  striped?: boolean
  summary?: boolean
  sort?: Sort
}

declare const TableSorter: <
  CustomItem extends Item = Item,
  CustomContent extends Context = Context
>(props: TableSorterProps<CustomItem, CustomContent>) => JSX.Element

export default TableSorter
