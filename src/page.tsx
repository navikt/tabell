import { theme, themeHighContrast } from 'nav-styled-component-theme'
import React, { useState } from 'react'
import { ThemeProvider } from 'styled-components'
import TableSorter from './TableSorter'
import './index.css'
const Page = () => {
  const [highContrast, setHighContrast] = useState<boolean>(false)
  return (
    <ThemeProvider theme={highContrast ? themeHighContrast : theme}>
      <a
        id='highcontrast-link-id'
        href='#highContrast'
        onClick={(e: any) => {
          e.preventDefault()
          e.stopPropagation()
          setHighContrast(!highContrast)
        }}
      >
        high contrast
      </a>
      <TableSorter
        items={[
          { key: '01', name: 'Anna', date: new Date(1970, 2, 4), type: 'Analyst', selected: true },
          { key: '02', name: 'Bernard', date: new Date(1980, 4, 8), type: 'Bookkeeper', disabled: true },
          { key: '03', hasSubrows: true, openSubrows: false, name: 'Claire', date: new Date(1972, 6, 12), type: 'CEO' },
          { key: '03_01', parentKey: '03', name: 'Claire 2', date: new Date(1970, 2, 4), type: 'CEO 2', selected: true },
          { key: '03_02', parentKey: '03', name: 'Claire 3', date: new Date(1970, 2, 4), type: 'CEO 3', selected: false },
          { key: '03_03', parentKey: '03', name: 'Claire 4', date: new Date(1970, 2, 4), type: 'CEO 4', selected: false },
          { key: '04', name: 'Daniel', date: new Date(1946, 2, 24), type: 'Developer' },
          { key: '05', name: 'Emma', date: new Date(1947, 7, 1), type: 'Economist', selected: true },
          { key: '06', name: 'Frank', date: new Date(1978, 11, 14), type: 'Freelancer' },
          { key: '07', name: 'Gwyneth', date: new Date(1992, 1, 4), type: 'Geographer' },
          { key: '08', name: 'Howard', date: new Date(2001, 9, 19), type: 'HR head', disabled: true },
          { key: '09', name: 'Iva', date: new Date(1925, 6, 12), type: 'Investor', selected: true },
          { key: '10', name: 'John', date: new Date(1994, 3, 2), type: 'Journalist' },
          { key: '11', name: 'Karen', date: new Date(1999, 9, 22), type: 'Knowledge engineer' },
          { key: '12', name: 'Leonard', date: new Date(1991, 10, 26), type: 'Lawyer' },
          { key: '13', name: 'Mary', date: new Date(1962, 10, 25), type: 'Marketing' },
          { key: '14', name: 'Neville', date: new Date(1983, 1, 22), type: 'Nurse' },
          { key: '15', name: 'Olivia', date: new Date(1992, 7, 2), type: 'Operations manager', selected: true },
          { key: '16', name: 'Peter', date: new Date(1927, 6, 13), type: 'Project manager' },
          { key: '17', name: 'Quincey', date: new Date(1965, 3, 11), type: 'Quality control' },
          { key: '18', name: 'Ronald', date: new Date(1982, 8, 18), type: 'Realtor', disabled: true },
          { key: '19', name: 'Sally', date: new Date(1942, 8, 20), type: 'Sales manager' },
          { key: '20', name: 'Ted', date: new Date(1968, 3, 22), type: 'Tester' },
          { key: '21', name: 'Uma', date: new Date(1985, 9, 17), type: 'UI expert', selected: true },
          { key: '22', name: 'Victor', date: new Date(2012, 12, 13), type: 'Video editor' },
          { key: '23', name: 'Wanda', date: new Date(1947, 2, 2), type: 'Web designer', disabled: true },
          { key: '24', name: 'Xavier', date: new Date(1932, 7, 5), type: 'XML developer' },
          { key: '25', name: 'Yvonne', date: new Date(1993, 2, 28), type: 'Yoga instructor' },
          { key: '26', name: 'Ziggy', date: new Date(1929, 1, 14), type: 'Zoo keeper' }
        ]}
        highContrast={highContrast}
        itemsPerPage={20}
        loading={false}
        sort={{ column: 'name', order: 'ascending' }}
        animatable
        searchable
        selectable
        summary
        sortable
        striped={false}
        compact
        labels={{
          type: 'oranges'
        }}
        categories={[{
          colSpan: 3,
          label: 'title'
        }]}
        columns={[
          { id: 'name', label: 'Name', type: 'string', filterText: '' },
          { id: 'date', label: 'Date', type: 'date', filterText: '', dateFormat: 'DD.MM.YYYY' },
          {
            id: 'type',
            label: 'Occupation',
            type: 'string',
            filterText: '',
            renderCell: (item: any, value: any) => <code>{value}</code>
          }
        ]}
      />
    </ThemeProvider>
  )
}

export default Page
