import classNames from 'classnames'
import _ from 'lodash'
import md5 from 'md5'
import moment from 'moment'
import Spinner from 'nav-frontend-spinner'
import { Normaltekst } from 'nav-frontend-typografi'
import NavHighContrast, {
  FlexCenterDiv,
  FlexCenterSpacedDiv,
  FlexStartDiv,
  HighContrastCheckbox,
  HighContrastInput,
  HighContrastKnapp,
  HorizontalSeparatorDiv,
  slideInFromLeft,
  themeKeys
} from 'nav-hoykontrast'
import Pagination from 'paginering'
import PT from 'prop-types'
import Tooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import React, { useCallback, useState } from 'react'
import { renderToString } from 'react-dom/server'
import styled from 'styled-components'
import Input from './components/Input'
import { Column, Context, Item, ItemErrors, Labels, Sort, SortOrder, TableProps } from './index.d'
import Edit from './resources/Edit'
import GreenCircle from './resources/GreenCircle'
import RemoveCircle from './resources/RemoveCircle'
import Tilsette from './resources/Tilsette'
import Trashcan from './resources/Trashcan'
import View from './resources/View'
import defaultLabels from './Table.labels'

export const TableDiv = styled.div`
  display: block !important;
  * {
    font-size: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'} !important;
    line-height: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'} !important;
  }
  tr:not(:hover) div.tabell__buttons {
    visibility: hidden;
  } 
  &.compact {
    td, th {
      padding: 0.35rem !important;
    }
    thead th button {
      white-space: break-spaces !important;
      margin: 0rem !important;
      padding: 0rem 0.2rem !important;
      width: 100% !important;
      color:  ${({ theme }) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]};
    }
  }
  tr.tabell__tr--valgt td {
    background: ${({ theme }) => theme[themeKeys.ALTERNATIVE_HOVER_COLOR]};
  }
  .tabell__edit {
    vertical-align: center;
  }
  thead th.noborder {
     border-bottom: none !important;
  }
  tbody.striped {
    tr:nth-child(odd) {
      background: ${({ theme }) => theme[themeKeys.MAIN_BACKGROUND_COLOR]};
    }
    tr:nth-child(even) {
      background: ${({ theme }) => theme[themeKeys.ALTERNATIVE_BACKGROUND_COLOR]};   
    }
  }
  &__subcell {
    display: flex;
    padding: 0.25rem 0.5rem 0.25rem 0.5rem;
  }
  &___seefilters-icon {
    cursor: pointer;
  }
  &__pagination {
    justify-content: flex-end;
  }
  .header {
    cursor: pointer;
  }
  tr.slideAnimate {
    opacity: 0;
    transform: translateX(-20px);
    animation: ${slideInFromLeft(20)} 0.2s forwards;
  }
  .tabell__tr--disabled td {
    background: ${({ theme }: any) => theme[themeKeys.MAIN_DISABLED_COLOR]} !important;
    color: ${({ theme }: any) => theme[themeKeys.GRAYINACTIVE]} !important;
    * {
      color:  ${({ theme }: any) => theme[themeKeys.GRAYINACTIVE]} !important;
    }
  }
`
export const ContentDiv = styled.div`
  position: relative;
`
export const LoadingDiv = styled.div` 
  position: absolute;
  z-index: 2;
  left: 0;
  right: 0;
  background: rgba(0,0,0,.1);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`
export const WideTable = styled.table`
  width: 100%;
`
const FilterIcon = styled.div`
  margin-left: 0.5rem;
  cursor: pointer;
`
const CenterTh = styled.th`
  text-align: center !important;
`

