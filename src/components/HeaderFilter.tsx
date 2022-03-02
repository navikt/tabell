import { Table } from '@navikt/ds-react'
import Input from 'components/Input'
import { Column, Context, HeaderFilterProps, Item } from '../index.d'
import React from 'react'

const HeaderFilter = <CustomItem extends Item = Item, CustomContext extends Context = Context>  ({
  id,
  columns,
  setColumns
}: HeaderFilterProps<CustomItem, CustomContext>) => {

  /** Handle filter text updates */
  const handleFilterChange = (_column: Column<CustomItem, CustomContext>, newValue: string): void => {
    setColumns(columns.map((column: Column<CustomItem, CustomContext>) => {
      return _column.id === column.id
        ? {
          ...column,
          filterText: newValue
        }
        : column
    }))
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
            <Table.DataCell key={column.id}>
              <Input
                style={{marginTop: '0px'}}
                className='tabell__sort-input'
                id={id + '-Cell-' + column.id + '-Input'}
                key={id + '-Cell-' + column.id + '-Input-key'}
                label=''
                value={column.filterText || ''}
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
