import { Table } from '@navikt/ds-react'
import classNames from 'classnames'
import { HeaderCategoriesProps, Category } from '../index.d'
import React from 'react'
import styles from './HeaderCategories.module.css'

const HeaderCategories: React.FC<HeaderCategoriesProps> = ({
  id,
  categories
}: HeaderCategoriesProps) => {

  return (
    <Table.Row>
      <Table.HeaderCell role='columnheader' className='noborder' />
      {categories.map((c: Category, index: number) => (
        <th
          id={id + '-Categories[' + index + ']-' + c.label}
          key={id + '-Categories[' + index + ']-' + c.label + '-key'}
          colSpan={c.colSpan}
          className={classNames(styles.CenterTh, { noborder: c.border === false })}
        >
          {c.label}
        </th>
      ))}
    </Table.Row>
  )
}

export default HeaderCategories
