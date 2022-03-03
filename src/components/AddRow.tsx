import { Button, Table } from '@navikt/ds-react'
import Tooltip from '@navikt/tooltip'
import Input from 'components/Input'
import _ from 'lodash'
import md5 from 'md5'
import { AddRowProps, Column, Context, Item } from '../index.d'
import React from 'react'
import Save from 'resources/Save'

const AddRow = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  beforeRowAdded,
  columns,
  setColumns,
  context = {} as CustomContext,
  labels,
  id,
  items,
  setItems,
  onRowsChanged
}: AddRowProps<CustomItem, CustomContext>): JSX.Element => {

  let addedFocusRef = false
  const currentEditValues = {} as any
  columns.forEach((c: Column<CustomItem, CustomContext>) => {
    if (c.edit) {
      currentEditValues[c.id] = c.edit.value
    }
  })

  /** handle any change made to cells in the add row */
  const handleNewRowChange = (entries: {[k in string]: any}): Array<Column<CustomItem, CustomContext>> => {
    const keys = Object.keys(entries)
    const newColumns = columns.map((column: Column<CustomItem, CustomContext>) => {
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
    setColumns(newColumns)
    return newColumns
  }

  const saveAddedRow = (_context: CustomContext, columns: Array<Column<CustomItem, CustomContext>>): void => {
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
            willValidate = v.mandatory(_context)
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
        error: (isColumnValid ? undefined : (errorMessage ?? labels.error))
      }
    })

    if (!allValidated) {
      setColumns(newColumns)
      return
    }

    if (_.isFunction(beforeRowAdded)) {
      const isValid: boolean = beforeRowAdded(newColumns, _context)
      if (!isValid) {
        setColumns(newColumns)
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

    setColumns(newColumns)

    const newItems = _.cloneDeep(items)
    newItems.unshift(newItem as CustomItem)
    setItems(newItems)
    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
    setTimeout(() => {
      (document?.querySelector('.input-focus input') as HTMLElement)?.focus()
    }, 100)
  }

  return (
    <Table.Row
      id={id}
      key={id + '-key'}
      className='tabell__edit'
    >
      <Table.DataCell />
      {columns.map((column: Column<CustomItem, CustomContext>) => {
        if (column.type !== 'buttons') {
          const content: JSX.Element = (
            <Table.DataCell
              id={id + '-Column-' + column.id}
              key={id + '-Column-' + column.id + '-key'}
            >
              {
                column.edit?.render
                  ? column.edit.render({
                    value: column.edit.value,
                    error: column.error,
                    values: currentEditValues,
                    context: context,
                    setValues: handleNewRowChange,
                    onEnter: (entries) => {
                      const newColumns: Array<Column<CustomItem, CustomContext>> = handleNewRowChange(entries)
                      saveAddedRow(context, newColumns)
                    }
                  })
                  : (
                    <Input
                      style={{marginTop: '0px'}}
                      id={id + '-Column-' + column.id + '-Input'}
                      className={'tabell__edit-input ' + (!addedFocusRef ? 'input-focus' : '')}
                      label=''
                      key={id + '-Column-' + column.id + '-Input-' + (column.edit?.value ?? '') + '-key'}
                      placeholder={column.edit?.placeholder}
                      value={column.edit?.value ?? ''}
                      error={column.error}
                      onEnterPress={(e: string) => {
                        const newColumns: Array<Column<CustomItem, CustomContext>> = handleNewRowChange({ [column.id]: e })
                        saveAddedRow(context, newColumns)
                      }}
                      onChanged={(e: string) => handleNewRowChange({ [column.id]: e })}
                    />
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
                size="small"
                variant="secondary"
                onClick={(e: any) => {
                  e.preventDefault()
                  e.stopPropagation()
                  saveAddedRow(context, columns)
                }}
              >
                <Tooltip label={labels.addLabel!}>
                  <Save/>
                </Tooltip>
              </Button>
            </Table.DataCell>
          )
        }
      })}
    </Table.Row>
  )
}

export default AddRow
