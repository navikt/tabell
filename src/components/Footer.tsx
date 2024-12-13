import {Pagination, BodyLong, HStack} from '@navikt/ds-react'
import { TableFooterProps } from '../index.d'
import React from 'react'

const Footer: React.FC<TableFooterProps> = ({
  id,
  labels,
  summary,
  selectable,
  pagination,
  loading,
  totalNumberOfItems,
  itemsPerPage = 10,
  currentPage,
  setCurrentPage,
  numberOfSelectedRows,
  numberOfVisibleItems
 }: TableFooterProps): JSX.Element => {

  /** label handlebars */
  const renderPlaceholders = (template: any, values: any) => {
    template = template.replace(/\{\{([^}]+)\}\}/g, (match: string) => {
      match = match.slice(2, -2)
      return values[match] || '{{' + match + '}}'
    })
    return template
  }

  const noOfPages = Math.ceil(numberOfVisibleItems / itemsPerPage)

  return (
    <HStack paddingBlock="4" justify="space-between" align="center" id={id}>
      {summary && !loading
        ? (
          <>
            {selectable
              ? (
                <BodyLong>
                  {numberOfSelectedRows === 0
                    ? renderPlaceholders(labels.noSelectedItems, { type: labels.type })
                    : renderPlaceholders(labels.xSelectedItems, {
                      type: labels.type,
                      x: numberOfSelectedRows
                    })}
                </BodyLong>
              )
              : (
                <div />
              )}
            <BodyLong>
              {numberOfVisibleItems === 0
                ? renderPlaceholders(labels.showNoItems, { type: labels.type })
                : renderPlaceholders(labels.showXofYItems, {
                  type: labels.type,
                  x: (((currentPage - 1) * itemsPerPage + 1) + '-' +
                    (currentPage * itemsPerPage > numberOfVisibleItems
                      ? numberOfVisibleItems
                      : currentPage * itemsPerPage)),
                  y: numberOfVisibleItems
                })}
            </BodyLong>
          </>
        )
        : (
          <>
            <div />
            <div />
          </>
        )}
      {pagination && !loading && (totalNumberOfItems ? totalNumberOfItems > itemsPerPage : true) && noOfPages > 0
        ? (
          <Pagination
            page={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
            count={noOfPages}
            size="small"
          />
        )
        : (
          <div />
        )}
    </HStack>
  )

}

export default Footer
