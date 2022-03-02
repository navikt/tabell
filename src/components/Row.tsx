import { Table } from '@navikt/ds-react'
import classNames from 'classnames'
import { Item, Context, TableRowProps, ItemErrors } from '../index.d'
import _ from 'lodash'
import React, { useState } from 'react'
import FirstCell from './FirstCell'
import Cell from './Cell'

const Row = <CustomItem extends Item = Item, CustomContext extends Context = Context> ({
  beforeRowEdited = undefined,
  items,
  item,
  index,
  columns,
  context = {} as CustomContext,
  sort,
  labels,
  flaggable,
  editable,
  animatable,
  sortable,
  id,
  selectable,
  onRowClicked,
  onRowDoubleClicked,
  onRowsChanged,
  onRowSelectChange,
  setItems,
  subrowsIcon
}: TableRowProps<CustomItem, CustomContext>): JSX.Element => {

  const animationDelay = 0.01

  /** Store temp info for rows being edited. We can have multiple rows being edited, thus the hashmap */
  const [_editingRow, _setEditingRow] = useState<CustomItem | undefined>(undefined)

  /** handle any change made to cells in existing row */
  const handleEditRowChange = (entries: {[k in string]: any}): CustomItem => {
    const newEditingRow: CustomItem = _.cloneDeep(_editingRow) as CustomItem
    Object.keys(entries).forEach((e: string) => {
      // @ts-ignore
      newEditingRow[e] = entries[e]
    })
    _setEditingRow(newEditingRow)
    return newEditingRow
  }

  const saveEditedRow = (editedRow: CustomItem | undefined): void => {
    let allValidated: boolean = true
    const errors: ItemErrors = {}
    // if we have the editedRow changes, use it, or else, use the _editingRow version.
    const newEditingRow: CustomItem = !_.isUndefined(editedRow) ? editedRow : _.cloneDeep(_editingRow) as CustomItem

    columns.forEach((column) => {
      let isColumnValid: boolean = true
      let errorMessage: string | undefined

      column.edit?.validation?.forEach(v => {
        let valueToValidate = newEditingRow[column.id]

        if (_.isNil(valueToValidate)) {
          valueToValidate = ''
        }
        if (typeof valueToValidate === 'number') {
          valueToValidate = '' + valueToValidate
        }

        let willValidate: boolean = true
        if (!_.isNil(v.mandatory)) {
          if (_.isFunction(v.mandatory)) {
            willValidate = v.mandatory(context)
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
            if (column.type === 'date') {
              isThisValid = _.isDate(valueToValidate)
            } else {
              isThisValid = valueToValidate.match(v.test) !== null
            }
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
        errors[column.id] = errorMessage ?? labels.error
      }
    })

    if (!allValidated) {
      newEditingRow.error = errors
      _setEditingRow(newEditingRow)
      return
    }

    if (_.isFunction(beforeRowEdited)) {
      const isValid: boolean = beforeRowEdited(newEditingRow, context)
      if (!isValid) {
        _setEditingRow(newEditingRow)
        return
      }
    }

    delete newEditingRow.error

    const newEditedTransformedRow: CustomItem = _.cloneDeep(newEditingRow)
    columns.forEach((column) => {
      let text = newEditedTransformedRow[column.id]
      if (text && _.isFunction(column.edit?.transform)) {
        text = column.edit?.transform(text)
        // @ts-ignore
        newEditedTransformedRow[column.id] = text
      }
    })

    const newItems = items.map(_item => {
      if (_item.key === item.key) {
        return newEditedTransformedRow
      }
      return _item
    })

    setItems(newItems)

    _setEditingRow(undefined)

    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
  }

  /** Handle request for row deletion */
  const handleRowDeleted = (item: CustomItem) : void => {
    const newItems = _.filter(items, it => it.key !== item.key)
    setItems(newItems)
    if (_.isFunction(onRowsChanged)) {
      onRowsChanged(newItems)
    }
  }
  const editing = !_.isNil(_editingRow)
  const rowId = id + (editing ? '-edit' : '')
  return (
    <Table.Row
      id={rowId}
      aria-selected={selectable && item.selected === true}
      style={{ animationDelay: (animationDelay * index) + 's' }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        // single click
        if (e.detail === 1) {
          _.isFunction(onRowClicked) ? onRowClicked(item) : {}
        }
        // double click
        if (e.detail === 2) {
          _.isFunction(onRowDoubleClicked) ? onRowDoubleClicked(item) :
            editable && !item.disabled ? _setEditingRow(item) : {}
        }
      }}
      className={classNames({
        slideAnimate: animatable,
        tabell__edit: editing,
        clickable: _.isFunction(onRowClicked),
        'tabell__tr--valgt': selectable && item.selected,
        'tabell__tr--disabled': item.disabled
      })}
    >
      <FirstCell
        flaggable={flaggable}
        id={rowId + '-FirstCell'}
        item={item}
        items={items}
        labels={labels}
        selectable={selectable}
        sort={sort}
        subrowsIcon={subrowsIcon}
        setItems={setItems}
        onRowSelectChange={onRowSelectChange}
      />
      {columns.map((column) => (
        <Cell
          column={column}
          context={context}
          editingRow={_editingRow}
          setEditingRow={_setEditingRow}
          editable={editable}
          id={rowId + '-Cell-' + column.id}
          key={rowId + '-Cell-' + column.id + '-key'}
          item={item}
          labels={labels}
          sortable={sortable}
          sort={sort}
          handleEditRowChange={handleEditRowChange}
          handleRowDeleted={handleRowDeleted}
          saveEditedRow={saveEditedRow}
        />
      ))}
    </Table.Row>
  )

}

export default Row
