import { BookmarkIcon, ChevronUpIcon, ChevronDownIcon, ChevronRightIcon } from '@navikt/aksel-icons'
import {Box, Button, Checkbox, HStack, Table, Tooltip} from '@navikt/ds-react'
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

  const ButtonIcon = () => {
    if(item.openSubrows){
      if(subrowsIcon === 'merge'){
        return <Merge/>
      } else if (sort && sort.direction !== 'ascending') {
        return <ChevronDownIcon/>
      } else {
        return <ChevronUpIcon/>
      }
    } else {
      if(subrowsIcon === 'merge'){
        return <Merge/>
      } else {
        return <ChevronRightIcon/>
      }
    }
  }

  return (
      <>
        {flaggable
          ? (
              <Table.DataCell
                  id={id+'-flag'}
                  title={(item.flagLabel ?? labels.flagged)!}
              >
                <Tooltip content={(item.flagLabel ?? labels.flagged)!}>
                  {item.flagIkon ? <div>{item.flagIkon}</div>: <BookmarkIcon width="30" height="30 "style={{visibility: item.flag ? 'inherit' : 'hidden' }} />}
                </Tooltip>
              </Table.DataCell>
          )
          :
          null
        }
        <Table.DataCell
          id={id}
          title={selectable && !item.selectDisabled ? (item.selectLabel ?? 'Velg ' + item.key) : ''}
        >
          <HStack align={'center'} gap="1" wrap={false}>
            {selectable && !item.selectDiHSsabled && (
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
              <Button
                size="small"
                className='expandingButton'
                variant={item.openSubrows ? "primary" : "tertiary"}
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  toggleSubRowOpen(item)
                }}
                icon={<ButtonIcon/>}
              />
            )}
            {item.isMergedRow && !item.hasSubrows && (
              <Box
                paddingBlock="2 0"
                paddingInline="4 0"
              >
                <Merge/>
              </Box>
            )}
          </HStack>
        </Table.DataCell>
      </>
  )
}

export default FirstCell
