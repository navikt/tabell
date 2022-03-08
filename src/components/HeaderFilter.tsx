import { Table } from '@navikt/ds-react'
import classNames from 'classnames'
import Input from 'components/Input'
import { Column, Context, HeaderFilterProps, Item } from '../index.d'
import React from 'react'

const HeaderFilter = <CustomItem extends Item = Item, CustomContext extends Context = Context>  ({
  id,
  columns,
  filter,
  setFilter,
}: HeaderFilterProps<CustomItem, CustomContext>) => {

  /** Handle filter text updates */
  const handleFilterChange = (_column: Column<CustomItem, CustomContext>, newValue: string): void => {
    setFilter({
      ...filter,
      [_column.id]: newValue
    })
  }

  return (
    <Table.Row
      id={id}
      className='tabell__filter'
    >
      <Table.DataCell />
      {columns.map((column: Column<CustomItem, CustomContext>) => {
        if (column.type !== 'buttons') {
          return (
            <Table.DataCell key={column.id} className={classNames(column.align ?? '')} >
              <Input
                style={{marginTop: '0px'}}
                className='tabell__sort-input'
                id={id + '-Cell-' + column.id + '-Input'}
                label=''
                value={filter[column.id] || ''}
                onEnterPress={(e: string) => handleFilterChange(column, e)}
                onChanged={(e: string) => handleFilterChange(column, e)}
              />
            </Table.DataCell>
          )
        }
        return null
    })}
  </Table.Row>
  )
}

export default HeaderFilter
