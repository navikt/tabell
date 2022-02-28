import { Table } from '@navikt/ds-react'
import classNames from 'classnames'
import { CenterTh } from 'components/Styles'
import { HeaderCategoriesProps, Category } from '../index.d'
import React from 'react'

const HeaderCategories: React.FC<HeaderCategoriesProps> = ({
  categories
}: HeaderCategoriesProps) => {

  return (
    <Table.Row>
      <Table.HeaderCell role='columnheader' className='noborder' />
      {categories.map((c: Category) => (
        <CenterTh key={c.label} colSpan={c.colSpan} className={classNames({ noborder: c.border === false })}>
          {c.label}
        </CenterTh>
      ))}
    </Table.Row>
  )
}

export default HeaderCategories
