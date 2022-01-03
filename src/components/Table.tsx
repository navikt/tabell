import {
  AddCircle,
  CollapseFilled,
  Delete,
  Edit, Cancel ,
  ExpandFilled,
  NextFilled
} from '@navikt/ds-icons'
import { BodyLong, Button, Checkbox, Loader, Table } from '@navikt/ds-react'
import classNames from 'classnames'
import Input from 'components/Input'
import { Column, Context, Item, ItemErrors, Labels, Sort, SortOrder, TableProps } from 'index.d'
import _ from 'lodash'
import md5 from 'md5'
import moment from 'moment'
import 'nav-frontend-tabell-style/dist/main.css'
import { FlexCenterDiv, FlexCenterSpacedDiv, FlexStartDiv, HorizontalSeparatorDiv, PaddedDiv } from 'nav-hoykontrast'
import Pagination from 'paginering'
import PT from 'prop-types'
import Tooltip from 'rc-tooltip'
import 'rc-tooltip/assets/bootstrap_white.css'
import React, { useState } from 'react'
import { renderToString } from 'react-dom/server'
import Filter from 'resources/Filter'
import Save from 'resources/Save'
import defaultLabels from './Table.labels'
import { CenterTh, ContentDiv, FilterIcon, LoadingDiv, TableDiv, WideTable } from './TableStyles'

