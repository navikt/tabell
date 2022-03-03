export type ItemBase = {[k in string]? : any}

export type ItemErrors = {[k: string] : string | undefined}

export type ColumnAlign = 'left' | 'center' | 'right' | undefined

export interface Item extends ItemBase {
  disabled ?: boolean
  error ?: ItemErrors
  flag?: boolean
  flagIkon ?: any | undefined
  flagLabel ?: string
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
  error?: string | undefined
  setValues: (entries: {[k in string]: any}) => void,
  values: {[k in string]: CustomType}
  onEnter: (entries: {[k in string]: any}) => void
}

export interface RenderOptions<CustomItem, CustomContext, CustomType>{
  item: CustomItem,
  value: CustomType,
  context: CustomContext | undefined
}

export interface Column<CustomItem extends Item = Item, CustomContext extends Context = Context, CustomType = any> {
  align ?: ColumnAlign
  dateFormat?: string
  edit ?: {
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
  error ?: string
  filterText?: string
  id: string
  label: string
  needle?: (item: CustomItem) => string
  render?: (o: RenderOptions<CustomItem, CustomContext, CustomType>) => JSX.Element
  type: string
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
  categories?: Array<Category>
  className?: string
  context?: CustomContext
  columns: Array<Column<CustomItem, CustomContext>>
  coloredSelectedRow ?: boolean
  editable?: boolean
  error?: string | undefined
  flaggable ?: boolean
  flagIkon ?: JSX.Element | string | undefined
  fullWidth ?: boolean
  initialPage?: number
  id?: string
  items?: Array<CustomItem>
  itemsPerPage?: number
  labels?: Labels
  loading?: boolean
  onColumnSort ?: (s: Sort) => void
  onRowClicked ?: (item: CustomItem) => void
  onRowDoubleClicked ?: (item: CustomItem) => void
  onRowsChanged ?: (items: Array<CustomItem>) => void
  onRowSelectChange ?: (items: Array<CustomItem>) => void
  pagination?: boolean
  searchable?: boolean
  selectable?: boolean
  showSelectAll ?: boolean
  size ?: 'medium' | 'small' | undefined
  sortable?: boolean
  sort?: Sort
  striped?: boolean
  summary?: boolean
  subrowsIcon ?: 'arrow' | 'merge'
}

export interface TableHeaderProps<CustomItem, CustomContext> {
  categories?: Array<Category>
  columns: Array<Column<CustomItem, CustomContext>>
  setColumns: (columns: Array<Column<CustomItem, CustomContext>>) => void
  flaggable ?: boolean
  flagIkon ?: JSX.Element | string
  items: Array<CustomItem>
  labels: Labels
  selectable ?: boolean
  searchable ?: boolean
  sortable ?: boolean
  showSelectAll ?: boolean
  id: string
  onColumnSort ?: (s: Sort) => void
  onRowSelectChange ?: (items: Array<CustomItem>) => void
  setItems: (items: Array<CustomItem>) => void
  sort: Sort
  setSort: (s: Sort) => void
}

export interface TableRowProps<CustomItem, CustomContext> {
  beforeRowEdited?: (item: CustomItem, context: CustomContext) => boolean
  index: number
  item: CustomItem
  items: Array<CustomItem>
  columns: Array<Column<CustomItem, CustomContext>>
  context?: CustomContext
  sort: Sort
  labels: Labels
  flaggable: boolean
  id: string
  animatable: boolean
  editable: boolean
  selectable: boolean
  sortable: boolean
  onRowClicked ?: (item: CustomItem) => void
  onRowDoubleClicked ?: (item: CustomItem) => void
  onRowsChanged ?: (items: Array<CustomItem>) => void
  onRowSelectChange ?: (items: Array<CustomItem>) => void
  setItems: (items: Array<CustomItem>) => void
  subrowsIcon ?: 'arrow' | 'merge'
}

export interface TableFooterProps {
  id: string
  itemsPerPage?: number
  labels: Labels
  loading?: boolean
  summary?: boolean
  editable?: boolean
  selectable?: boolean
  pagination?: boolean
  currentPage: number
  setCurrentPage: (page: number) => void
  numberOfSelectedRows: number
  numberOfVisibleItems: number
}

export interface HeaderFilterProps<CustomItem, CustomContext> {
  id: string
  columns: Array<Column<CustomItem, CustomContext>>
  setColumns: (columns: Array<Column<CustomItem, CustomContext>>) => void
}

export interface HeaderCategoriesProps {
  id: string
  categories: Array<Category>
}

export interface AddRowProps<CustomItem, CustomContext> {
  beforeRowAdded?: (colums: Array<Column<CustomItem, CustomContext>>, context: CustomContext) => boolean
  context?: CustomContext
  columns: Array<Column<CustomItem, CustomContext>>
  setColumns: (columns: Array<Column<CustomItem, CustomContext>>) => void
  labels: Labels
  id: string
  items: Array<CustomItem>
  setItems: (items: Array<CustomItem>) => void
  onRowsChanged ?: (items: Array<CustomItem>) => void
}

export interface FirstCellProps<CustomItem> {
  flaggable: boolean
  item: CustomItem
  items: Array<CustomItem>
  labels: Labels
  id: string
  selectable: boolean
  sort: Sort
  subrowsIcon: 'arrow' | 'merge' | undefined
  setItems: (items: Array<CustomItem>) => void
  onRowSelectChange ?: (items: Array<CustomItem>) => void
}

export interface CellProps<CustomItem, CustomContext> {
  column: Column<CustomItem, CustomContext>
  context: CustomContext
  editingRow: CustomItem | undefined
  editable: boolean
  handleEditRowChange: (entries: {[k in string]: any}) => CustomItem
  handleRowDeleted: (item: CustomItem) => void
  saveEditedRow: (editedRow: CustomItem | undefined) => void
  item: CustomItem
  id: string
  labels: Labels
  sortable: boolean
  sort: Sort
  setEditingRow: (c: CustomItem | undefined) => void
}

declare const Table: <
  CustomItem extends Item = Item,
  CustomContext extends Context = Context
>(props: TableProps<CustomItem, CustomContext>) => JSX.Element

export default Table
