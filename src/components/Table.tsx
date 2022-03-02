import { Loader, Table } from '@navikt/ds-react'
import classNames from 'classnames'
import { Column, Context, Item, Labels, Sort, TableProps } from 'index.d'
import _ from 'lodash'
import md5 from 'md5'
import moment from 'moment'
import 'nav-frontend-tabell-style/dist/main.css'
import PT from 'prop-types'
import React, { useState } from 'react'
import { renderToString } from 'react-dom/server'
import AddRow from './AddRow'
import Footer from './Footer'
import Header from './Header'
import Row from './Row'
import { ContentDiv, LoadingDiv, TableDiv, WideTable } from './Styles'
import defaultLabels from './Table.labels'

const TableFC = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  allowNewRows = false,
  animatable = true,
  beforeRowAdded = undefined,
  beforeRowEdited = undefined,
  categories = undefined,
  className = undefined,
  coloredSelectedRow = true,
  columns = [],
  context = {} as CustomContext,
  editable = false,
  error = undefined,
  flaggable = false,
  flagIkon = undefined,
  fullWidth = true,
  initialPage = 1,
  id = md5('tabell-' + new Date().getTime()),
  items = [],
  itemsPerPage = 10,
  labels = {},
  loading = false,
  onColumnSort = undefined,
  onRowClicked = undefined,
  onRowDoubleClicked = undefined,
  onRowsChanged = undefined,
  onRowSelectChange = undefined,
  pagination = true,
  searchable = true,
  selectable = false,
  showSelectAll = true,
  size = 'medium',
  sort = { column: '', order: 'none' },
  sortable = true,
  subrowsIcon = 'arrow',
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
  /** Row items */
  const [_items, _setItems] = useState<Array<CustomItem>>(() => preProcessItems(items))
  /** Current sort */
  const [_sort, setSort] = useState<Sort>(sort)
  /** Current pagination value */
  const [_currentPage, _setCurrentPage] = useState<number>(initialPage)
  /** Table labels */
  const _labels: Labels = { ...defaultLabels, ...labels }

  /** make sure we always preprocess the changed items */
  const setItems = (items: Array<CustomItem>) => {
    _setItems(preProcessItems(items))
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

  let sortedItems: Array<CustomItem> = filteredItems
  if (_sort.order === 'asc' || _sort.order === 'desc') {
    const sortColumn: Column<CustomItem, CustomContext> | undefined = _.find(_columns, _c => _c.id === _sort.column)
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
    sortedItems = filteredItems.sort((a: CustomItem, b: CustomItem) =>
      _sort.order === 'asc' ? a.sortKey!.localeCompare(b.sortKey!) : b.sortKey!.localeCompare(a.sortKey!)
    )
  }

  const visibleItems = sortedItems.filter((item) => !!item.visible)
  const pageItems = visibleItems.filter((item, index) => {
    return pagination
      ? ((_currentPage - 1) * itemsPerPage <= index && index < (_currentPage * itemsPerPage))
      : true
  })

  return (
   <>
      {error && (
        <div role='alert' aria-live='assertive' className='navds-error-message navds-error-message--medium navds-label'>
          {error}
        </div>
      )}
      <TableDiv
        className={classNames(className, {error})}
        coloredSelectedRow={coloredSelectedRow}
      >
        <ContentDiv style={{width: fullWidth ? '100%' : 'fit-content'}}>
          {loading && (
            <LoadingDiv>
              <Loader size='2xlarge' />
            </LoadingDiv>
          )}
          <WideTable
            id={id}
            size={size}
            cellSpacing='0'
            width={fullWidth ? '100%' : 'fit-content'}
            className='tabell tabell__table'
          >
            <Header<CustomItem, CustomContext>
              categories={categories}
              columns={_columns}
              flaggable={flaggable}
              flagIkon={flagIkon}
              id={id + '-Header'}
              items={_items}
              labels={_labels}
              onRowSelectChange={onRowSelectChange}
              searchable={searchable}
              selectable={selectable}
              setColumns={_setColumns}
              setSort={setSort}
              setItems={setItems}
              showSelectAll={showSelectAll}
              sort={_sort}
              sortable={sortable}
              onColumnSort={onColumnSort}
            />
            <Table.Body
              className={classNames({ striped })}
            >
              {editable && allowNewRows && (
                <AddRow
                  id={id + '-AddRow'}
                  beforeRowAdded={beforeRowAdded}
                  columns={_columns}
                  setColumns={_setColumns}
                  context={context}
                  labels={_labels}
                  items={_items}
                  setItems={setItems}
                  onRowsChanged={onRowsChanged}
                />
              )}
              {pageItems.map((item, index) => (
                <Row
                  item={item}
                  items={items}
                  index={index}
                  context={context}
                  columns={_columns}
                  sort={_sort}
                  labels={_labels}
                  flaggable={flaggable}
                  editable={editable}
                  sortable={sortable}
                  animatable={animatable}
                  id={id + '-Row-' + item.key}
                  key={id + '-Row-' + item.key + '-key'}
                  selectable={selectable}
                  onRowClicked={onRowClicked}
                  onRowDoubleClicked={onRowDoubleClicked}
                  onRowsChanged={onRowsChanged}
                  onRowSelectChange={onRowSelectChange}
                  setItems={setItems}
                  subrowsIcon={subrowsIcon}
                  beforeRowEdited={beforeRowEdited}
                />
              ))}
            </Table.Body>
          </WideTable>
          <Footer
            id={id + '-Footer'}
            summary={summary}
            loading={loading}
            selectable={selectable}
            pagination={pagination}
            labels={_labels}
            itemsPerPage={itemsPerPage}
            currentPage={_currentPage}
            setCurrentPage={_setCurrentPage}
            numberOfSelectedRows={numberOfSelectedRows}
            numberOfVisibleItems={numberOfVisibleItems}
          />
        </ContentDiv>
      </TableDiv>
    </>
  )
}

TableFC.propTypes = {
  animatable: PT.bool,
  className: PT.string,
  categories: PT.array,
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
