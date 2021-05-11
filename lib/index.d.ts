export interface Item {
  key: string
  selected ?: boolean
  disabled ?: boolean
  visible ?: boolean
  openSubrows ?: boolean
  [k: string]: any
}

export interface Category {
  colSpan: number
  label: string
  border ?: boolean
}

export interface Context {}

export interface RenderEditableOptions<CustomContext extends Context = Context, CustomType = any> {
  context: CustomContext
  value?: CustomType
  feil?: string
  setValue: (entries: {[k in string]: any}) => void,
  values: {[k in string]: any}
}

export interface Column<CustomItem extends Item = Item, CustomContext extends Context = Context, CustomType = any> {
  id: string
  label: string
  type: string
  edit?: {
    render?: (o: RenderEditableOptions<CustomContext>) => JSX.Element
    transform?: (s: CustomType) => CustomType
    validation?: Array<{
      mandatory?: boolean | ((c: CustomContext) => boolean)
      message: string,
      pattern: string
    }>,
    placeholder?: string
    defaultValue?: CustomType
    value?: CustomType
  },
  error ?: string
  filterText?: string
  needle?: (item: CustomItem) => string
  dateFormat?: string
  renderCell?: (item: CustomItem, value: any, context: CustomContext | undefined) => JSX.Element

}

export type SortOrder = 'none' | 'ascending' | 'descending'

export interface Sort {
  column: string
  order: SortOrder
}

export type Labels = {[k in string]? : string}

export interface TableSorterProps <CustomItem extends Item = Item, CustomContext extends Context = Context> {
  animatable?: boolean
  className?: string
  categories?: Array<Category>
  compact?: boolean
  context?: CustomContext
  columns: Array<Column<CustomItem, CustomContext>>
  editable?: boolean
  highContrast ?: boolean
  initialPage?: number
  id?: string
  items?: Array<CustomItem>
  itemsPerPage ?: number
  labels?: any
  loading?: boolean
  onColumnSort ?: (s: Sort) => void
  onRowAdded ?: (ci: CustomItem, c: CustomContext) => void
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
  CustomContext extends Context = Context
>(props: TableSorterProps<CustomItem, CustomContext>) => JSX.Element

export default TableSorter