const Table = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  animatable = true,
  categories,
  className,
  compact = false,
  context = {} as CustomContext,
  columns = [],
  editable = false,
  highContrast = false,
  initialPage = 1,
  id = md5('tabell-' + new Date().getTime()),
  items = [],
  itemsPerPage = 10,
  labels = {},
  loading = false,
  onColumnSort = () => {},
  onRowsChanged = () => {},
  onRowSelectChange = () => {},
  pagination = true,
  searchable = true,
  selectable = false,
  sortable = true,
  striped = true,
  summary = false,
  sort = { column: '', order: '' }
}: TableProps<CustomItem, CustomContext>): JSX.Element => {
  const initializeColumns = (columns: Array<Column<CustomItem, CustomContext>>): Array<Column<CustomItem, CustomContext>> => {
    return columns.map(column => {
      if (column.edit && !_.isNil(column.edit.defaultValue)) {
        column.edit.value = column.edit.defaultValue
      }
      return column
    })
  }

  const preProcessItems = (items: Array<CustomItem>): Array<CustomItem> => {
    const openSubrows = {} as any

    return items.map(item => {
      if (item.hasSubrows) {
        if (!Object.prototype.hasOwnProperty.call(item, 'openSubrows')) {
          item.openSubrows = false
        }
        openSubrows[item.key] = item.openSubrows
      }
      if (!Object.prototype.hasOwnProperty.call(item, 'visible')) {
        if (item.parentKey) {
          item.visible = openSubrows[item.parentKey].openSubrows
        } else {
          item.visible = true
        }
      }
      return item
    })
  }

  const [_columns, _setColumns] = useState<Array<Column<CustomItem, CustomContext>>>(initializeColumns(columns))
  const [_editingRows, _setEditingRows] = useState<{[k in string]: CustomItem}>({})
  const [_items, _setItems] = useState<Array<CustomItem>>(() => preProcessItems(items))
  const [_seeFilters, _setSeeFilters] = useState<boolean>(false)
  const [_sort, setSort] = useState<Sort>(sort)
  const [_checkAll, _setCheckAll] = useState<boolean>(false)
  const [_currentPage, _setCurrentPage] = useState<number>(initialPage)
  const _labels: Labels = { ...defaultLabels, ...labels }

  const sortOrder: SortOrder = {
    '': 'asc',
    asc: 'desc',
    desc: 'asc'
  }

  const ariaSortLabel: any = {
    asc: 'ascending',
    desc: 'descending',
    '': 'none'
  }

  const isBeingEdited = (item: CustomItem) => Object.keys(_editingRows).indexOf(item.key) >= 0

  const setItems = useCallback((items: Array<CustomItem>) => {
    _setItems(preProcessItems(items))
  }, [])

  const renderPlaceholders = (template: any, values: any) => {
    template = template.replace(/\{\{([^}]+)\}\}/g, (match: string) => {
      match = match.slice(2, -2)
      return values[match] || '{{' + match + '}}'
    })
    return template
  }

  const sortColumn = (column: Column<CustomItem, CustomContext>): void => {
    if (!sortable) { return }
    const newSortOrder = sortOrder[_sort.order]
    const newSort = { column: column.id, order: newSortOrder }
    setSort(newSort)
    onColumnSort(newSort)
  }

  const sortClass = (column: Column<CustomItem, CustomContext>): string => {
    if (!sortable) { return '' }
    return _sort.column === column.id ? 'tabell__th--sortert-' + _sort.order : ''
  }

  const onCheckAllClicked = (): void => {
    const newItems: Array<CustomItem> = _items?.map((item: CustomItem) => ({
      ...item,
      selected: item.disabled ? false : !_checkAll
    })) || []

    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
    _setCheckAll(!_checkAll)
    setItems(newItems)
  }

  const toggleSubRowOpen = (changedItem: CustomItem) => {
    const newItems: Array<CustomItem> = _items?.map((item: CustomItem) => {
      if (changedItem.key === item.key) {
        item.openSubrows = !item.openSubrows
      }
      if (changedItem.key === item.parentKey) {
        item.visible = !item.visible
      }
      return item
    }) || []
    setItems(newItems)
  }

  const onCheckClicked = (changedItem: CustomItem) => {
    const newItems: Array<CustomItem> = _items?.map((item: CustomItem) => {
      if (item.key === changedItem.key) {
        item.selected = !item.selected
      }
      if (changedItem.hasSubrows && item.parentKey === changedItem.key) {
        item.selected = changedItem.selected
      }
      return item
    }) || []
    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
    setItems(newItems)
  }

  const rawRows: () => Array<CustomItem> = () => {
    const filteredItems: Array<CustomItem> = _.filter(_items, (item: CustomItem) => {
      return _.every(_columns, (column: Column) => {
        const filterText: string = _.isString(column.filterText) ? column.filterText.toLowerCase() : ''
        let regex, label
        try {
          regex = new RegExp(filterText)
        } catch (e) {
        }
        switch (column.type) {
          case 'date':
            if (column.dateFormat) {
              label = moment(item[column.id]).format(column.dateFormat)
            } else {
              label = item[column.id].toLocaleDateString ? item[column.id].toLocaleDateString() : item[column.id].toString()
            }
            return regex ? label.match(regex) : true
          default: {
            let text: string
            if (column.needle && _.isString(column.needle(item[column.id]))) {
              text = column.needle(item[column.id]).toLowerCase()
            } else {
              if (_.isFunction(column.renderCell)) {
                text = renderToString(column.renderCell(item, item[column.id], context) as JSX.Element).toLowerCase()
              } else {
                text = item[column.id]?.toString()?.toLowerCase() ?? ''
              }
            }
            return regex ? text.match(regex) : true
          }
        }
      })
    })
    if (_sort.order !== '') {
      const sortedItems: Array<CustomItem> = _.orderBy(filteredItems, [_sort.column], [_sort.order])
      return sortedItems
    } else {
      return filteredItems
    }
  }

  const numberOfSelectedRows = (items: Array<CustomItem>): number => {
    const selectedItems = items ? _.filter(items, (item: CustomItem) => item.selected && !item.hasSubrows) : []
    return selectedItems.length
  }

  const numberOfVisibleItems = (items: Array<CustomItem>): number => {
    const visibleItems = items ? _.filter(items, (item: CustomItem) => item.visible && !item.hasSubrows) : []
    return visibleItems.length
  }

  const renderRows = (items: Array<CustomItem>) => {
    return items
      .filter(item => item.visible)
      .filter((item, index) => {
        return pagination
          ? ((_currentPage - 1) * itemsPerPage <= index && index < (_currentPage * itemsPerPage))
          : true
      }).map((item, index) => {
        const editing = isBeingEdited(item)
        return (
          <tr
            key={item.key}
            id={'tabell-' + id + '__row-' + item.key + (editing ? '-edit' : '')}
            aria-selected={selectable && item.selected === true}
            style={{ animationDelay: (0.02 * index) + 's' }}
            className={classNames({
              slideAnimate: animatable,
              tabell__edit: editing,
              'tabell__tr--valgt': selectable && item.selected,
              'tabell__tr--disabled': item.disabled
            })}
          >
            <td>
              <FlexCenterDiv>
                {item.parentKey && (
                  <div style={{ marginRight: '2rem' }}>&nbsp;</div>
                )}
                {selectable && (
                  <HighContrastCheckbox
                    id={'tabell-' + id + '__row-select-checkbox-' + item.key}
                    data-test-id={'tabell-' + id + '__row-select-checkbox-' + item.key}
                    disabled={!_.isNil(item.disabled) ? item.disabled : false}
                    label={'Velg' + item.key}
                    checked={!!item.selected} onChange={() => onCheckClicked(item)}
                  />
                )}
                {item.hasSubrows && (
                  <HighContrastKnapp
                    mini
                    kompakt
                    onClick={(e: any) => {
                      e.stopPropagation()
                      e.preventDefault()
                      toggleSubRowOpen(item)
                    }}
                  >
                    {item.openSubrows ? '▼' : '►'}
                  </HighContrastKnapp>
                )}
              </FlexCenterDiv>
            </td>
            {_columns.map((column) => {
              const value: any = item[column.id]
              const feil = _editingRows ? _editingRows[item.key]?.feil : {}
              let content: JSX.Element | null = null
              switch (column.type) {
                case 'date':
                  if (editing) {
                    content = column.edit?.render
                      ? column.edit.render({
                          value: _editingRows[item.key][column.id],
                          values: _editingRows[item.key],
                          feil: feil ? feil[column.id] : undefined,
                          context: context,
                          setValue: (entries) => handleEditRowChange(entries, item)
                        })
                      : (
                        <Input
                          id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
                          className='tabell__edit-input'
                          feil={feil && feil[column.id]}
                          label=''
                          placeholder={column.edit?.placeholder}
                          value={moment(_editingRows[item.key][column.id]).format('DD.MM.YYYY') ?? ''}
                          onChanged={(newText: string) => handleEditRowChange({
                            [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
                          }, item)}
                        />
                        )
                  } else {
                    content = _.isFunction(column.renderCell)
                      ? column.renderCell(item, value, context)
                      : (
                        <Normaltekst>
                          {column.dateFormat
                            ? moment(value).format(column.dateFormat)
                            : _.isFunction(value.toLocaleDateString)
                              ? value.toLocaleDateString()
                              : value.toString()}
                        </Normaltekst>
                        )
                  }
                  break
                case 'object':
                  if (editing) {
                    content = column.edit?.render
                      ? column.edit.render({
                          value: _editingRows[item.key][column.id],
                          values: _editingRows[item.key],
                          feil: feil ? feil[column.id] : undefined,
                          context: context,
                          setValue: (entries) => handleEditRowChange(entries, item)
                        })
                      : (<span>Ypu have to set a edit render function for object</span>)
                  } else {
                    content = _.isFunction(column.renderCell)
                      ? column.renderCell(item, value, context)
                      : <Normaltekst>JSON.stringify(value)</Normaltekst>
                  }
                  break
                case 'buttons':
                  if (!editable) {
                    break
                  }
                  if (editing) {
                    content = (
                      <FlexStartDiv className='tabell__buttons'>
                        <HighContrastKnapp
                          kompakt
                          aria-label={_labels.confirm}
                          mini
                          onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRowEdited(item)
                          }}
                        >
                          <GreenCircle />
                        </HighContrastKnapp>
                        <HorizontalSeparatorDiv size='0.5' />
                        <HighContrastKnapp
                          kompakt
                          aria-label={_labels.cancel}
                          mini
                          onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const newEditingRows = _.cloneDeep(_editingRows)
                            delete newEditingRows[item.key]
                            _setEditingRows(newEditingRows)
                          }}
                        >
                          <RemoveCircle />
                        </HighContrastKnapp>
                      </FlexStartDiv>
                    )
                  } else {
                    content = (
                      <FlexStartDiv className='tabell__buttons'>
                        <HighContrastKnapp
                          kompakt
                          aria-label={_labels.edit}
                          mini
                          onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.preventDefault()
                            e.stopPropagation()
                            _setEditingRows({
                              ..._editingRows,
                              [item.key]: item
                            })
                          }}
                        >
                          <Edit />
                        </HighContrastKnapp>
                        <HorizontalSeparatorDiv size='0.5' />
                        <HighContrastKnapp
                          kompakt
                          aria-label={_labels.delete}
                          mini
                          onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const answer = window.confirm(_labels.areYouSure)
                            if (answer) {
                              handleRowDeleted(item)
                            }
                          }}
                        >
                          <Trashcan />
                        </HighContrastKnapp>
                      </FlexStartDiv>
                    )
                  }
                  break
                default:
                  if (isBeingEdited(item)) {
                    content = column.edit?.render
                      ? column.edit.render({
                          value: _editingRows[item.key][column.id],
                          values: _editingRows[item.key],
                          feil: feil ? feil[column.id] : undefined,
                          context: context,
                          setValue: (entries) => handleEditRowChange(entries, item)
                        })
                      : (
                        <Input
                          id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
                          className='tabell__edit-input'
                          feil={feil && feil[column.id]}
                          label=''
                          placeholder={column.edit?.placeholder}
                          value={value ?? ''}
                          onChanged={(newText: string) => handleEditRowChange({
                            [column.id]: newText
                          }, item)}
                        />
                        )
                  } else {
                    content = _.isFunction(column.renderCell)
                      ? column.renderCell(item, value, context)
                      : (
                        <Normaltekst>
                          {_labels[column.id] && _labels[column.id]![value]
                            ? (
                              <Tooltip
                                placement='top'
                                trigger={['hover']}
                                overlay={
                                  <span>{_labels[column.id]![value]}</span>
                                }
                              >
                                <span>{value}</span>
                              </Tooltip>
                              )
                            : <span>{value}</span>}
                        </Normaltekst>
                        )
                  }
              }
              return (
                <td
                  key={item.key + '-column-' + column.id}
                  className={classNames({
                    'tabell__td--sortert': sortable && _sort.column === column.id
                  })}
                >
                  {content}
                </td>
              )
            })}
          </tr>
        )
      })
  }

  const handleFilterChange = (_column: Column<CustomItem, CustomContext>, newValue: string): void => {
    _setColumns(_columns.map((column) => {
      return _column.id === column.id
        ? {
            ...column,
            filterText: newValue
          }
        : column
    }))
  }

  const handleNewRowChange = (entries: {[k in string]: any}): void => {
    const keys = Object.keys(entries)
    _setColumns(_columns.map((column) => {
      if (!keys.includes(column.id)) {
        return column
      }
      return {
        ...column,
        edit: {
          ...column.edit,
          value: entries[column.id]
        }
      }
    }))
  }

  const handleEditRowChange = (entries: {[k in string]: any}, item: CustomItem): void => {
    const newEditingRow: CustomItem = _.cloneDeep(_editingRows[item.key])
    Object.keys(entries).forEach((e: string) => {
      // @ts-ignore
      newEditingRow[e] = entries[e]
    })
    _setEditingRows({
      ..._editingRows,
      [item.key]: newEditingRow
    })
  }

  const handleRowDeleted = (item: CustomItem) : void => {
    const newItems = _.filter(_items, it => it.key !== item.key)
    setItems(newItems)
    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
  }

  const handleRowAdded = (context: CustomContext): void => {
    // first, let's validate
    let allValidated: boolean = true
    let newColumns: Array<Column<CustomItem, CustomContext>> = []

    newColumns = _columns.map((column) => {
      let isColumnValid: boolean = true
      let errorMessage: string | undefined

      column.edit?.validation?.forEach(v => {
        let valueToValidate = column.edit?.value
        if (_.isNil(valueToValidate)) {
          valueToValidate = ''
        }

        if (typeof valueToValidate === 'number') {
          valueToValidate = '' + valueToValidate
        }

        let mandatory: boolean = true
        if (!_.isNil(v.mandatory)) {
          if (_.isFunction(v.mandatory)) {
            mandatory = v.mandatory(context)
          } else {
            mandatory = v.mandatory
          }
        }

        if (mandatory) {
          let isThisValid: boolean = false
          if (typeof v.test === 'string') {
            isThisValid = valueToValidate.match(v.test) !== null
          }
          if (typeof v.test === 'function') {
            isThisValid = v.test(valueToValidate)
          }
          isColumnValid = isColumnValid && isThisValid
          if (!isThisValid && _.isNil(errorMessage)) {
            errorMessage = v.message
          }
        }
      })

      allValidated = allValidated && isColumnValid

      return {
        ...column,
        error: (isColumnValid ? undefined : (errorMessage ?? _labels.error))
      }
    })

    if (!allValidated) {
      _setColumns(newColumns)
      return
    }

    const newItem: any = {}
    newColumns = _columns.map(c => {
      let text = c.edit?.value
      if (text && _.isFunction(c.edit?.transform)) {
        text = c.edit?.transform(text)
      }
      newItem[c.id] = text
      return {
        ...c,
        edit: {
          ...c.edit,
          value: c.edit?.defaultValue
        },
        error: undefined
      }
    })

    newItem.key = +md5('' + new Date().getTime())
    newItem.selected = false
    newItem.disabled = false
    newItem.visible = true
    newItem.openSubrows = false

    _setColumns(newColumns)

    const newItems = _.cloneDeep(_items)
    newItems.unshift(newItem as CustomItem)
    setItems(newItems)
    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
  }

  const handleRowEdited = (item: CustomItem): void => {
    let allValidated: boolean = true
    const errors: ItemErrors = {}
    const newEditingRow: CustomItem = _.cloneDeep(_editingRows[item.key])

    _columns.forEach((column) => {
      let isColumnValid: boolean = true
      let errorMessage: string | undefined

      column.edit?.validation?.forEach(v => {
        let valueToValidate = newEditingRow[column.id]

        if (_.isNil(valueToValidate)) {
          valueToValidate = ''
        }
        if (typeof valueToValidate === 'number') {
          valueToValidate = '' + valueToValidate
        }
        let mandatory: boolean = true
        if (!_.isNil(v.mandatory)) {
          if (_.isFunction(v.mandatory)) {
            mandatory = v.mandatory(context)
          } else {
            mandatory = v.mandatory
          }
        }

        if (mandatory) {
          let isThisValid: boolean = false
          if (typeof v.test === 'string') {
            isThisValid = valueToValidate.match(v.test) !== null
          }
          if (typeof v.test === 'function') {
            isThisValid = v.test(valueToValidate)
          }
          isColumnValid = isColumnValid && isThisValid
          if (!isThisValid && _.isNil(errorMessage)) {
            errorMessage = v.message
          }
        }
      })

      allValidated = allValidated && isColumnValid

      if (!isColumnValid) {
        errors[column.id] = errorMessage ?? _labels.error
      }
    })

    if (!allValidated) {
      newEditingRow.feil = errors
      _setEditingRows({
        ..._editingRows,
        [item.key]: newEditingRow
      })
      return
    }

    delete newEditingRow.feil

    const newEditedTransformedRow: CustomItem = _.cloneDeep(newEditingRow)
    _columns.forEach((column) => {
      let text = newEditedTransformedRow[column.id]
      if (text && _.isFunction(column.edit?.transform)) {
        text = column.edit?.transform(text)
        // @ts-ignore
        newEditedTransformedRow[column.id] = text
      }
    })

    const newItems = _items.map(_item => {
      if (_item.key === item.key) {
        return newEditedTransformedRow
      }
      return _item
    })

    setItems(newItems)

    const newEditingRows = _.cloneDeep(_editingRows)
    delete newEditingRows[item.key]
    _setEditingRows(newEditingRows)

    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
  }

  const sortedItems = rawRows()
  const nrOfselectedRows = numberOfSelectedRows(sortedItems)
  const nrOfVisibleItems = numberOfVisibleItems(sortedItems)
  const tableRows = renderRows(sortedItems)
  const currentEditValues = {} as any

  if (editable) {
    _columns.forEach(c => {
      if (c.edit) {
        currentEditValues[c.id] = c.edit.value
      }
    })
  }

  return (
    <NavHighContrast highContrast={highContrast}>
      <TableDiv
        className={classNames('tabell', { compact: compact }, className)}
      >
        <ContentDiv>
          {loading && (
            <LoadingDiv>
              <Spinner type='XL' />
            </LoadingDiv>
          )}
          <WideTable cellSpacing='0' className='tabell__table'>
            <thead>
              {categories && (
                <tr>
                  <th role='columnheader' className='noborder' />
                  {categories.map(c => (
                    <CenterTh key={c.label} colSpan={c.colSpan} className={classNames({ noborder: c.border === false })}>
                      {c.label}
                    </CenterTh>
                  ))}
                </tr>
              )}
              <tr className='tabell__header'>
                <th style={{ width: 1 }}>
                  <FlexCenterDiv>
                    {selectable && (
                      <HighContrastCheckbox
                        label={_labels.selectAll}
                        id={'tabell__checkAll-checkbox-id-' + id}
                        className='tabell__checkAll-checkbox'
                        checked={_checkAll}
                        onChange={onCheckAllClicked}
                      />
                    )}
                    {searchable && (
                      <FilterIcon role='button' aria-pressed={_seeFilters}>
                        <View
                          className='tabell___seefilters-icon'
                          id='tabell__seefilters-icon-id'
                          onClick={() => _setSeeFilters(!_seeFilters)}
                        />
                      </FilterIcon>)}
                  </FlexCenterDiv>
                </th>
                {_columns.map((column) => {
                  const filterText: string = column.filterText ? column.filterText.toLowerCase() : ''
                  return (
                    <th
                      role='columnheader'
                      aria-sort={_sort.column === column.id ? ariaSortLabel[_sort.order] : 'none'}
                      key={'th-' + column.id}
                      className={classNames('header', sortClass(column))}
                    >
                      {sortable && column.label
                        ? (
                          <button
                            onClick={(e: any) => {
                              e.preventDefault()
                              e.stopPropagation()
                              sortColumn(column)
                            }}
                          >
                            {column.label + (filterText ? ' (' + filterText + ')' : '')}
                          </button>
                          )
                        : column.label + (filterText ? ' (' + filterText + ')' : '')}
                    </th>
                  )
                })}
              </tr>
              {_seeFilters && (
                <tr className='tabell__filter'>
                  <td />
                  {_columns.map((column) => {
                    if (column.type !== 'buttons') {
                      return (
                        <td key={column.id}>
                          <HighContrastInput
                            className='tabell__sort-input'
                            id={'tabell__sort-' + column.id + '-input-id'}
                            label=''
                            value={column.filterText || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(column, e.target.value)}
                          />
                        </td>
                      )
                    }
                    return null
                  })}
                </tr>
              )}
              {editable && (
                <tr className='tabell__edit'>
                  <td />
                  {_columns.map((column) => {
                    if (column.type !== 'buttons') {
                      return (
                        <td key={column.id}>
                          {
                            column.edit?.render
                              ? column.edit.render({
                                  value: column.edit.value,
                                  feil: column.error,
                                  values: currentEditValues,
                                  context: context,
                                  setValue: handleNewRowChange
                                })
                              : (
                                <Input
                                  id={'tabell__edit-' + column.id + '-input-id'}
                                  className='tabell__edit-input'
                                  label=''
                                  placeholder={column.edit?.placeholder}
                                  value={column.edit?.value ?? ''}
                                  feil={column.error}
                                  onChanged={(e: string) => handleNewRowChange({
                                    [column.id]: e
                                  })}
                                />
                                )
                          }
                        </td>
                      )
                    } else {
                      return (
                        <td key={column.id}>
                          <HighContrastKnapp
                            kompakt
                            mini
                            onClick={(e: any) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleRowAdded(context)
                            }}
                          >
                            <Tilsette title={_labels.addLabel} />
                          </HighContrastKnapp>
                        </td>
                      )
                    }
                  })}
                </tr>
              )}
            </thead>
            <tbody
              className={classNames({ striped: striped })}
            >
              {tableRows}
            </tbody>
          </WideTable>
          <FlexCenterSpacedDiv>
            {summary && !loading
              ? (
                <>
                  {selectable
                    ? (
                      <Normaltekst>
                        {nrOfselectedRows === 0
                          ? renderPlaceholders(_labels.noSelectedItems, { type: _labels.type })
                          : renderPlaceholders(_labels.xSelectedItems, {
                            type: _labels.type,
                            x: nrOfselectedRows
                          })}
                      </Normaltekst>
                      )
                    : (
                      <div />
                      )}
                  <Normaltekst>
                    {nrOfVisibleItems === 0
                      ? renderPlaceholders(_labels.showNoItems, { type: _labels.type })
                      : renderPlaceholders(_labels.showXofYItems, {
                        type: _labels.type,
                        x: (((_currentPage - 1) * itemsPerPage + 1) + '-' +
                        (_currentPage * itemsPerPage > nrOfVisibleItems
                          ? nrOfVisibleItems
                          : _currentPage * itemsPerPage)),
                        y: nrOfVisibleItems
                      })}
                  </Normaltekst>
                </>
                )
              : (
                <>
                  <div />
                  <div />
                </>
                )}
            {pagination && !loading
              ? (
                <Pagination
                  highContrast={highContrast}
                  itemsPerPage={itemsPerPage}
                  currentPage={_currentPage}
                  numberOfItems={sortedItems.length}
                  onChange={(page) => _setCurrentPage(page)}
                />
                )
              : (
                <div />
                )}
          </FlexCenterSpacedDiv>
        </ContentDiv>
      </TableDiv>
    </NavHighContrast>
  )
}

Table.propTypes = {
  animatable: PT.bool,
  className: PT.string,
  categories: PT.object,
  context: PT.object,
  columns: PT.array.isRequired,
  highContrast: PT.bool,
  initialPage: PT.number,
  items: PT.array,
  itemsPerPage: PT.number,
  labels: PT.any,
  loading: PT.bool,
  onColumnSort: PT.func,
  onRowSelectChange: PT.func,
  pagination: PT.bool,
  searchable: PT.bool,
  selectable: PT.bool,
  sortable: PT.bool,
  striped: PT.bool,
  summary: PT.bool,
  sort: PT.oneOf<Sort>([])
}

export default Table
