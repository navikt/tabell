import { BodyLong } from '@navikt/ds-react'
import { FlexCenterSpacedDiv } from '@navikt/hoykontrast'
import Pagination from '@navikt/paginering'
import { TableFooterProps } from '../index.d'
import React from 'react'

const Footer: React.FC<TableFooterProps> = ({
  id,
  labels,
  summary,
  selectable,
  pagination,
  loading,
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

  return (
    <FlexCenterSpacedDiv id={id} key={id + '-key'}>
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
      {pagination && !loading
        ? (
          <Pagination
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            numberOfItems={numberOfVisibleItems}
            onChange={(page) => setCurrentPage(page)}
          />
        )
        : (
          <div />
        )}
    </FlexCenterSpacedDiv>
  )

}

export default Footer
