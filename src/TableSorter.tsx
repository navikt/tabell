import classNames from 'classnames'
import _ from 'lodash'
import PT from 'prop-types'
import React, { useEffect, useState } from 'react'
import Tooltip from 'rc-tooltip'
import { Checkbox, Input } from 'nav-frontend-skjema'
import Lenke from 'nav-frontend-lenker'
import { Normaltekst } from 'nav-frontend-typografi'
import Spinner from 'nav-frontend-spinner'
import View from './resources/View'
import Pagination from 'paginering'
import { Column, Item, Items, Sort, SortOrder, TableSorterProps } from './index.d'
import styled, { keyframes, ThemeProvider } from 'styled-components'
import { theme, themeHighContrast } from 'nav-styled-component-theme'
import md5 from 'md5'
import './index.css'
import 'rc-tooltip/assets/bootstrap_white.css'

const slideInFromLeft = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-20px);
}
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`

export const HighContrastLink = styled(Lenke)`
  display: flex;
  align-items: center;
  font-size: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'};
  line-height: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'};
  color: ${({ theme }: any) => theme['main-interactive-color']} !important;
`

export const TableSorterDiv = styled.div`
  display: block !important;
  * {
    font-size: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'};
    line-height: ${({ theme }: any) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'};
  }
  &.compact {
    td, th {
      padding: 0.35rem !important;
    }
    th a {
      margin: 0rem !important;
      padding: 0rem !important;
      padding-right: 0.7rem !important;
    }
    th a:before,
    th a:after {
      right: 0rem !important;
    }

    .c-tableSorter__filter .skjemaelement__input {
      padding: 0.25rem !important;
    }
  }

  tbody {
    tr:nth-child(odd) {
      background: ${({ theme }: any) => theme['main-background-color']};
    }
    tr:nth-child(even) {
      background: ${({ theme }: any) => theme['main-background-other-color']};   
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
    animation: ${slideInFromLeft} 0.2s forwards;
  }
  
  .tabell__tr--valgt td {
    background: ${({ theme }: any) => theme['main-interactive-color']} !important;
    color: ${({ theme }: any) => theme['main-background-color']} !important;
    * {
      color:  ${({ theme }: any) => theme['main-background-color']} !important;
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
const PaginationDiv = styled.div`
  display: flex; 
  flex-direction: row-reverse;
`
const FilterIcon = styled.div`
  margin-left: 0.5rem;
  cursor: pointer;
`
const TableSorter: React.FC<TableSorterProps> = ({
  animatable = true,
  className,
  compact = false,
  context,
  columns = [],
  highContrast = false,
  initialPage = 1,
  id,
  items = [],
  itemsPerPage = 10,
  labels = {},
  loading = false,
  onColumnSort,
  onRowSelectChange,
  pagination = true,
  searchable = true,
  selectable = false,
  sortable = true,
  sort = { column: '', order: 'none' }
}: TableSorterProps): JSX.Element => {
  const [_sort, setSort] = useState<Sort>(sort)
  const [_id] = useState<string>(id || md5('' + new Date().getTime()))
  const [_items, setItems] = useState<Items>(items)
  const [_columns, setColumns] = useState<Array<Column>>(columns)
  const [seeFilters, setSeeFilters] = useState<boolean>(false)
  const [checkAll, setCheckAll] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(initialPage)

  const sortOrder: {[k: string]: SortOrder} = {
    none: 'ascending',
    '': 'ascending',
    ascending: 'descending',
    descending: 'none'
  }
  const sortClasses: {[k in SortOrder]: string} = {
    ascending: 'tabell__th--sortert-asc',
    descending: 'tabell__th--sortert-desc',
    none: 'none'
  }

  useEffect(() => {
    if (!_.isEqual(
      items.map((e, i) => e.key || i),
      _items.map((e, i) => e.key || i)
    )) {
      setItems(items)
    }
  }, [items, _items])

  const sortColumn = (column: Column): void => {
    if (!sortable) { return }
    const newSortOrder = sortOrder[_sort.order]
    const newSort = { column: column.id, order: newSortOrder }
    setSort(newSort)
    if (onColumnSort) {
      onColumnSort(newSort)
    }
  }

  const sortClass = (column: Column): string => {
    if (!sortable) { return '' }
    return _sort.column === column.id ? sortClasses[_sort.order] : 'none'
  }

  const onCheckAllClicked = (): void => {
    const newItems: Items = _items.map(item => ({
      ...item,
      selected: !checkAll
    }))

    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems)
    }
    setCheckAll(!checkAll)
    setItems(newItems)
  }

  const onCheckClicked = (changedItem: Item) => {
    const newItems: Items = _items.map(item => ({
      ...item,
      selected: _.isEqual(changedItem, item) ? !item.selected : item.selected
    }))
    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems)
    }
    setItems(newItems)
  }

  const rawRows: () => Items = () => {
    const filteredItems: Items = _.filter(_items, (item) => {
      return _.every(_columns, (column) => {
        const filterText: string = _.isString(column.filterText) ? column.filterText.toLowerCase() : ''
        let regex
        try {
          regex = new RegExp(filterText)
        } catch (e) {
        }
        switch (column.type) {
          case 'date':
            return regex
              ? item[column.id].toLocaleDateString
                ? item[column.id].toLocaleDateString().match(regex)
                : item[column.id].toString().match(regex)
              : true
          default:
            return regex
              ? (column.needle && _.isString(column.needle(item[column.id]))
                ? column.needle(item[column.id]).toLowerCase().match(regex)
                : (_.isString(item[column.id]) ? item[column.id].toLowerCase().match(regex) : true)
              ) : true
        }
      })
    })

    const sortedItems: Items = _.sortBy(filteredItems, _sort.column)
    if (_sort.order === 'descending') {
      sortedItems.reverse()
    }
    return sortedItems
  }

  const rows = (items: Items) => {
    return items.filter((item, index) => {
      return pagination
        ? ((currentPage - 1) * itemsPerPage <= index && index < (currentPage * itemsPerPage))
        : true
    }).map((item, index) => {
      return (
        <tr
          key={item.key || index}
          aria-selected={selectable && item.selected === true}
          style={{ animationDelay: (0.04 * index) + 's' }}
          className={classNames({
            slideAnimate: animatable,
            'tabell__tr--valgt': selectable && item.selected
          })}
        >
          <td>
            {selectable && (
              <Checkbox
                id={'c-tableSorter__row-checkbox-id-' + item.key + '-' + _id}
                data-testid={'c-tableSorter__row-checkbox-id-' + item.key + '-' + _id}
                label={'Velg ' + item.key} checked={!!item.selected} onChange={() =>
                  onCheckClicked(item)}
              />
            )}
          </td>
          {_columns.map((column, index2) => {
            const value: any = item[column.id]
            switch (column.type) {
              case 'date':
                return (
                  <td key={index2} className={classNames({ 'tabell__td--sortert': sortable && _sort.column === column.id })}>
                    {_.isFunction(column.renderCell)
                      ? column.renderCell(item, value, context)
                      : <Normaltekst>{_.isFunction(value.toLocaleDateString) ? value.toLocaleDateString() : value.toString()}</Normaltekst>}
                  </td>
                )
              case 'object':
                return (
                  <td key={index2} className={classNames({ 'tabell__td--sortert': sortable && _sort.column === column.id })}>
                    {_.isFunction(column.renderCell)
                      ? column.renderCell(item, value, context)
                      : <Normaltekst>JSON.stringify(value)</Normaltekst>}
                  </td>
                )
              default:
                return (
                  <td key={index2} className={classNames({ 'tabell__td--sortert': sortable && _sort.column === column.id })}>
                    {_.isFunction(column.renderCell)
                      ? column.renderCell(item, value, context)
                      : (
                        <Normaltekst>
                          {labels[column.id] && labels[column.id][value] ? (
                            <Tooltip placement='top' trigger={['hover']} overlay={<span>{labels[column.id][value]}</span>}>
                              <span>{value}</span>
                            </Tooltip>
                          ) : <span>{value}</span>}
                        </Normaltekst>
                      )}
                  </td>
                )
            }
          })}
        </tr>
      )
    })
  }

  const handleFilterTextChange = (_column: Column, newValue: string): void => {
    setColumns(_columns.map((column) => {
      return _column.id === column.id ? {
        ...column,
        filterText: newValue
      } : column
    }))
  }

  const sortedItems = rawRows()
  const tableRows = rows(sortedItems)

  return (
    <ThemeProvider theme={highContrast ? themeHighContrast : theme}>
      <TableSorterDiv className={classNames('tabell', { compact: compact }, className)}>
        <ContentDiv>
          {loading ? (
            <LoadingDiv>
              <Spinner type='XL' />
            </LoadingDiv>
          ) : null}
          <WideTable cellSpacing='0' className='c-tableSorter__table'>
            <thead>
              <tr className='c-tableSorter__header'>
                <th style={{ width: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {selectable && (
                      <Checkbox
                        label='Velg alle'
                        id={'c-tableSorter__checkAll-checkbox-id-' + _id}
                        className='c-tableSorter__checkAll-checkbox'
                        checked={checkAll}
                        onChange={onCheckAllClicked}
                      />
                    )}
                    {searchable && (
                      <FilterIcon>
                        <View
                          className='c-tableSorter___seefilters-icon'
                          id='c-tableSorter__seefilters-icon-id'
                          onClick={() => setSeeFilters(!seeFilters)}
                        />
                      </FilterIcon>)}
                  </div>
                </th>
                {_columns.map((column) => {
                  const filterText: string = column.filterText ? column.filterText.toLowerCase() : ''
                  return (
                    <th
                      role='columnheader'
                      aria-sort='none'
                      key={column.id}
                      className={classNames('header', { [sortClass(column)]: column.label !== '' })}
                    >
                      {sortable && column.label ? (
                        <HighContrastLink
                          href='#'
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            sortColumn(column)
                          }}
                        >
                          {column.label + (filterText ? ' (' + filterText + ')' : '')}
                        </HighContrastLink>
                      ) : column.label + (filterText ? ' (' + filterText + ')' : '')}
                    </th>
                  )
                })}
              </tr>
              {seeFilters ? (
                <tr className='c-tableSorter__filter'>
                  <td />
                  {_columns.map((column) => {
                    return (
                      <td key={column.id}>
                        <Input
                          id={'c-tableSorter__sort-' + column.id + '-input-id'}
                          className='c-tableSorter__sort-input'
                          label=''
                          value={column.filterText || ''}
                          onChange={(e) => handleFilterTextChange(column, e.target.value)}
                        />
                      </td>
                    )
                  })}
                </tr>
              ) : null}
            </thead>
            <tbody>{tableRows}</tbody>
          </WideTable>
          {pagination && (
            <PaginationDiv>
              <Pagination
                highContrast={highContrast}
                itemsPerPage={itemsPerPage}
                initialPage={initialPage}
                numberOfItems={sortedItems.length}
                onChange={(page) => setCurrentPage(page)}
              />
            </PaginationDiv>
          )}
        </ContentDiv>
      </TableSorterDiv>
    </ThemeProvider>
  )
}

TableSorter.propTypes = {
  animatable: PT.bool,
  className: PT.string,
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
  sort: PT.oneOf<Sort>([])
}

export default TableSorter
