import { ArrowUndoIcon, TrashIcon, PencilIcon, FloppydiskIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, Popover, Table, Tooltip} from '@navikt/ds-react'
import { FlexStartDiv, HorizontalSeparatorDiv } from '@navikt/hoykontrast'
import Input from 'components/Input'
import { Context, CellProps, Item, Column } from '../index.d'
import _ from 'lodash'
import moment from 'moment'
import React, { useState } from 'react'

const Cell = <CustomItem extends Item = Item, CustomContext extends Context = Context>({
  column,
  context,
  editingRow,
  editable,
  handleEditRowChange,
  handleRowDeleted,
  saveEditedRow,
  item,
  id,
  labels,
  setEditingRow,
  resetEditingRow
}: CellProps<CustomItem, CustomContext>) => {

  const editing: boolean = !_.isNil(editingRow)
  const error = editing ? editingRow!.error : undefined
  let content: JSX.Element | undefined = undefined

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false)

  /** Renders the row as a date */
  const renderRowAsDate = (item: CustomItem, column: Column<CustomItem, CustomContext>, error: any, editing: boolean): JSX.Element | undefined => {
    const value: any = item[column.id]
    if (editing) {
      return _.isFunction(column.edit?.render)
        ? column.edit!.render({
          item: item,
          value: editingRow![column.id],
          values: editingRow!,
          error: error?.[column.id],
          context: context,
          setValues: handleEditRowChange,
          onEnter: (entries) => {
            const editedRow: CustomItem = handleEditRowChange(entries)
            saveEditedRow(editedRow, entries)
          }
        })
        : (
          <Input
            style={{marginTop: '0px'}}
            id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
            className='tabell__edit-input'
            error={error?.[column.id]}
            label='date'
            hideLabel
            placeholder={column.edit?.placeholder}
            value={moment(editingRow![column.id]).format('DD.MM.YYYY') ?? ''}
            onEnterPress={(newText: string) => {
              const entries = {
                [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
              }
              const editedRow: CustomItem = handleEditRowChange(entries)
              saveEditedRow(editedRow, entries)
            }}
            onChanged={(newText: string) => handleEditRowChange({
              [column.id]: moment(newText, 'DD.MM.YYYY').toDate()
            })}
          />
        )
    } else {
      return _.isFunction(column.render)
        ? column.render({item, value, context})
        : (
          <BodyLong>
            {column.dateFormat
              ? moment(value).format(column.dateFormat)
              : _.isFunction(value?.toLocaleDateString)
                ? value.toLocaleDateString()
                : value?.toString()}
          </BodyLong>
        )
    }
  }

  /** Renders the row as a object (needs custom render functions) */
  const renderRowAsObject = (item: CustomItem, column: Column<CustomItem, CustomContext>, error: any, editing: boolean): JSX.Element | undefined => {
    const value: any = item[column.id]
    if (editing) {
      return column.edit?.render
        ? column.edit.render({
          item: item,
          value: editingRow![column.id],
          values: editingRow!,
          error: error?.[column.id],
          context: context,
          setValues: handleEditRowChange,
          onEnter: (entries) => {
            const editedRow: CustomItem = handleEditRowChange(entries)
            saveEditedRow(editedRow, entries)
          }
        })
        : (<span>You have to set a edit render function for object</span>)
    } else {
      return _.isFunction(column.render)
        ? column.render({item, value, context})
        : <span>You have to set a render function for object</span>
    }
  }

  /** Renders the row buttons */
  const renderButtons = (item: CustomItem, editing: boolean): JSX.Element => {
    if (editing) {
      return (
        <FlexStartDiv className='tabell__buttons'>
          <Button
            variant="secondary"
            size="small"
            aria-label={labels.saveChanges}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              saveEditedRow()
            }}
          >
            <Tooltip content={labels.saveChanges!}>
              <FloppydiskIcon width='24' height='24'/>
            </Tooltip>
          </Button>
          <HorizontalSeparatorDiv size='0.5' />
          <Button
            variant="secondary"
            size="small"
            aria-label={labels.cancelChanges}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              resetEditingRow(item.key)
            }}
          >
            <Tooltip content={labels.cancelChanges!}>
              <ArrowUndoIcon width='24' height='24' />
            </Tooltip>
          </Button>
        </FlexStartDiv>
      )
    } else {
      return (
        <FlexStartDiv className='tabell__buttons'>
          <Button
            variant="secondary"
            size="small"
            aria-label={labels.edit}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setEditingRow(item)
            }}
          >
            <Tooltip content={labels.edit!}>
              <PencilIcon width='24' height='24'/>
            </Tooltip>
          </Button>
          <HorizontalSeparatorDiv size='0.5' />
          <Button
            variant="secondary"
            size="small"
            aria-label={labels.delete}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const answer = window.confirm(labels.areYouSure)
              if (answer) {
                handleRowDeleted(item)
              }
            }}
          >
            <Tooltip content={labels.delete!}>
              <TrashIcon width='24' height='24'/>
            </Tooltip>
          </Button>
        </FlexStartDiv>
      )
    }
  }

  /** Renders the row as default string */
  const renderRowAsDefault = (item: CustomItem, column: Column<CustomItem, CustomContext>, error: any, editing: boolean): JSX.Element | undefined => {

    if (editing) {
      return column.edit?.render
        ? column.edit.render({
          item: item,
          value: editingRow![column.id],
          values: editingRow!,
          error: error?.[column.id],
          context: context,
          setValues: handleEditRowChange,
          onEnter: (entries) => {
            const editedRow: CustomItem = handleEditRowChange(entries)
            saveEditedRow(editedRow, entries)
          }
        })
        : (
          <Input
            style={{marginTop: '0px'}}
            id={'tabell-' + id + '__item-' + item.key + '__column-' + column.id + '__edit-input'}
            className='tabell__edit-input'
            error={error && error[column.id]}
            label=''
            hideLabel
            placeholder={column.edit?.placeholder}
            value={editingRow![column.id] ?? ''}
            onEnterPress={(newText: string) => {
              const entries = { [column.id]: newText }
              const editedRow: CustomItem = handleEditRowChange(entries)
              saveEditedRow(editedRow, entries)
            }}
            onChanged={(newText: string) => handleEditRowChange({ [column.id]: newText })}
          />
        )
    } else {
      const value: any = item[column.id]
      return _.isFunction(column.render)
        ? column.render({item, value, context})
        : labels[column.id] && labels[column.id]![value]
          ? (
            <>
              <Popover
                anchorEl={document.getElementById(id)}
                onClose={() => setPopoverOpen(false)}
                open={popoverOpen}
                placement='top'
              >
                <BodyLong>{labels[column.id]![value]}</BodyLong>
              </Popover>
              <div
                id={'popover-' + item.key + '-' + column.id}
                style={{display: 'inline-block'}}
                onFocus={() => setPopoverOpen(true)}
                onBlur={() => setPopoverOpen(false)}
                onMouseOver={() => setPopoverOpen(true)}
                onMouseOut={() => setPopoverOpen(false)}
              >
                <BodyLong>{value}</BodyLong>
              </div>
            </>
          )
          : <BodyLong>{value}</BodyLong>
    }
  }

  switch (column.type) {
    case 'date':
      content = renderRowAsDate(item, column, error, editing)
      break
    case 'object':
      content = renderRowAsObject(item, column, error, editing)
      break
    case 'buttons':
      if (editable) {
        content = renderButtons(item, editing)
      }
      break
    default:
      content = renderRowAsDefault(item, column, error, editing)
      break
  }
  return (
    <Table.DataCell
      id={id}
      align={column.align}
    >
      {content}
    </Table.DataCell>
  )
}

export default Cell
