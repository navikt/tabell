import { Bookmark } from '@navikt/ds-icons'
import { Button, Checkbox, Table } from '@navikt/ds-react'
import { FlexCenterDiv } from '@navikt/hoykontrast'
import Tooltip from '@navikt/tooltip'
import classNames from 'classnames'
import { BlueText, FilterIcon } from 'components/Styles'
import _ from 'lodash'
import { Column, Context, Item, TableHeaderProps, SortOrder } from '../index.d'
import React, { useState } from 'react'
import Filter from 'resources/Filter'
import HeaderCategories from './HeaderCategories'
import HeaderFilter from './HeaderFilter'

const Header = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  categories,
  columns,
  setColumns,
  flaggable,
  flagIkon,
  labels,
  selectable,
  searchable,
  sortable,
  showSelectAll,
  id,
  onColumnSort,
  onRowSelectChange,
  items,
  setItems,
  sort,
  setSort
 }: TableHeaderProps<CustomItem, CustomContext>) => {

  /** State of select all checkbox */
  const [_checkAll, _setCheckAll] = useState<boolean>(false)
  /** show/hide filter */
  const [_seeFilters, _setSeeFilters] = useState<boolean>(false)

  const ariaSortLabel: any = {
    asc: 'ascending',
    desc: 'descending',
    none: 'none'
  }

  /** order on which sort switches over */
  const sortOrder: SortOrder = {
    none: 'asc',
    asc: 'desc',
    desc: 'asc'
  }

  /** get class for header sort */
  const sortClass = (column: Column<CustomItem, CustomContext>): string => {
    if (!sortable) { return ''}
    return sort.column === column.id ? 'tabell__th--sortert-' + sort.order : ''
  }

  /** get new rows with a sort change */
  const handleSortColumn = (column: Column<CustomItem, CustomContext>): void => {
    if (!sortable) { return }
    const newSortOrder = sortOrder[sort.order]
    const newSort = { column: column.id, order: newSortOrder }

    if (_.isFunction(onColumnSort)) {
      onColumnSort(newSort)
    }
    setSort(newSort)
  }

  const _onCheckAllClicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    _setCheckAll(e.target.checked)

    const newItems: Array<CustomItem> = items?.map((item: CustomItem) => ({
      ...item,
      selected: (item.disabled || item.selectDisabled) ? false : e.target.checked
    })) || []

    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(_.filter(newItems,(item) => (item.selected && !item.hasSubrows)) as Array<CustomItem>)
    }
    setItems(newItems)
  }

  return (
    <Table.Header>
      {categories && <HeaderCategories categories={categories}/>}
      <Table.Row className='tabell__header'>
        <Table.HeaderCell style={{ width: 1 }}>
          <FlexCenterDiv>
            {flaggable
              ? flagIkon ?? (
              <Tooltip label={labels.flagAll!}>
                <Bookmark style={{width: '30px', height: '24px' }} />
              </Tooltip>
            )
              : null
            }
            {selectable && (
              <div className='selectall'>
                {showSelectAll ? (
                  <Tooltip label={labels.selectAll!}>
                    <Checkbox
                      key={'tabell__checkAll-checkbox-id-' + id + showSelectAll}
                      hideLabel
                      id={'tabell__checkAll-checkbox-id-' + id}
                      className='tabell__checkAll-checkbox'
                      checked={_checkAll}
                      onChange={_onCheckAllClicked}
                    >
                      {labels.selectAllTitle}
                    </Checkbox>
                  </Tooltip>
                ) : (
                  <BlueText>{labels.selectAllTitle}</BlueText>
                )
                }
              </div>
            )}
            {searchable && (
              <Tooltip label={labels.filter!}>
                <FilterIcon
                  role='button'
                  aria-pressed={_seeFilters}
                  className='tabell___seefilters-icon'
                  id='tabell__seefilters-icon-id'
                  onClick={() => _setSeeFilters(!_seeFilters)}>
                  <Filter/>
                </FilterIcon>
              </Tooltip>
            )}
          </FlexCenterDiv>
        </Table.HeaderCell>
        {columns.map((column) => {
          const filterText: string = column.filterText ? column.filterText.toLowerCase() : ''
          return (
            <Table.HeaderCell
              role='columnheader'
              aria-sort={sort.column === column.id ? ariaSortLabel[sort.order] : 'none'}
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
        <HeaderFilter
          setColumns={setColumns}
          columns={columns}
        />
      )}
    </Table.Header>
  )
}

export default Header



