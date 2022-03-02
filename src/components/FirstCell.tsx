import { Bookmark, CollapseFilled, ExpandFilled, NextFilled } from '@navikt/ds-icons'
import { Button, Checkbox, Table } from '@navikt/ds-react'
import { FlexCenterDiv, HorizontalSeparatorDiv } from '@navikt/hoykontrast'
import Tooltip from '@navikt/tooltip'
import _ from 'lodash'
import React from 'react'
import Connected from 'resources/Connected'
import Merge from 'resources/Merge'
import { Item, FirstCellProps } from '../index.d'

const FirstCell =  <CustomItem extends Item = Item> ({
  flaggable,
  item,
  items,
  labels,
  id,
  selectable,
  sort,
  subrowsIcon,
  setItems,
  onRowSelectChange
}: FirstCellProps<CustomItem>): JSX.Element => {

  /** selects one item */
  const onCheckClicked = (changedItem: CustomItem) => {
    const newItems: Array<CustomItem> = items?.map((item: CustomItem) => {
      if (item.key === changedItem.key) {
        item.selected = !item.selected
      }
      if (changedItem.hasSubrows && item.parentKey === changedItem.key) {
        item.selected = changedItem.selected
      }
      return item
    }) || []
    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
    setItems(newItems)
  }

  /** toggle visibility on rows that are from a subrow */
  const toggleSubRowOpen = (changedItem: CustomItem) => {
    const newItems: Array<CustomItem> = items?.map((item: CustomItem) => {
      if (changedItem.key === item.key) {
        item.openSubrows = !item.openSubrows
      }
      if (changedItem.key === item.parentKey) {
        item.visible = !item.visible
      }
      return item
    }) || []
    setItems(newItems)
  }

  return (
    <Table.DataCell
      id={id}
      style={{verticalAlign: 'middle'}}
      title={selectable && !item.selectDisabled ? (item.selectLabel ?? 'Velg ' + item.key) : ''}
    >
      <FlexCenterDiv>
        {flaggable
          ? (
            <Tooltip label={(item.flagLabel ?? labels.flagged)!}>
              {item.flagIkon ?? <Bookmark style={{width: '30px', height: '24px', visibility: item.flag ? 'inherit' : 'hidden' }} />}
            </Tooltip>
          )
          : null
        }
        {item.parentKey && (
          <div style={{marginRight: '2rem'}}>&nbsp;</div>
        )}
        {selectable && !item.selectDisabled && (
          <>
            <HorizontalSeparatorDiv size='0.3'/>
            <Checkbox
              id={id + '-Checkbox'}
              key={id + '-Checkbox-' + (!!item.selected) + '-key'}
              data-test-id={id + '-Checkbox'}
              disabled={item.disabled ?? false}
              hideLabel
              checked={!!item.selected}
              onChange={() => onCheckClicked(item)}
            >
            </Checkbox>
          </>
        )}
        {item.parentKey && (
          <>
            <HorizontalSeparatorDiv size='0.5'/>
            <Connected/>
            <HorizontalSeparatorDiv size='0.3'/>
          </>
        )}
        {item.hasSubrows && (
          <>
            <HorizontalSeparatorDiv size='0.3'/>
            <Button
              size="small"
              className='expandingButton'
              variant={item.openSubrows ? "primary" : "tertiary"}
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                toggleSubRowOpen(item)
              }}
            >
              {item.openSubrows
                ? subrowsIcon === 'merge'
                  ? <Merge/>
                  : sort.order === 'asc'
                    ? <ExpandFilled/>
                    : <CollapseFilled/>
                : subrowsIcon === 'merge'
                  ? (
                    <Tooltip label={labels.merged!}>
                      <Merge/>
                    </Tooltip>
                  )
                  : <NextFilled/>
              }
            </Button>
            <HorizontalSeparatorDiv size='0.3'/>
          </>
        )}
      </FlexCenterDiv>
    </Table.DataCell>
  )
}

export default FirstCell
