import classNames from 'classnames'
import _ from 'lodash'
import moment from 'moment'
import PT from 'prop-types'
import React, { useCallback, useEffect, useState } from 'react'
import Tooltip from 'rc-tooltip'
import { Checkbox, Input } from 'nav-frontend-skjema'
import Lenke from 'nav-frontend-lenker'
import { Normaltekst } from 'nav-frontend-typografi'
import Spinner from 'nav-frontend-spinner'
import View from './resources/View'
import Pagination from 'paginering'
import { Flatknapp } from 'nav-frontend-knapper'
import { Column, Item, Context, Labels, Sort, SortOrder, TableSorterProps } from './index.d'
import styled, { keyframes, ThemeProvider } from 'styled-components'
import { theme, themeKeys, themeHighContrast } from 'nav-styled-component-theme'
import defaultLabels from './TableSorter.labels'
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
  font-size: ${({ theme }) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'};
  line-height: ${({ theme }) => theme.type === 'themeHighContrast' ? '1.5rem' : 'inherit'};
  color: ${({ theme }) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]} !important;
`
export const HighContrastKnapp = styled(Flatknapp)`
  background-color: ${({ theme }) => theme.type === 'themeHighContrast' ? theme.black : 'inherit'};
  color: ${({ theme }) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]};
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme[themeKeys.MAIN_INTERACTIVE_COLOR]};
    color: ${({ theme }) => theme[themeKeys.MAIN_BACKGROUND_COLOR]};
  }
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
    animation: ${slideInFromLeft} 0.2s forwards;
  }
  
  .tabell__tr--disabled td {
    background: ${({ theme }: any) => theme[themeKeys.MAIN_DISABLED_COLOR]} !important;
    color: ${({ theme }: any) => theme[themeKeys.MAIN_BACKGROUND_COLOR]} !important;
    * {
      color:  ${({ theme }: any) => theme[themeKeys.MAIN_BACKGROUND_COLOR]} !important;
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
const FooterDiv = styled.div`
  display: flex; 
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`
const FilterIcon = styled.div`
  margin-left: 0.5rem;
  cursor: pointer;
`
const FlexDiv = styled.div`
  display: flex; 
  align-items: center;
`
const CenterTh = styled.th`
  text-align: center !important;
`

const TableSorter = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  animatable = true,
  categories,
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
  striped = true,
  summary = false,
  sort = { column: '', order: 'none' }
}: TableSorterProps<CustomItem, CustomContext>): JSX.Element => {
  const [_sort, setSort] = useState<Sort>(sort)
  const [_id] = useState<string>(id || md5('' + new Date().getTime()))
  const [_items, setItems] = useState<Array<CustomItem> |undefined>(undefined)
  const [_columns, setColumns] = useState<Array<Column<CustomItem, CustomContext>>>(columns)
  const [seeFilters, setSeeFilters] = useState<boolean>(false)
  const [checkAll, setCheckAll] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(initialPage)
  const _labels: Labels = { ...defaultLabels, ...labels }

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

  const preProcess = (items: Array<CustomItem>): Array<CustomItem> => {
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

  const renderPlaceholders = (template: any, values: any) => {
    template = template.replace(/\{\{([^}]+)\}\}/g, (match: string) => {
      match = match.slice(2, -2)
      return values[match] || '{{' + match + '}}'
    })
    return template
  }

  const _setItems = useCallback((items: Array<CustomItem>) => {
    setItems(preProcess(items))
  }, [])

  useEffect(() => {
    if (!_.isEqual(
      items.map((e: CustomItem, i: number) => e.key || i),
      _items?.map((e, i) => e.key || i)
    )) {
      _setItems(items)
    }
  }, [items, _setItems, _items])

  const sortColumn = (column: Column<CustomItem, CustomContext>): void => {
    if (!sortable) { return }
    const newSortOrder = sortOrder[_sort.order]
    const newSort = { column: column.id, order: newSortOrder }
    setSort(newSort)
    if (onColumnSort) {
      onColumnSort(newSort)
    }
  }

  const sortClass = (column: Column<CustomItem, CustomContext>): string => {
    if (!sortable) { return '' }
    return _sort.column === column.id ? sortClasses[_sort.order] : 'none'
  }

  const onCheckAllClicked = (): void => {
    const newItems: Array<CustomItem> = _items
      ? items.map((item: CustomItem) => ({
          ...item,
          selected: item.disabled ? false : !checkAll
        }))
      : []

    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
    setCheckAll(!checkAll)
    _setItems(newItems)
  }

  const toggleSubRowOpen = (changedItem: CustomItem) => {
    const newItems: Array<CustomItem> = _items!.map(item => {
      if (changedItem.key === item.key) {
        item.openSubrows = !item.openSubrows
      }
      if (changedItem.key === item.parentKey) {
        item.visible = !item.visible
      }
      return item
    })
    _setItems(newItems)
  }

  const onCheckClicked = (changedItem: CustomItem) => {
    const newItems: Array<CustomItem> = _items!.map(item => {
      if (item.key === changedItem.key) {
        item.selected = !item.selected
      }
      if (changedItem.hasSubrows && item.parentKey === changedItem.key) {
        item.selected = changedItem.selected
      }
      return item
    })
    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
    _setItems(newItems)
  }

  const rawRows: () => Array<CustomItem> = () => {
    const filteredItems: Array<CustomItem> = _.filter(_items, (item: CustomItem) => {
      return _.every(_columns, (column) => {
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
          default:
            return regex
              ? (column.needle && _.isString(column.needle(item[column.id]))
                  ? column.needle(item[column.id]).toLowerCase().match(regex)
                  : (_.isString(item[column.id]) ? item[column.id].toLowerCase().match(regex) : true)
                )
              : true
        }
      })
    })

    const sortedItems: Array<CustomItem> = _.sortBy(filteredItems, _sort.column)
    if (_sort.order === 'descending') {
      sortedItems.reverse()
    }
    return sortedItems
  }

  const numberOfSelectedRows = (items: Array<CustomItem>): number => {
    const selectedItems = items ? _.filter(items, (item: CustomItem) => item.selected && !item.hasSubrows) : []
    return selectedItems.length
  }

  const numberOfVisibleItems = (items: Array<CustomItem>): number => {
    const visibleItems = items ? _.filter(items, (item: CustomItem) => item.visible && !item.hasSubrows) : []
    return visibleItems.length
  }

  const rows = (items: Array<CustomItem>) => {
    return items
      .filter(item => item.visible)
      .filter((item, index) => {
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
              'tabell__tr--valgt': selectable && item.selected,
              'tabell__tr--disabled': item.disabled
            })}
          >
            <td>
              <FlexDiv>
                {item.parentKey && (
                  <div style={{ marginRight: '2rem' }}>&nbsp;</div>
                )}
                {selectable && (
                  <Checkbox
                    id={'c-tableSorter__row-checkbox-id-' + item.key + '-' + _id}
                    disabled={item.disabled || false}
                    data-testid={'c-tableSorter__row-checkbox-id-' + item.key + '-' + _id}
                    label={'Velg ' + item.key} checked={!!item.selected} onChange={() => {
                      onCheckClicked(item)
                    }}
                  />
                )}
                {item.hasSubrows && (
                  <HighContrastKnapp
                    mini kompakt onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      toggleSubRowOpen(item)
                    }}
                  >
                    {item.openSubrows ? '▼' : '►'}
                  </HighContrastKnapp>
                )}
              </FlexDiv>
            </td>
            {_columns.map((column, index2) => {
              const value: any = item[column.id]
              switch (column.type) {
                case 'date':
                  return (
                    <td
                      key={index2} className={classNames({
                        'tabell__td--sortert': sortable && _sort.column === column.id
                      })}
                    >
                      {_.isFunction(column.renderCell)
                        ? column.renderCell(item, value, context)
                        : (
                          <Normaltekst>
                            {column.dateFormat
                              ? moment(value).format(column.dateFormat)
                              : _.isFunction(value.toLocaleDateString)
                                ? value.toLocaleDateString()
                                : value.toString()}
                          </Normaltekst>
                          )}
                    </td>
                  )
                case 'object':
                  return (
                    <td
                      key={index2} className={classNames({
                        'tabell__td--sortert': sortable && _sort.column === column.id
                      })}
                    >
                      {_.isFunction(column.renderCell)
                        ? column.renderCell(item, value, context)
                        : <Normaltekst>JSON.stringify(value)</Normaltekst>}
                    </td>
                  )
                default:
                  return (
                    <td
                      key={index2} className={classNames({
                        'tabell__td--sortert': sortable && _sort.column === column.id
                      })}
                    >
                      {_.isFunction(column.renderCell)
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
                          )}
                    </td>
                  )
              }
            })}
          </tr>
        )
      })
  }

  const handleFilterTextChange = (_column: Column<CustomItem, CustomContext>, newValue: string): void => {
    setColumns(_columns.map((column) => {
      return _column.id === column.id
        ? {
            ...column,
            filterText: newValue
          }
        : column
    }))
  }

  const sortedItems = rawRows()
  const nrOfselectedRows = numberOfSelectedRows(sortedItems)
  const nrOfVisibleItems = numberOfVisibleItems(sortedItems)
  const tableRows = rows(sortedItems)

  return (
    <ThemeProvider theme={highContrast ? themeHighContrast : theme}>
      <TableSorterDiv className={classNames('tabell', { compact: compact }, className)}>
        <ContentDiv>
          {loading && (
            <LoadingDiv>
              <Spinner type='XL' />
            </LoadingDiv>
          )}
          <WideTable cellSpacing='0' className='c-tableSorter__table'>
            <thead>
              {categories && (
                <tr>
                  <th/>
                  {categories.map(c => <CenterTh colSpan={c.colSpan}>{c.label}</CenterTh>)}
                </tr>
              )}
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
                      {sortable && column.label
                        ? (
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
                          )
                        : column.label + (filterText ? ' (' + filterText + ')' : '')}
                    </th>
                  )
                })}
              </tr>
              {seeFilters
                ? (
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
                  )
                : null}
            </thead>
            <tbody
              className={classNames({ striped: striped })}
            >
              {tableRows}
            </tbody>
          </WideTable>
          <FooterDiv>
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
                        x: (((currentPage - 1) * itemsPerPage + 1) + '-' +
                        (currentPage * itemsPerPage > nrOfVisibleItems
                          ? nrOfVisibleItems
                          : currentPage * itemsPerPage)),
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
                  currentPage={currentPage}
                  numberOfItems={sortedItems.length}
                  onChange={(page) => setCurrentPage(page)}
                />
                )
              : (
                <div />
                )}
          </FooterDiv>
        </ContentDiv>
      </TableSorterDiv>
    </ThemeProvider>
  )
}

TableSorter.propTypes = {
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

export default TableSorter