const TableFC = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  allowNewRows = false,
  animatable = true,
  beforeRowAdded = undefined,
  beforeRowEdited = undefined,
  categories,
  className,
  coloredSelectedRow = true,
  columns = [],
  context = {} as CustomContext,
  editable = false,
  error = undefined,
  initialPage = 1,
  id = md5('tabell-' + new Date().getTime()),
  items = [],
  itemsPerPage = 10,
  labels = {},
  loading = false,
  onColumnSort = () => {},
  onRowClicked = () => {},
  onRowsChanged = () => {},
  onRowSelectChange = () => {},
  pagination = true,
  searchable = true,
  selectable = false,
  showSelectAll = true,
  size = 'medium',
  sort = { column: '', order: 'none' },
  sortable = true,
  striped = true,
  summary = false
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
  /** Column data */
  const [_columns, _setColumns] = useState<Array<Column<CustomItem, CustomContext>>>(() => initializeColumns(columns))
  /** Store temp info for rows being edited. We can have multiple rows being edited, thus the hashmap */
  const [_editingRows, _setEditingRows] = useState<{[k in string]: CustomItem}>({})
  /** Row items */
  const [_items, _setItems] = useState<Array<CustomItem>>(() => preProcessItems(items))
  /** show/hide filter */
  const [_seeFilters, _setSeeFilters] = useState<boolean>(false)
  /** Current sort */
  const [_sort, setSort] = useState<Sort>(sort)
  /** State of select all checkbox */
  const [_checkAll, _setCheckAll] = useState<boolean>(false)
  /** Current pagination value */
  const [_currentPage, _setCurrentPage] = useState<number>(initialPage)
  /** Table labels */
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

  /** label handlebars */
  const renderPlaceholders = (template: any, values: any) => {
    template = template.replace(/\{\{([^}]+)\}\}/g, (match: string) => {
      match = match.slice(2, -2)
      return values[match] || '{{' + match + '}}'
    })
    return template
  }

  /** get new rows with a sort change */
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

  /** get class for header sort */
  const sortClass = (column: Column<CustomItem, CustomContext>): string => {
    if (!sortable) { return ''}
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

  /** Applies filters and sorting to rows */
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

  /** Renders the row as a date */
  const renderRowAsDate = (item: CustomItem, column: Column<CustomItem, CustomContext>, error: any, editing: boolean): JSX.Element | null => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
        ? column.edit.render({
            value: _editingRows[item.key][column.id],
            values: _editingRows[item.key],
            error: error?.[column.id],
            context: context,
            setValues: (entries) => handleEditRowChange(entries, item),
            onEnter: (entries) => {
              const editedRow: CustomItem = handleEditRowChange(entries, item)
              saveEditedRow(item, editedRow)
            }
          })
        : (
          <PaddedDiv size='0.25'>
            <Input
            style={{marginTop: '0px'}}
            id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
            className='tabell__edit-input'
            error={error?.[column.id]}
            label='date'
            hideLabel
            placeholder={column.edit?.placeholder}
            value={moment(_editingRows[item.key][column.id]).format('DD.MM.YYYY') ?? ''}
            onEnterPress={(newText: string) => {
              const editedRow: CustomItem = handleEditRowChange({
                [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
              }, item)
              saveEditedRow(item, editedRow)
            }}
            onChanged={(newText: string) => handleEditRowChange({
              [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
            }, item)}
          />
          </PaddedDiv>
          )
    } else {
      return _.isFunction(column.renderCell)
        ? column.renderCell(item, value, context)
        : (
          <BodyLong>
            {column.dateFormat
              ? moment(value).format(column.dateFormat)
              : _.isFunction(value?.toLocaleDateString)
                ? value.toLocaleDateString()
                : value?.toString()}
          </BodyLong>
        )
    }
  }

  /** Renders the row as a object (needs custom render functions) */
  const renderRowAsObject = (item: CustomItem, column: Column<CustomItem, CustomContext>, error: any, editing: boolean): JSX.Element | null => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
        ? column.edit.render({
            value: _editingRows[item.key][column.id],
            values: _editingRows[item.key],
            error: error ? error[column.id] : undefined,
            context: context,
            setValues: (entries) => handleEditRowChange(entries, item),
            onEnter: (entries) => {
              const editedRow: CustomItem = handleEditRowChange(entries, item)
              saveEditedRow(item, editedRow)
            }
          })
        : (<span>You have to set a edit render function for object</span>)
    } else {
      return _.isFunction(column.renderCell)
        ? column.renderCell(item, value, context)
        : <span>You have to set a render function for object</span>
    }
  }

  /** Renders the row buttons */
  const renderButtons = (item: CustomItem, editing: boolean): JSX.Element => {
    if (editing) {
      return (
        <FlexStartDiv className='tabell__buttons'>
          <Button
            title={_labels.saveChanges}
            variant="secondary"
            size="small"
            aria-label={_labels.saveChanges}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              saveEditedRow(item, undefined)
            }}
          >
            <Save/>
          </Button>
          <HorizontalSeparatorDiv size='0.5' />
          <Button
            variant="secondary"
            size="small"
            aria-label={_labels.cancelChanges}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const newEditingRows = _.cloneDeep(_editingRows)
              delete newEditingRows[item.key]
              _setEditingRows(newEditingRows)
            }}
          >
            <Cancel width='24' height='24' title={_labels.cancelChanges} />
          </Button>
        </FlexStartDiv>
      )
    } else {
      return (
        <FlexStartDiv className='tabell__buttons'>
          <Button
            variant="secondary"
            size="small"
            aria-label={_labels.edit}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              _setEditingRows({
                ..._editingRows,
                [item.key]: item
              })
            }}
          >
            <Edit title={_labels.edit} />
          </Button>
          <HorizontalSeparatorDiv size='0.5' />
          <Button
            variant="secondary"
            size="small"
            aria-label={_labels.delete}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const answer = window.confirm(_labels.areYouSure)
              if (answer) {
                handleRowDeleted(item)
              }
            }}
          >
            <Delete title={_labels.delete} />
          </Button>
        </FlexStartDiv>
      )
    }
  }

  /** Renders the row as default string */
  const renderRowAsDefault = (item: CustomItem, column: Column<CustomItem, CustomContext>, error: any, editing: boolean): JSX.Element | null => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
        ? column.edit.render({
            value: _editingRows[item.key][column.id],
            values: _editingRows[item.key],
            error: error ? error[column.id] : undefined,
            context: context,
            setValues: (entries) => handleEditRowChange(entries, item),
            onEnter: (entries) => {
              const editedRow: CustomItem = handleEditRowChange(entries, item)
              saveEditedRow(item, editedRow)
            }
          })
        : (
          <PaddedDiv size='0.25'>
            <Input
            style={{marginTop: '0px'}}
            id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
            className='tabell__edit-input'
            error={error && error[column.id]}
            label=''
            hideLabel
            placeholder={column.edit?.placeholder}
            value={value ?? ''}
            onEnterPress={(newText: string) => {
              const editedRow: CustomItem = handleEditRowChange({ [column.id]: newText }, item)
              saveEditedRow(item, editedRow)
            }}
            onChanged={(newText: string) => handleEditRowChange({[column.id]: newText}, item)}
          />
          </PaddedDiv>
          )
    } else {
      return _.isFunction(column.renderCell)
        ? column.renderCell(item, value, context)
        : (
           <>
            {_labels[column.id] && _labels[column.id]![value]
              ? (
                <Tooltip
                  placement='top'
                  trigger={['hover']}
                  overlay={
                    <BodyLong>{_labels[column.id]![value]}</BodyLong>
                  }
                >
                  <BodyLong>{value}</BodyLong>
                </Tooltip>
                )
              : <BodyLong>{value}</BodyLong>}
           </>
        )
    }
  }

  /** Renders the add row */
  const renderAddRow = () => {
    let addedFocusRef = false
    const currentEditValues = {} as any
    _columns.forEach(c => {
      if (c.edit) {
        currentEditValues[c.id] = c.edit.value
      }
    })

    return (
      <Table.Row className='tabell__edit'>
        <Table.DataCell />
        {_columns.map((column) => {
          if (column.type !== 'buttons') {
            const content: JSX.Element = (
              <Table.DataCell key={column.id}>
                {
                  column.edit?.render
                    ? column.edit.render({
                        value: column.edit.value,
                        error: column.error,
                        values: currentEditValues,
                        context: context,
                        setValues: (entries) => handleNewRowChange(entries),
                        onEnter: (entries) => {
                          const newColumns: Array<Column<CustomItem, CustomContext>> = handleNewRowChange(entries)
                          saveAddedRow(context, newColumns)
                        }
                      })
                    : (
                      <PaddedDiv size='0.25'>
                        <Input
                          style={{marginTop: '0px'}}
                          id={'tabell__edit-' + column.id + '-input-id'}
                          className={'tabell__edit-input ' + (!addedFocusRef ? 'input-focus' : '')}
                          label=''
                          key={'x-' + column.edit?.value ?? ''}
                          placeholder={column.edit?.placeholder}
                          value={column.edit?.value ?? ''}
                          error={column.error}
                          onEnterPress={(e: string) => {
                            const newColumns: Array<Column<CustomItem, CustomContext>> = handleNewRowChange({ [column.id]: e })
                            saveAddedRow(context, newColumns)
                          }}
                          onChanged={(e: string) => handleNewRowChange({ [column.id]: e })}
                        />
                      </PaddedDiv>
                      )
                }
              </Table.DataCell>
            )
            if (!addedFocusRef) {
              addedFocusRef = true
            }
            return content
          } else {
            return (
              <Table.DataCell key={column.id}>
                <Button
                  variant="secondary"
                  style={{marginTop: '5px'}}
                  onClick={(e: any) => {
                    e.preventDefault()
                    e.stopPropagation()
                    saveAddedRow(context, _columns)
                  }}
                >
                  <AddCircle title={_labels.addLabel} />
                </Button>
              </Table.DataCell>
            )
          }
        })}
      </Table.Row>
    )
  }

  /** Render rows */
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
        <Table.Row
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
          <Table.DataCell title={selectable && !item.selectDisabled ? (item.selectLabel ?? 'Velg ' + item.key) : ''}>
            <FlexCenterDiv>
              {item.parentKey && (
                <div style={{ marginRight: '2rem' }}>&nbsp;</div>
              )}
              {selectable && !item.selectDisabled && (
                <Checkbox
                  id={'tabell-' + id + '__row-select-' + item.key}
                  data-test-id={'tabell-' + id + '__row-select-' + item.key}
                  disabled={item.disabled ?? false}
                  hideLabel
                  checked={!!item.selected}
                  onChange={() => onCheckClicked(item)}
                >
                </Checkbox>

              )}
              {item.hasSubrows && (
                <>
                  <HorizontalSeparatorDiv size='0.3'/>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      toggleSubRowOpen(item)
                    }}
                  >
                    {item.openSubrows ? (_sort.order === 'asc' ? <ExpandFilled/> : <CollapseFilled/>) :  <NextFilled/>}
                  </Button>
                  <HorizontalSeparatorDiv size='0.3'/>
                </>
              )}
            </FlexCenterDiv>
          </Table.DataCell>
          {_columns.map((column) => {
            const error = _editingRows ? _editingRows[item.key]?.error : {}
            let content: JSX.Element | null = null

            switch (column.type) {
              case 'date':
                content = renderRowAsDate(item, column, error, editing)
                break
              case 'object':
                content = renderRowAsObject(item, column, error, editing)
                break
              case 'buttons':
                if (editable) {
                  content = renderButtons(item, editing)
                }
                break
              default:
                content = renderRowAsDefault(item, column, error, editing)
                break
            }
            return (
              <Table.DataCell
                key={item.key + '-column-' + column.id}
                className={classNames({
                  'tabell__td--sortert': sortable && _sort.column === column.id
                })}
              >
                {content}
              </Table.DataCell>
            )
          })}
        </Table.Row>
      )
    })
  }

  /** Handle filter text updates */
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

  /** handle any change made to cells in the add row */
  const handleNewRowChange = (entries: {[k in string]: any}): Array<Column<CustomItem, CustomContext>> => {
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
    return newColumns
  }

  /** handle any change made to cells in existing row */
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

  /** Handle request for row deletion */
  const handleRowDeleted = (item: CustomItem) : void => {
    const newItems = _.filter(_items, it => it.key !== item.key)
    setItems(newItems)
    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
  }

  const saveAddedRow = (context: CustomContext, columns: Array<Column<CustomItem, CustomContext>>): void => {
    // first, let's validate
    let allValidated: boolean = true
    let newColumns: Array<Column<CustomItem, CustomContext>> = []

    newColumns = columns.map((column) => {
      let isColumnValid: boolean = true
      let errorMessage: string | undefined = undefined

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
        error: (isColumnValid ? undefined : (errorMessage ?? _labels.error))
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

    const newItem: CustomItem = {} as CustomItem
    newColumns = columns.map(c => {
      let text = c.edit?.value
      if (text && _.isFunction(c.edit?.transform)) {
        text = c.edit?.transform(text)
      }
      _.set(newItem, c.id, text)
      return {
        ...c,
        edit: {
          ...c.edit,
          value: c.edit?.defaultValue
        },
        error: undefined
      }
    })

    newItem.key = md5('' + new Date().getTime())
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

  const saveEditedRow = (item: CustomItem, editedRow: CustomItem | undefined): void => {
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
      newEditingRow.error = errors
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

    delete newEditingRow.error

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

  return (
   <>
      {error && (
        <div role='alert' aria-live='assertive' className='navds-error-message navds-error-message--medium navds-label'>
          {error}
        </div>
      )}
      <TableDiv
        className={classNames({error: error}, className)}
        coloredSelectedRow={coloredSelectedRow}
      >
        <ContentDiv>
          {loading && (
            <LoadingDiv>
              <Loader size='2xlarge' />
            </LoadingDiv>
          )}
          <WideTable size={size} cellSpacing='0' className='tabell tabell__table'>
            <Table.Header>
              {categories && (
                <Table.Row>
                  <Table.HeaderCell role='columnheader' className='noborder' />
                  {categories.map(c => (
                    <CenterTh key={c.label} colSpan={c.colSpan} className={classNames({ noborder: c.border === false })}>
                      {c.label}
                    </CenterTh>
                  ))}
                </Table.Row>
              )}
              <Table.Row className='tabell__header'>
                <Table.HeaderCell style={{ width: 1 }}>
                  <FlexCenterDiv>
                    {/* I am doing like this as I still want to keep the sape reserved for the checkbox */}
                    {selectable && (
                      <div style={{visibility: showSelectAll ? 'inherit' : 'hidden'}}>
                        <Checkbox
                          key={'tabell__checkAll-checkbox-id-' + id + showSelectAll}
                          hideLabel
                          id={'tabell__checkAll-checkbox-id-' + id}
                          className='tabell__checkAll-checkbox'
                          checked={_checkAll}
                          onChange={onCheckAllClicked}
                        >
                          {_labels.selectAll}
                        </Checkbox>
                      </div>
                      )}
                    {searchable && (
                      <FilterIcon
                        role='button'
                        title='Filter'
                        aria-pressed={_seeFilters}
                        className='tabell___seefilters-icon'
                        id='tabell__seefilters-icon-id'
                        onClick={() => _setSeeFilters(!_seeFilters)}>
                        <Filter/>
                      </FilterIcon>)}
                  </FlexCenterDiv>
                </Table.HeaderCell>
                {_columns.map((column) => {
                  const filterText: string = column.filterText ? column.filterText.toLowerCase() : ''
                  return (
                    <Table.HeaderCell
                      role='columnheader'
                      aria-sort={_sort.column === column.id ? ariaSortLabel[_sort.order] : 'none'}
                      key={'th-' + column.id}
                      className={classNames('header', sortClass(column), {buttons: column.type === 'buttons'})}
                    >
                      {sortable && column.label
                        ? (
                          <Button
                            size='small'
                            onClick={(e: any) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleSortColumn(column)
                            }}
                          >
                            {column.label + (filterText ? ' (' + filterText + ')' : '')}
                          </Button>
                          )
                        : column.label + (filterText ? ' (' + filterText + ')' : '')}
                    </Table.HeaderCell>
                  )
                })}
              </Table.Row>
              {_seeFilters && (
                <Table.Row className='tabell__filter'>
                  <Table.DataCell />
                  {_columns.map((column) => {
                    if (column.type !== 'buttons') {
                      return (
                        <Table.DataCell key={column.id}>
                          <PaddedDiv size='0.2'>
                          <Input
                            size='small'
                            style={{marginTop: '0px'}}
                            className='tabell__sort-input'
                            id={'tabell__sort-' + column.id + '-input-id'}
                            label=''
                            value={column.filterText || ''}
                            onEnterPress={(e: string) => handleFilterChange(column, e)}
                            onChanged={(e: string) => handleFilterChange(column, e)}
                          />
                          </PaddedDiv>
                        </Table.DataCell>
                      )
                    }
                    return null
                  })}
                </Table.Row>
              )}
              {editable && allowNewRows && renderAddRow()}
            </Table.Header>
            <Table.Body
              className={classNames({ striped: striped })}
              key={'tbody-' + (pagination ? '-' + _currentPage : '')}
            >
              {tableRows}
            </Table.Body>
          </WideTable>
          <FlexCenterSpacedDiv>
            {summary && !loading
              ? (
                <>
                  {selectable
                    ? (
                      <BodyLong>
                        {nrOfselectedRows === 0
                          ? renderPlaceholders(_labels.noSelectedItems, { type: _labels.type })
                          : renderPlaceholders(_labels.xSelectedItems, {
                            type: _labels.type,
                            x: nrOfselectedRows
                          })}
                      </BodyLong>
                      )
                    : (
                      <div />
                      )}
                  <BodyLong>
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
                  </BodyLong>
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
    </>
  )
}

TableFC.propTypes = {
  animatable: PT.bool,
  className: PT.string,
  categories: PT.object,
  context: PT.object,
  columns: PT.array.isRequired,
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

export default TableFC
