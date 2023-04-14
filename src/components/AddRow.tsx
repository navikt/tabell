import { Button, Table } from '@navikt/ds-react'
import Tooltip from '@navikt/tooltip'
import Input from 'components/Input'
import _ from 'lodash'
import md5 from 'md5'
import { AddRowProps, Column, Context, Item, ItemErrors, NewRowValues } from '../index.d'
import React, { useState } from 'react'
import Save from 'resources/Save'
import classNames from 'classnames'
import {HorizontalSeparatorDiv, FlexStartDiv} from "@navikt/hoykontrast";
import {Cancel} from "@navikt/ds-icons";

const AddRow = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  beforeRowAdded,
  columns,
  context = {} as CustomContext,
  labels,
  id,
  items,
  setItems,
  onRowsChanged,
  showResetButtonAddRow
}: AddRowProps<CustomItem, CustomContext>): JSX.Element => {

  let addedFocusRef = false

  const resetRowValues = (columns: Array<Column<CustomItem, CustomContext>>) => {
    const newValues: any = {}
    columns.forEach((column: Column<CustomItem, CustomContext>) => {
      if (column.add && !_.isNil(column.add.defaultValue)) {
        newValues[column.id] = column.add.defaultValue
      }
    })
    return newValues
  }

  /** fill out default values when adding new rows */
  const [_newRowValues, setNewRowValues] = useState<NewRowValues>(() => resetRowValues(columns))

  const [_errors, setErrors] = useState<any>({})

  /** handle any change made to cells in the add row */
  const handleNewRowChange = (entries: {[k in string]: any}): NewRowValues => {
    const newRowValues = _.cloneDeep(_newRowValues)
    Object.keys(entries).forEach(key => {
      newRowValues[key] = entries[key]
    })
    setNewRowValues(newRowValues)
    return newRowValues
  }

  const resetAddRow = (columns: Array<Column<CustomItem, CustomContext>>, id: any) => {
    columns.forEach((column: Column<CustomItem, CustomContext>) => {
      if(column.add && column.add.reference){
        console.log(id, column.add.reference)
        const refName = Object.keys(column.add.reference)[0]
        column.add.reference[refName].current.value = ''
      }
    })
    setNewRowValues(resetRowValues(columns))
  }

  const saveAddedRow = (_context: CustomContext, newRowValues: NewRowValues): void => {
    // first, let's validate
    let allValidated: boolean = true

    let errors: ItemErrors = {}

    if (_.isFunction(beforeRowAdded)) {
      const errors: ItemErrors | undefined = beforeRowAdded(_newRowValues, _context)
      if (!_.isUndefined(errors)) {
        setErrors(errors)
        return
      }
    }

    columns.forEach((column) => {
      let isColumnValid: boolean = true
      let errorMessage: string | undefined = undefined

      column.add?.validation?.forEach(v => {
        let valueToValidate = newRowValues[column.id]
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

      if (!isColumnValid) {
        errors[column.id] = (errorMessage ?? labels.error)
      }
    })

    if (!allValidated) {
      setErrors(errors)
      return
    }

    // validated, we will add a new Item then
    setErrors({})
    setNewRowValues(resetRowValues(columns))
    const newItem: CustomItem = {} as CustomItem
    columns.forEach(column => {
      let text = newRowValues[column.id]
      if (text && _.isFunction(column.add?.transform)) {
        text = column.add?.transform(text)
      }
      _.set(newItem, column.id, text)
    })

    newItem.key = md5('' + new Date().getTime())
    newItem.selected = false
    newItem.disabled = false
    newItem.visible = true
    newItem.openSubrows = false

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
              className={classNames(column.align ?? '')}
              id={id + '-Column-' + column.id}
              key={id + '-Column-' + column.id + '-key'}
            >
              {
                column.add?.render
                  ? column.add.render({
                    value: _newRowValues[column.id],
                    error: _errors[column.id],
                    values: _newRowValues,
                    context: context,
                    setValues: handleNewRowChange,
                    onEnter: (entries) => {
                      const newRowValues: NewRowValues = handleNewRowChange(entries)
                      saveAddedRow(context, newRowValues)
                    }
                  })
                  : (
                    <Input
                      style={{marginTop: '0px'}}
                      id={id + '-Column-' + column.id + '-Input'}
                      className={'tabell__edit-input ' + (!addedFocusRef ? 'input-focus' : '')}
                      label=''
                      placeholder={column.add?.placeholder}
                      value={_newRowValues[column.id] ?? ''}
                      error={_errors[column.id]}
                      onEnterPress={(e: string) => {
                        const newRowValues: NewRowValues = handleNewRowChange({ [column.id]: e })
                        saveAddedRow(context, newRowValues)
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
              <FlexStartDiv className='tabell__buttons'>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={(e: any) => {
                    e.preventDefault()
                    e.stopPropagation()
                    saveAddedRow(context, _newRowValues)
                  }}
                >
                  <Tooltip label={labels.addLabel!}>
                    <Save/>
                  </Tooltip>
                </Button>
                {showResetButtonAddRow &&
                    <>
                      <HorizontalSeparatorDiv size='0.5'/>
                      <Button
                          variant="secondary"
                          size="small"
                          aria-label={labels.cancelChanges}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            resetAddRow(columns, id)
                          }}
                      >
                        <Tooltip label={labels.cancelChanges!}>
                          <Cancel width='24' height='24'/>
                        </Tooltip>
                      </Button>
                    </>
                }
              </FlexStartDiv>
            </Table.DataCell>
          )
        }
      })}
    </Table.Row>
  )
}

export default AddRow
