import { Bookmark } from '@navikt/ds-icons'
import { Checkbox, Table } from '@navikt/ds-react'
import { FlexCenterDiv } from '@navikt/hoykontrast'
import Tooltip from '@navikt/tooltip'
import { BlueText, FilterIcon } from 'components/Styles'
import _ from 'lodash'
import { Context, Item, TableHeaderProps } from '../index.d'
import React, { useState } from 'react'
import Filter from 'resources/Filter'
import HeaderCategories from './HeaderCategories'
import HeaderFilter from './HeaderFilter'

const Header = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  categories,
  columns,
  flaggable,
  flagIkon,
  filter,
  labels,
  selectable,
  searchable,
  sortable,
  showSelectAll,
  id,
  onRowSelectChange,
  items,
  setItems,
  setFilter,
 }: TableHeaderProps<CustomItem, CustomContext>) => {

  /** State of select all checkbox */
  const [_checkAll, _setCheckAll] = useState<boolean>(false)
  /** show/hide filter */
  const [_seeFilters, _setSeeFilters] = useState<boolean>(false)

  const _onCheckAllClicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    _setCheckAll(e.target.checked)

    const newItems: Array<CustomItem> = items?.map((item: CustomItem) => ({
      ...item,
      selected: (item.disabled || item.selectDisabled) ? false : e.target.checked
    })) || []

    setItems(newItems)
    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(_.filter(newItems,(item) => (item.selected && !item.hasSubrows)) as Array<CustomItem>)
    }
  }

  return (
    <Table.Header>
      {categories && (
        <HeaderCategories
          id={id}
          categories={categories}/>
        )}
      <Table.Row className='tabell__header'>
        <Table.ColumnHeader style={{ width: 1 }}>
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
        </Table.ColumnHeader>
        {columns.map((column) => {
          const _filter: string = filter[column.id] ? filter[column.id].toLowerCase() : ''
          return (
            <Table.ColumnHeader
              sortKey={column.id}
              sortable={column.type === "buttons" ? false : sortable}
            >
                {column.label + (_filter ? ' (' + _filter + ')' : '')}
            </Table.ColumnHeader>
          )
        })}
      </Table.Row>
      {_seeFilters && (
        <HeaderFilter
          id={id + '-Filter'}
          columns={columns}
          filter={filter}
          setFilter={setFilter}
        />
      )}
    </Table.Header>
  )
}

export default Header



