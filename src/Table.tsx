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
  HorizontalSeparatorDiv
} from 'nav-hoykontrast'
import Pagination from 'paginering'
import PT from 'prop-types'
import Tooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import React, { useState } from 'react'
import { renderToString } from 'react-dom/server'
import Input from './components/Input'
import { Column, Context, Item, ItemErrors, Labels, Sort, SortOrder, TableProps } from './index.d'
import Edit from './resources/Edit'
import GreenCircle from './resources/GreenCircle'
import RemoveCircle from './resources/RemoveCircle'
import Tilsette from './resources/Tilsette'
import Trashcan from './resources/Trashcan'
import View from './resources/View'
import defaultLabels from './Table.labels'
import { CenterTh, ContentDiv, FilterIcon, LoadingDiv, TableDiv, WideTable } from './TableStyles'

const Table = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  allowNewRows = false,
  animatable = true,
  beforeRowAdded = undefined,
  beforeRowEdited = undefined,
  categories,
  className,
  coloredSelectedRow = true,
  compact = false,
  context = {} as CustomContext,
  columns = [],
  editable = false,
  error = undefined,
  highContrast = false,
  initialPage = 1,
  id = md5('tabell-' + new Date().getTime()),
  items = [],
  itemsPerPage = 10,
  labels = {},
  loading = false,
  onColumnSort = () => {},
  onRowClicked,
  onRowsChanged = () => {},
  onRowSelectChange = () => {},
  pagination = true,
  searchable = true,
  selectable = false,
  sortable = true,
  striped = true,
  summary = false,
  sort = { column: '', order: 'none' }
}: TableProps<CustomItem, CustomContext>): JSX.Element => {
  /** fill out default values to current values for editing columns */
  const initializeColumns = (columns: Array<Column<CustomItem, CustomContext>>): Array<Column<CustomItem, CustomContext>> => {
    return columns.map(column => {
      if (column.edit && !_.isNil(column.edit.defaultValue)) {
        column.edit.value = column.edit.defaultValue
      }
      return column
    })
  }

  /** fill out openSubrows and visible values if they are not in item */
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
  /** Table column data */
  const [_columns, _setColumns] = useState<Array<Column<CustomItem, CustomContext>>>(() => initializeColumns(columns))
  /** Store temporary row editing data. We can have multiple rows being edited */
  const [_editingRows, _setEditingRows] = useState<{[k in string]: CustomItem}>({})
  /** Table items */
  const [_items, _setItems] = useState<Array<CustomItem>>(() => preProcessItems(items))
  /** show/hide filter */
  const [_seeFilters, _setSeeFilters] = useState<boolean>(false)
  /** Current sort */
  const [_sort, setSort] = useState<Sort>(sort)
  /** State of select all checkbox */
  const [_checkAll, _setCheckAll] = useState<boolean>(false)
  /** Current pagination value */
  const [_currentPage, _setCurrentPage] = useState<number>(initialPage)
  const _labels: Labels = { ...defaultLabels, ...labels }

  const animationDelay = 0.01
  /** order on which sort switches over */
  const sortOrder: SortOrder = {
    none: 'asc',
    asc: 'desc',
    desc: 'asc'
  }

  const ariaSortLabel: any = {
    asc: 'ascending',
    desc: 'descending',
    none: 'none'
  }

  /** check if row is being edited */
  const isBeingEdited = (item: CustomItem) => Object.keys(_editingRows).indexOf(item.key) >= 0

  /** make sure we always preprocess the changed items */
  const setItems = (items: Array<CustomItem>) => {
    _setItems(preProcessItems(items))
  }

  /** handlebars */
  const renderPlaceholders = (template: any, values: any) => {
    template = template.replace(/\{\{([^}]+)\}\}/g, (match: string) => {
      match = match.slice(2, -2)
      return values[match] || '{{' + match + '}}'
    })
    return template
  }

  const handleSortColumn = (column: Column<CustomItem, CustomContext>): void => {
    if (!sortable) { return }
    const newSortOrder = sortOrder[_sort.order]
    const newSort = { column: column.id, order: newSortOrder }

    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(rawRows(newSort)[0])
    }
    if (_.isFunction(onColumnSort)) {
      onColumnSort(newSort)
    }
    setSort(newSort)
  }

  const sortClass = (column: Column<CustomItem, CustomContext>): string => {
    if (!sortable) { return '' }
    return _sort.column === column.id ? 'tabell__th--sortert-' + _sort.order : ''
  }

  /** selects all items */
  const onCheckAllClicked = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newItems: Array<CustomItem> = _items?.map((item: CustomItem) => ({
      ...item,
      selected: item.disabled ? false : e.target.checked
    })) || []

    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
    _setCheckAll(e.target.checked)
    setItems(newItems)
  }

  /** selects one item */
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

  /** toggle visibility on rows that are from a subrow */
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

  /** generates a string from the cell, rendering its contents, for filtering or sorting */
  const getStringFromCellFor = (column: Column<CustomItem, CustomContext>, item: CustomItem, _for: 'filter' | 'sort') => {
    let haystack: string = ''
    switch (column.type) {
      case 'date':
        if (_for === 'filter') {
          if (column.dateFormat) {
            haystack = moment(item[column.id]).format(column.dateFormat)
          } else {
            haystack = !_.isNil(item[column.id])
              ? item[column.id].toLocaleDateString ? item[column.id].toLocaleDateString() : item[column.id].toString()
              : ''
          }
        }
        if (_for === 'sort') {
          haystack = !_.isNil(item[column.id])
            ? item[column.id].getTime ? '' + moment(item[column.id]).format('YYYYMMDD') : item[column.id].toString()
            : ''
        }
        break
      default: {
        if (_.isFunction(column.needle) && _.isString(column.needle(item[column.id]))) {
          haystack = column.needle(item[column.id]).toLowerCase()
        } else {
          if (_.isFunction(column.renderCell)) {
            haystack = renderToString(column.renderCell(item, item[column.id], context) as JSX.Element).toLowerCase()
          } else {
            haystack = item[column.id]?.toString()?.toLowerCase() ?? ''
          }
        }
        break
      }
    }
    return haystack
  }

  /** Apllies filters and sorting to rows */
  const rawRows = (sort: Sort): [Array<CustomItem>, number, number] => {
    let numberOfSelectedRows = 0
    let numberOfVisibleItems = 0

    const filteredItems: Array<CustomItem> = _.filter(_items, (item: CustomItem) => {
      if (item.selected && !item.hasSubrows) {
        numberOfSelectedRows++
      }
      if (item.visible && !item.hasSubrows) {
        numberOfVisibleItems++
      }
      return _.every(_columns, (column: Column) => {
        const filterText: string = _.isString(column.filterText) ? column.filterText.toLowerCase() : ''
        let needle
        try {
          needle = new RegExp(filterText)
        } catch (e) {}
        const haystack = getStringFromCellFor(column, item, 'filter')
        return needle ? haystack?.match(needle) : true
      })
    })

    let finalItems: Array<CustomItem> = filteredItems
    if (sort.order === 'asc' || sort.order === 'desc') {
      const sortColumn: Column<CustomItem, CustomContext> | undefined = _.find(_columns, _c => _c.id === sort.column)
      if (!_.isUndefined(sortColumn)) {
        filteredItems.forEach((item, index) => {
          const sortKey = getStringFromCellFor(sortColumn!, item, 'sort')
          filteredItems[index].sortKey = sortKey
          if (item.parentKey) {
            const parentItem = _.find(filteredItems, _i => _i.key === item.parentKey)
            if (parentItem) {
              const parentSortKey = getStringFromCellFor(sortColumn!, parentItem, 'sort')
              filteredItems[index].sortKey = parentSortKey + '__' + sortKey
            }
          }
        })
      }
      finalItems = filteredItems.sort((a: CustomItem, b: CustomItem) =>
        sort.order === 'asc' ? a.sortKey!.localeCompare(b.sortKey!) : b.sortKey!.localeCompare(a.sortKey!)
      )
    }
    return [finalItems, numberOfSelectedRows, numberOfVisibleItems]
  }

  const renderRowAsDate = (item: CustomItem, column: Column<CustomItem, CustomContext>, feil: any, editing: boolean): JSX.Element | null => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
        ? column.edit.render({
            value: _editingRows[item.key][column.id],
            values: _editingRows[item.key],
            feil: feil?.[column.id],
            context: context,
            setValue: (entries) => handleEditRowChange(entries, item)
          })
        : (
          <Input
            id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
            className='tabell__edit-input'
            feil={feil?.[column.id]}
            label=''
            placeholder={column.edit?.placeholder}
            value={moment(_editingRows[item.key][column.id]).format('DD.MM.YYYY') ?? ''}
            onEnterPress={(newText: string) => {
              const editedRow: CustomItem = handleEditRowChange({
                [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
              }, item)
              handleRowEdited(item, editedRow)
            }}
            onChanged={(newText: string) => handleEditRowChange({
              [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
            }, item)}
          />
          )
    } else {
      return _.isFunction(column.renderCell)
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
  }

  const renderRowAsObject = (item: CustomItem, column: Column<CustomItem, CustomContext>, feil: any, editing: boolean): JSX.Element | null => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
        ? column.edit.render({
            value: _editingRows[item.key][column.id],
            values: _editingRows[item.key],
            feil: feil ? feil[column.id] : undefined,
            context: context,
            setValue: (entries) => handleEditRowChange(entries, item)
          })
        : (<span>Ypu have to set a edit render function for object</span>)
    } else {
      return _.isFunction(column.renderCell)
        ? column.renderCell(item, value, context)
        : <Normaltekst>JSON.stringify(value)</Normaltekst>
    }
  }

  const renderButtons = (item: CustomItem, editing: boolean): JSX.Element => {
    if (editing) {
      return (
        <FlexStartDiv className='tabell__buttons'>
          <HighContrastKnapp
            kompakt
            aria-label={_labels.saveChanges}
            mini
            onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.preventDefault()
              e.stopPropagation()
              handleRowEdited(item, undefined)
            }}
          >
            <GreenCircle title={_labels.saveChanges} />
          </HighContrastKnapp>
          <HorizontalSeparatorDiv size='0.5' />
          <HighContrastKnapp
            kompakt
            aria-label={_labels.cancelChanges}
            mini
            onClick={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.preventDefault()
              e.stopPropagation()
              const newEditingRows = _.cloneDeep(_editingRows)
              delete newEditingRows[item.key]
              _setEditingRows(newEditingRows)
            }}
          >
            <RemoveCircle title={_labels.cancelChanges} />
          </HighContrastKnapp>
        </FlexStartDiv>
      )
    } else {
      return (
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
            <Edit title={_labels.edit} />
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
            <Trashcan title={_labels.delete} />
          </HighContrastKnapp>
        </FlexStartDiv>
      )
    }
  }

  const renderRowAsDefault = (item: CustomItem, column: Column<CustomItem, CustomContext>, feil: any, editing: boolean): JSX.Element | null => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
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
            onEnterPress={(newText: string) => {
              const editedRow: CustomItem = handleEditRowChange({ [column.id]: newText }, item)
              handleRowEdited(item, editedRow)
            }}
            onChanged={(newText: string) => handleEditRowChange({
              [column.id]: newText
            }, item)}
          />
          )
    } else {
      return _.isFunction(column.renderCell)
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

  const renderAddRow = () => {
    let addedFocusRef = false
    return (
      <tr
        className='tabell__edit' onKeyPress={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            handleRowAdded(context)
          }
        }}
      >
        <td />
        {_columns.map((column) => {
          if (column.type !== 'buttons') {
            const content: JSX.Element = (
              <td key={column.id}>
                {
                  column.edit?.render
                    ? column.edit.render({
                        value: column.edit.value,
                        feil: column.feil,
                        values: currentEditValues,
                        context: context,
                        setValue: handleNewRowChange
                      })
                    : (
                      <Input
                        id={'tabell__edit-' + column.id + '-input-id'}
                        className={'tabell__edit-input ' + (!addedFocusRef ? 'input-focus' : '')}
                        label=''
                        key={'x-' + column.edit?.value ?? ''}
                        placeholder={column.edit?.placeholder}
                        value={column.edit?.value ?? ''}
                        feil={column.feil}
                        onEnterPress={(e: string) => {
                          handleNewRowChange({ [column.id]: e })
                          handleRowAdded(context)
                        }}
                        onChanged={(e: string) => handleNewRowChange({ [column.id]: e })}
                      />
                      )
                }
              </td>
            )
            if (!addedFocusRef) {
              addedFocusRef = true
            }
            return content
          } else {
            return (
              <td key={column.id}>
                <HighContrastKnapp
                  kompakt
                  mini
                  label={_labels.addLabel}
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
    )
  }

  const renderRows = (items: Array<CustomItem>): Array<JSX.Element> => {
    const visibleItems = items.filter((item) => !!item.visible)
    const pageItems = visibleItems.filter((item, index) => {
      return pagination
        ? ((_currentPage - 1) * itemsPerPage <= index && index < (_currentPage * itemsPerPage))
        : true
    })

    return pageItems.map((item, index) => {
      const editing = isBeingEdited(item)
      return (
        <tr
          key={item.key + '_sort' + _sort.column + '_' + _sort.order}
          id={'tabell-' + id + '__row-' + item.key + (editing ? '-edit' : '')}
          aria-selected={selectable && item.selected === true}
          style={{ animationDelay: (animationDelay * index) + 's' }}
          onClick={() => _.isFunction(onRowClicked) ? onRowClicked(item) : {}}
          className={classNames({
            slideAnimate: animatable,
            tabell__edit: editing,
            clickable: _.isFunction(onRowClicked),
            'tabell__tr--valgt': selectable && item.selected,
            'tabell__tr--disabled': item.disabled
          })}
        >
          <td title={selectable && !item.selectDisabled ? (item.selectLabel ?? 'Velg ' + item.key) : ''}>
            <FlexCenterDiv>
              {item.parentKey && (
                <div style={{ marginRight: '2rem' }}>&nbsp;</div>
              )}
              {selectable && !item.selectDisabled && (
                <HighContrastCheckbox
                  id={'tabell-' + id + '__row-select-' + item.key}
                  data-test-id={'tabell-' + id + '__row-select-' + item.key}
                  disabled={!_.isNil(item.disabled) ? item.disabled : false}
                  label={item.key}
                  checked={!!item.selected}
                  onChange={() => onCheckClicked(item)}
                />
              )}
              {item.hasSubrows && (
                <HighContrastKnapp
                  mini
                  kompakt
                  onClick={(e: React.ChangeEvent<HTMLButtonElement>) => {
                    e.stopPropagation()
                    e.preventDefault()
                    toggleSubRowOpen(item)
                  }}
                >
                  {item.openSubrows ? (_sort.order === 'asc' ? '▼' : '▲') : '►'}
                </HighContrastKnapp>
              )}
            </FlexCenterDiv>
          </td>
          {_columns.map((column) => {
            const feil = _editingRows ? _editingRows[item.key]?.feil : {}
            let content: JSX.Element | null = null

            switch (column.type) {
              case 'date':
                content = renderRowAsDate(item, column, feil, editing)
                break
              case 'object':
                content = renderRowAsObject(item, column, feil, editing)
                break
              case 'buttons':
                if (!editable) {
                  break
                }
                content = renderButtons(item, editing)
                break
              default:
                content = renderRowAsDefault(item, column, feil, editing)
                break
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
    const newColumns = _columns.map((column) => {
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
    })
    _setColumns(newColumns)
  }

  const handleEditRowChange = (entries: {[k in string]: any}, item: CustomItem): CustomItem => {
    const newEditingRow: CustomItem = _.cloneDeep(_editingRows[item.key])
    Object.keys(entries).forEach((e: string) => {
      // @ts-ignore
      newEditingRow[e] = entries[e]
    })
    _setEditingRows({
      ..._editingRows,
      [item.key]: newEditingRow
    })
    return newEditingRow
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

        let willValidate: boolean = true
        if (!_.isNil(v.mandatory)) {
          if (_.isFunction(v.mandatory)) {
            willValidate = v.mandatory(context)
          } else {
            willValidate = v.mandatory
          }
        }
        // dates maybe are not mandatory, but sure can be invalid
        if ((column.type === 'date') && valueToValidate.length > 0) {
          willValidate = true
        }
        if (willValidate) {
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
        feil: (isColumnValid ? undefined : (errorMessage ?? _labels.error))
      }
    })

    if (!allValidated) {
      _setColumns(newColumns)
      return
    }

    if (_.isFunction(beforeRowAdded)) {
      const isValid: boolean = beforeRowAdded(newColumns, context)
      if (!isValid) {
        _setColumns(newColumns)
        return
      }
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
        feil: undefined
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
    setTimeout(() => {
      (document?.querySelector('.input-focus input') as HTMLElement)?.focus()
    }, 100)
  }

  const handleRowEdited = (item: CustomItem, editedRow: CustomItem | undefined): void => {
    let allValidated: boolean = true
    const errors: ItemErrors = {}
    // if we have the row edit changes, use them, or else, get from state.
    // we need this so we can to change and save in two steps; we cannot rely that useState syncs
    const newEditingRow: CustomItem = !_.isUndefined(editedRow) ? editedRow : _.cloneDeep(_editingRows[item.key])

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

        let willValidate: boolean = true
        if (!_.isNil(v.mandatory)) {
          if (_.isFunction(v.mandatory)) {
            willValidate = v.mandatory(context)
          } else {
            willValidate = v.mandatory
          }
        }
        // dates maybe are not mandatory, but sure can be invalid
        if ((column.type === 'date') && valueToValidate.length > 0) {
          willValidate = true
        }

        if (willValidate) {
          let isThisValid: boolean = false
          if (typeof v.test === 'string') {
            if (column.type === 'date') {
              isThisValid = _.isDate(valueToValidate)
            } else {
              isThisValid = valueToValidate.match(v.test) !== null
            }
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

    if (_.isFunction(beforeRowEdited)) {
      const isValid: boolean = beforeRowEdited(newEditingRow, context)
      if (!isValid) {
        _setEditingRows({
          ..._editingRows,
          [item.key]: newEditingRow
        })
        return
      }
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

  const [sortedItems, nrOfselectedRows, nrOfVisibleItems] = rawRows(_sort)
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
      {error && (
        <label className='skjemaelement__feilmelding'>
          <Normaltekst className='typo-feilmelding'>{error}</Normaltekst>
        </label>
      )}
      <TableDiv
        className={classNames('tabell', { compact: compact, error: error}, className)}
        coloredSelectedRow={coloredSelectedRow}
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
                              handleSortColumn(column)
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
              {editable && allowNewRows && renderAddRow()}
            </thead>
            <tbody
              className={classNames({ striped: striped })}
              key={'tbody-' + (pagination ? '-' + _currentPage : '')}
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
  sort: PT.shape({
    column: PT.string,
    order: PT.oneOf(['', 'asc', 'desc'])
  })
}

export default Table
