import { Loader, Table } from '@navikt/ds-react'
import classNames from 'classnames'
import { TextFilters, Column, Context, Item, Labels, Sort, TableProps } from 'index.d'
import _ from 'lodash'
import md5 from 'md5'
import moment from 'moment'
import 'nav-frontend-tabell-style/dist/main.css'
import PT from 'prop-types'
import React, { useEffect, useState } from 'react'
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
  showHeader = true,
  showSelectAll = true,
  skipItemUpdates = false,
  size = 'medium',
  sort = { column: '', order: 'none' },
  sortable = true,
  subrowsIcon = 'arrow',
  striped = true,
  summary = false
}: TableProps<CustomItem, CustomContext>): JSX.Element => {

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
  /** Row items */
  const [_items, _setItems] = useState<Array<CustomItem>>(() => preProcessItems(items))
  /** Current sort */
  const [_sort, setSort] = useState<Sort>(sort)
  /** Current pagination value */
  const [_currentPage, _setCurrentPage] = useState<number>(initialPage)
  /** Table labels */
  const _labels: Labels = { ...defaultLabels, ...labels }
  /** Column filters */
  const [_filter, setFilter] = useState<TextFilters>({})
  /** Store temp info for rows being edited. We can have multiple rows being edited, thus the hashmap */
  const [_editingRows, _setEditingRows] = useState<{[k in string]: CustomItem}>({})

  const setEditingRow = (item: CustomItem) => {
    _setEditingRows({
      ..._editingRows,
      [item.key]: item
    })
  }

  const resetEditingRow = (key: string) => {
    const editingRows = _.cloneDeep(_editingRows)
    delete editingRows[key]
    _setEditingRows(editingRows)
  }

  /** make sure we always preprocess the changed items */
  const setItems = (items: Array<CustomItem>) => {
    _setItems(preProcessItems(items))
  }

  /** generates a string from the cell contents, for filtering or sorting */
  const getStringFromCellFor = (column: Column<CustomItem, CustomContext>, item: CustomItem, _for: 'filter' | 'sort') => {
    let cellAsString: string = ''
    switch (column.type) {
      case 'date':
        if (_for === 'filter') {
          if (column.dateFormat) {
            cellAsString = moment(item[column.id]).format(column.dateFormat)
          } else {
            cellAsString = !_.isNil(item[column.id])
              ? item[column.id].toLocaleDateString
                ? item[column.id].toLocaleDateString()
                : item[column.id].toString()
              : ''
          }
        }
        if (_for === 'sort') {
          cellAsString = !_.isNil(item[column.id])
            ? item[column.id].getTime
              ? '' + moment(item[column.id]).format('YYYYMMDD')
              : item[column.id].toString()
            : ''
        }
        break
      default: {
        if (_.isFunction(column.needle) && _.isString(column.needle(item[column.id]))) {
          cellAsString = column.needle(item[column.id]).toLowerCase()
        } else {
          if (_.isFunction(column.render)) {
            cellAsString = renderToString(column.render({
              item,
              value: item[column.id],
              context
            }) as JSX.Element).toLowerCase()
          } else {
            cellAsString = item[column.id]?.toString()?.toLowerCase() ?? ''
          }
        }
        break
      }
    }
    return cellAsString
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

    return _.every(columns, (column: Column) => {
      const filter: string = _.isString(_filter[column.id]) ? _filter[column.id].toLowerCase() : ''
      let needle
      try {
        needle = new RegExp(filter)
      } catch (e) {}
      const haystack = getStringFromCellFor(column, item, 'filter')
      return needle ? haystack?.match(needle) : true
    })
  })

  let sortedItems: Array<CustomItem> = filteredItems
  if (_sort.order === 'asc' || _sort.order === 'desc') {
    const sortColumn: Column<CustomItem, CustomContext, any> | undefined = _.find(columns, _c => _c.id === _sort.column)
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

  useEffect(() => {
    if (!skipItemUpdates) {
      setItems(items)
    }
  }, [skipItemUpdates, items])

  return (
    <TableDiv
      style={{width: fullWidth ? '100%' : 'fit-content'}}
      className={classNames(className, {error})}
      coloredSelectedRow={coloredSelectedRow}
    >
      {error && (
        <div role='alert' aria-live='assertive' className='navds-error-message navds-error-message--medium navds-label'>
          {error}
        </div>
      )}
      <ContentDiv>
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
          {showHeader && (
            <Header<CustomItem, CustomContext>
              categories={categories}
              columns={columns}
              flaggable={flaggable}
              flagIkon={flagIkon}
              filter={_filter}
              setFilter={setFilter}
              id={id + '-Header'}
              items={_items}
              labels={_labels}
              onRowSelectChange={onRowSelectChange}
              searchable={searchable}
              selectable={selectable}
              setSort={setSort}
              setItems={setItems}
              showSelectAll={showSelectAll}
              sort={_sort}
              sortable={sortable}
              onColumnSort={onColumnSort}
            />
          )}
          <Table.Body
            className={classNames({ striped })}
          >
            {editable && allowNewRows && (
              <AddRow
                id={id + '-AddRow'}
                beforeRowAdded={beforeRowAdded}
                columns={columns}
                context={context}
                labels={_labels}
                items={_items}
                setItems={setItems}
                onRowsChanged={onRowsChanged}
              />
            )}
            {pageItems.map((item, index) => (
              <Row
                editingRow={_editingRows[item.key]}
                setEditingRow={setEditingRow}
                resetEditingRow={resetEditingRow}
                item={item}
                items={items}
                index={index}
                context={context}
                columns={columns}
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
