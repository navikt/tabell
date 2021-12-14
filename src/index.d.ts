
export type ItemBase = {[k in string]? : any}

export type ItemErrors = {[k: string] : string | undefined}

export interface Item extends ItemBase {
  disabled ?: boolean
  feil ?: ItemErrors
  key: string
  parentKey ?: string
  openSubrows ?: boolean
  selected ?: boolean
  selectDisabled ?: boolean
  selectLabel ?: string
  sortKey ?: string
  visible ?: boolean
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
      test: string | ((value: any) => boolean)
    }>,
    placeholder?: string
    defaultValue?: CustomType
    value?: CustomType
  },
  feil ?: string
  filterText?: string
  needle?: (item: CustomItem) => string
  dateFormat?: string
  renderCell?: (item: CustomItem, value: any, context: CustomContext | undefined) => JSX.Element

}

export type Order = 'none' | 'asc' | 'desc'

export type SortOrder = {[k: string]: Order}

export interface Sort {
  column: string
  order: Order
}

export type Labels = {[k in string]? : string}

export interface TableProps <CustomItem extends Item = Item, CustomContext extends Context = Context> {
  allowNewRows?: boolean,
  animatable?: boolean
  beforeRowAdded?: (colums: Array<Column<CustomItem, CustomContext>>, context: CustomContext) => boolean
  beforeRowEdited?: (item: CustomItem, context: CustomContext) => boolean
  className?: string
  categories?: Array<Category>
  compact?: boolean
  context?: CustomContext
  columns: Array<Column<CustomItem, CustomContext>>
  coloredSelectedRow ?: boolean
  editable?: boolean
  error?: string | undefined
  highContrast?: boolean
  initialPage?: number
  id?: string
  items?: Array<CustomItem>
  itemsPerPage?: number
  labels?: Labels
  loading?: boolean
  onColumnSort ?: (s: Sort) => void
  onRowClicked ?: (item: CustomItem) => void
  onRowsChanged ?: (items: Array<CustomItem>) => void
  onRowSelectChange ?: (items: Array<CustomItem>) => void
  pagination?: boolean
  searchable?: boolean
  selectable?: boolean
  showSelectAll ?: boolean
  sortable?: boolean
  striped?: boolean
  summary?: boolean
  sort?: Sort
}

declare const Table: <
  CustomItem extends Item = Item,
  CustomContext extends Context = Context
>(props: TableProps<CustomItem, CustomContext>) => JSX.Element

export default Table
