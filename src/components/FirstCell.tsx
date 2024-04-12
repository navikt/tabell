import { BookmarkIcon, ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import { Button, Checkbox, Table, Tooltip } from '@navikt/ds-react'
import { FlexCenterDiv, HorizontalSeparatorDiv } from '@navikt/hoykontrast'
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
    setItems(newItems)
    if (_.isFunction(onRowSelectChange)) {
      onRowSelectChange(newItems.filter(item => item.selected && !item.hasSubrows))
    }
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
      <>
        {flaggable
            ? (
                <Table.DataCell
                    id={id+'-flag'}
                    title={(item.flagLabel ?? labels.flagged)!}
                >
                  <FlexCenterDiv>
                    <Tooltip content={(item.flagLabel ?? labels.flagged)!}>
                      {item.flagIkon ? <div>{item.flagIkon}</div>: <BookmarkIcon width="30" height="30 "style={{visibility: item.flag ? 'inherit' : 'hidden' }} />}
                    </Tooltip>
                  </FlexCenterDiv>
                </Table.DataCell>
              )
            :
            null
          }
        <Table.DataCell
          id={id}
          title={selectable && !item.selectDisabled ? (item.selectLabel ?? 'Velg ' + item.key) : ''}
        >
          <FlexCenterDiv>
            {selectable && !item.selectDisabled && (
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
            )}
            {item.parentKey && (
              <div style={{marginLeft: '2.5rem', marginRight: '0.3rem'}}>
                <Connected/>
              </div>
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
                      : sort && sort.direction !== 'ascending'
                        ? <ChevronDownIcon/>
                        : <ChevronUpIcon/>
                    : subrowsIcon === 'merge'
                      ? (
                        <Tooltip content={labels.merged!}>
                          <Merge/>
                        </Tooltip>
                      )
                      : <ChevronRightIcon/>
                  }
                </Button>
                <HorizontalSeparatorDiv size='0.3'/>
              </>
            )}
          </FlexCenterDiv>
        </Table.DataCell>
      </>
  )
}

export default FirstCell
