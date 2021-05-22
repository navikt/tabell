import classNames from 'classnames'
import md5 from 'md5'
import 'nav-frontend-core/dist/main.css'
import 'nav-frontend-lenker-style/dist/main.css'
import { Select } from 'nav-frontend-skjema'
import 'nav-frontend-skjema-style/dist/main.css'
import 'nav-frontend-tabell-style/dist/main.css'
import 'nav-frontend-typografi-style/dist/main.css'
import NavHighContrast from 'nav-hoykontrast'
import React, { useState } from 'react'
import styled from 'styled-components'
import { RenderEditableOptions } from './index.d'
import Table from './Table'

const MarginDiv = styled.div`
  margin: 1rem;
`

const PageDiv = styled.div`
  padding: 2rem;
  background-color: white;
  color: black;
  &.highContrast {
    background-color: black;
    color: white;
  }
`
const Page = () => {
  const [highContrast, setHighContrast] = useState<boolean>(false)
  const items = [
    { key: '01', employee: 'ja', name: 'Anna', date: new Date(1970, 2, 4), type: 'Analyst', selected: true },
    { key: '02', employee: 'ja', name: 'Bernard', date: new Date(1980, 4, 8), type: 'Bookkeeper', disabled: true },
    { key: '03', employee: 'ja', hasSubrows: true, openSubrows: false, name: 'Claire', date: new Date(1972, 6, 12), type: 'CEO' },
    { key: '03_01', parentKey: '03', name: 'Claire 2', date: new Date(1970, 2, 4), type: 'CEO 2', selected: true },
    { key: '03_02', parentKey: '03', name: 'Claire 3', date: new Date(1970, 2, 4), type: 'CEO 3', selected: false },
    { key: '03_03', parentKey: '03', name: 'Claire 4', date: new Date(1970, 2, 4), type: 'CEO 4', selected: false },
    { key: '04', employee: 'ja', name: 'Daniel', date: new Date(1946, 2, 24), type: 'Developer' },
    { key: '05', employee: 'ja', name: 'Emma', date: new Date(1947, 7, 1), type: 'Economist', selected: true },
    { key: '06', employee: 'ja', name: 'Frank', date: new Date(1978, 11, 14), type: 'Freelancer' },
    { key: '07', employee: 'ja', name: 'Gwyneth', date: new Date(1992, 1, 4), type: 'Geographer' },
    { key: '08', employee: 'ja', name: 'Howard', date: new Date(2001, 9, 19), type: 'HR head', disabled: true },
    { key: '09', employee: 'ja', name: 'Iva', date: new Date(1925, 6, 12), type: 'Investor', selected: true },
    { key: '10', employee: 'ja', name: 'John', date: new Date(1994, 3, 2), type: 'Journalist' },
    { key: '11', employee: 'ja', name: 'Karen', date: new Date(1999, 9, 22), type: 'Knowledge engineer' },
    { key: '12', employee: 'ja', name: 'Leonard', date: new Date(1991, 10, 26), type: 'Lawyer' },
    { key: '13', employee: 'ja', name: 'Mary', date: new Date(1962, 10, 25), type: 'Marketing' },
    { key: '14', employee: 'ja', name: 'Neville', date: new Date(1983, 1, 22), type: 'Nurse' },
    { key: '15', employee: 'ja', name: 'Olivia', date: new Date(1992, 7, 2), type: 'Operations manager', selected: true },
    { key: '16', employee: 'ja', name: 'Peter', date: new Date(1927, 6, 13), type: 'Project manager' },
    { key: '17', employee: 'ja', name: 'Quincey', date: new Date(1965, 3, 11), type: 'Quality control' },
    { key: '18', employee: 'ja', name: 'Ronald', date: new Date(1982, 8, 18), type: 'Realtor', disabled: true },
    { key: '19', employee: 'ja', name: 'Sally', date: new Date(1942, 8, 20), type: 'Sales manager' },
    { key: '20', employee: 'ja', name: 'Ted', date: new Date(1968, 3, 22), type: 'Tester' },
    { key: '21', employee: 'ja', name: 'Uma', date: new Date(1985, 9, 17), type: 'UI expert', selected: true },
    { key: '22', employee: 'ja', name: 'Victor', date: new Date(2012, 12, 13), type: 'Video editor' },
    { key: '23', employee: 'ja', name: 'Wanda', date: new Date(1947, 2, 2), type: 'Web designer', disabled: true },
    { key: '24', employee: 'ja', name: 'Xavier', date: new Date(1932, 7, 5), type: 'XML developer' },
    { key: '25', employee: 'ja', name: 'Yvonne', date: new Date(1993, 2, 28), type: 'Yoga instructor' },
    { key: '26', employee: 'ja', name: 'Ziggy', date: new Date(1929, 1, 14), type: 'Zoo keeper' }
  ]

  const renderEmployeeEditable = ({
    value,
    feil,
    setValue
  }: RenderEditableOptions) => {
    return (
      <Select
        value={value}
        feil={feil}
        onChange={(e) => {
          console.log('setValue')
          setValue({
            employee: e.target.value
          })
        }}
      >
        <option />
        <option>ja</option>
        <option>nei</option>
      </Select>
    )
  }

  return (
    <>
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
      <NavHighContrast highContrast={highContrast}>
        <PageDiv className={classNames({ highContrast: highContrast })}>
          <MarginDiv>
            <Table
              key={md5(JSON.stringify(items))}
              items={items}
              highContrast={highContrast}
              context={{ items: items }}
              itemsPerPage={20}
              loading={false}
              sort={{ column: 'name', order: 'asc' }}
              animatable
              editable
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
                colSpan: 1,
                label: '',
                border: false
              }, {
                colSpan: 3,
                label: 'title'
              }]}
              onRowsChanged={(items) => {
                console.log('Rows changed: ' + JSON.stringify(items))
              }}
              columns={[
                {
                  id: 'name',
                  label: 'Name',
                  type: 'string',
                  filterText: '',
                  edit: {
                    validation: [{
                      test: '^.+$',
                      message: 'validation message'
                    }]
                  }
                },
                {
                  id: 'date',
                  label: 'Date',
                  type: 'date',
                  filterText: '',
                  dateFormat: 'DD.MM.YYYY',
                  edit: {
                    placeholder: 'DDMMÅÅÅÅ',
                    validation: [{
                      test: (value: any) => (Object.prototype.toString.call(value) === '[object Date]'),
                      message: 'Must be a date'
                    }]
                  }
                },
                {
                  id: 'type',
                  label: 'Occupation',
                  type: 'string',
                  filterText: '',
                  renderCell: (item: any, value: any) => <code>{value}</code>
                },
                {
                  id: 'employee',
                  label: 'Employee',
                  type: 'string',
                  edit: {
                    render: renderEmployeeEditable,
                    validation: [{
                      test: '^.+$',
                      message: 'validationMessage'
                    }]
                  }
                },
                {
                  id: 'buttons',
                  label: '',
                  type: 'buttons'
                }
              ]}
            />
          </MarginDiv>
        </PageDiv>
      </NavHighContrast>
    </>
  )
}

export default Page
