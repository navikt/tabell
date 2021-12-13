import React, { useEffect, useState } from 'react'
import Mustache from 'mustache'
import { Detail, Checkbox, Link, Select, BodyLong, Heading, Table } from '@navikt/ds-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import dark from 'react-syntax-highlighter/dist/esm/styles/prism/atom-dark'
import light from 'react-syntax-highlighter/dist/esm/styles/prism/prism'
import styled, { createGlobalStyle } from 'styled-components'
import NavHighContrast, { VerticalSeparatorDiv } from 'nav-hoykontrast'
import NavTable from 'components/Table'
import { Item } from 'index.d'
import '@navikt/ds-css'

SyntaxHighlighter.registerLanguage('jsx', jsx)

const PaddedDiv = styled.div`
  padding:3rem;
`
const HeaderDiv = styled.div`
 display: flex;
 flex-direction: row;
 justify-content: flex-end;
`
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    height: 100%;
    color: var(--navds-color-text-primary);
    background-color: var(--navds-semantic-color-canvas-background);
    line-height: 1.42857143;
    font-family: 'Source Sans Pro', Arial, sans-serif;
  }
`
const SmallDiv = styled.div`
  width: 33%;
  margin-right: 1rem;
`
const SmallSelect = styled(Select)`
  width: 33%;
  margin-right: 1rem;
`
const FlexDiv = styled.div`
  display: flex;
`
const MarginTable = styled(NavTable)`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;  
  width: 100%;
`

const Page: React.FC<any> = ({ highContrast }: any): JSX.Element => {

  const [_highContrast, _setHighContrast] = useState<boolean>(highContrast)
  const [loading, setLoading] = useState(false)
  const [animatable, setAnimatable] = useState(true)
  const [searchable, setSearchable] = useState(true)
  const [selectable, setSelectable] = useState(true)
  const [sortable, setSortable] = useState(true)
  const [striped, setStriped] = useState(true)
  const [summary, setSummary] = useState(true)
  const [compact, setCompact] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (!(highContrast === undefined || highContrast === null)) {
      _setHighContrast(highContrast)
    }
  }, [highContrast])

  return (
    <>
      <GlobalStyle />
      <NavHighContrast highContrast={_highContrast}>
      <PaddedDiv>
        {(highContrast === undefined || highContrast === null) && (
          <HeaderDiv>
            <Link
              id='highcontrast-link-id'
              href='#highContrast'
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                _setHighContrast(!_highContrast)
              }}
            >
              high contrast
            </Link>
          </HeaderDiv>
        )}
        <VerticalSeparatorDiv size='2'/>
        <Heading size="medium">
          Table Sorter
        </Heading>
        <VerticalSeparatorDiv size='2'/>
        <BodyLong>
          Table with sorting, searching, selecting capabilities
        </BodyLong>
        <VerticalSeparatorDiv size='2'/>
        <FlexDiv>
          <SmallDiv>
            <Checkbox checked={loading} onChange={() => setLoading(!loading)} >Toggle loading prop</Checkbox>
            <Checkbox checked={animatable} onChange={() => setAnimatable(!animatable)} >Toggle animation</Checkbox>
            <Checkbox checked={searchable} onChange={() => setSearchable(!searchable)} >Toggle searchable</Checkbox>
            <Checkbox checked={selectable} onChange={() => setSelectable(!selectable)} >Toggle selectable</Checkbox>
            <Checkbox checked={sortable} onChange={() => setSortable(!sortable)} >Toggle sortable</Checkbox>
            <Checkbox checked={striped} onChange={() => setStriped(!striped)} >Toggle striped</Checkbox>
            <Checkbox checked={summary} onChange={() => setSummary(!summary)} >Toggle summary</Checkbox>
            <Checkbox checked={compact} onChange={() => setCompact(!compact)} >Toggle compact</Checkbox>
          </SmallDiv>
          <SmallSelect
            label='Number of items per page'
            value={itemsPerPage}
            onChange={(e: any) => setItemsPerPage(parseInt(e.target.value, 10))}
          >
            <option>2</option>
            <option>5</option>
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </SmallSelect>
        </FlexDiv>
        <VerticalSeparatorDiv size='2'/>

        <MarginTable
          items={[
            { key: '01', name: 'Anna', date: new Date(1970, 2, 4), type: 'Analyst', selected: true },
            { key: '02', name: 'Bernard', date: new Date(1980, 4, 8), type: 'Bookkeeper', disabled: true },
            { key: '03', hasSubrows: true, openSubrows: false, name: 'Claire', date: new Date(1972, 6, 12), type: 'CEO' },
            { key: '03_01', parentKey: '03', name: 'Charles', date: new Date(1970, 2, 4), type: 'co-CEO', selected: true },
            { key: '03_02', parentKey: '03', name: 'Chad', date: new Date(1970, 2, 4), type: 'co-CEO', selected: false },
            { key: '03_03', parentKey: '03', name: 'Christine', date: new Date(1970, 2, 4), type: 'co-CEO', selected: false },
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
          highContrast={_highContrast}
          itemsPerPage={itemsPerPage}
          loading={loading}
          sort={{ column: 'name', order: 'asc' }}
          animatable={animatable}
          searchable={searchable}
          selectable={selectable}
          sortable={sortable}
          striped={striped}
          summary={summary}
          compact={compact}
          columns={[
            { id: 'name', label: 'Name', type: 'string', filterText: '' },
            { id: 'date', label: 'Date', type: 'date', filterText: '' },
            {
              id: 'type',
              label: 'Occupation',
              type: 'string',
              filterText: '',
              renderCell: (item: Item, value: any) => <Detail >{value}</Detail>
            }
          ]}
        />
        <VerticalSeparatorDiv size='2'/>

        <SyntaxHighlighter language='javascript' style={_highContrast ? dark : light}>
          {Mustache.render('<TableSorter\n' +
            '  items={[\n' +
            '    { key: \'01\', name: \'Anna\', date: new Date(1970, 2, 4), type: \'Analyst\' , selected: true },\n' +
            '     { key: \'02\', name: \'Bernard\', date: new Date(1980, 4, 8), type: \'Bookkeeper\', disabled: true },\n' +
            '     { key: \'03\', name: \'Claire\', date: new Date(1972, 6, 12), type: \'CEO\' },\n' +
            '     { key: \'03\', hasSubrows: true, openSubrows: false, name: \'Claire\', date: new Date(1972, 6, 12), type: \'CEO\' },\n' +
            '     { key: \'03_01\', parentKey: \'03\', name: \'Charles\', date: new Date(1970, 2, 4), type: \'co-CEO\', selected: true },\n' +
            '     { key: \'03_02\', parentKey: \'03\', name: \'Chad\', date: new Date(1970, 2, 4), type: \'co-CEO\', selected: false },\n' +
            '     { key: \'03_03\', parentKey: \'03\', name: \'Christine\', date: new Date(1970, 2, 4), type: \'co-CEO\', selected: false },\n' +
            '     { key: \'04\', name: \'Daniel\', date: new Date(1946, 2, 24), type: \'Developer\' },\n' +
            '     { key: \'05\', name: \'Emma\', date: new Date(1947, 7, 1), type: \'Economist\' , selected: true },\n' +
            '     { key: \'06\', name: \'Frank\', date: new Date(1978, 11, 14), type: \'Freelancer\' },\n' +
            '     { key: \'07\', name: \'Gwyneth\', date: new Date(1992, 1, 4), type: \'Geographer\' },\n' +
            '     { key: \'08\', name: \'Howard\', date: new Date(2001, 9, 19), type: \'HR head\' , disabled: true },\n' +
            '     { key: \'09\', name: \'Iva\', date: new Date(1925, 6, 12), type: \'Investor\' , selected: true },\n' +
            '     { key: \'10\', name: \'John\', date: new Date(1994, 3, 2), type: \'Journalist\' },\n' +
            '     { key: \'11\', name: \'Karen\', date: new Date(1999, 9, 22), type: \'Knowledge engineer\' },\n' +
            '     { key: \'12\', name: \'Leonard\', date: new Date(1991, 10, 26), type: \'Lawyer\' },\n' +
            '     { key: \'13\', name: \'Mary\', date: new Date(1962, 10, 25), type: \'Marketing\' },\n' +
            '     { key: \'14\', name: \'Neville\', date: new Date(1983, 1, 22), type: \'Nurse\' },\n' +
            '     { key: \'15\', name: \'Olivia\', date: new Date(1992, 7, 2), type: \'Operations manager\' , selected: true },\n' +
            '     { key: \'16\', name: \'Peter\', date: new Date(1927, 6, 13), type: \'Project manager\' },\n' +
            '     { key: \'17\', name: \'Quincey\', date: new Date(1965, 3, 11), type: \'Quality control\' },\n' +
            '     { key: \'18\', name: \'Ronald\', date: new Date(1982, 8, 18), type: \'Realtor\' , disabled: true },\n' +
            '     { key: \'19\', name: \'Sally\', date: new Date(1942, 8, 20), type: \'Sales manager\' },\n' +
            '     { key: \'20\', name: \'Ted\', date: new Date(1968, 3, 22), type: \'Tester\' },\n' +
            '     { key: \'21\', name: \'Uma\', date: new Date(1985, 9, 17), type: \'UI expert\' , selected: true },\n' +
            '     { key: \'22\', name: \'Victor\', date: new Date(2012, 12, 13), type: \'Video editor\' },\n' +
            '     { key: \'23\', name: \'Wanda\', date: new Date(1947, 2, 2), type: \'Web designer\', disabled: true  },\n' +
            '     { key: \'24\', name: \'Xavier\', date: new Date(1932, 7, 5), type: \'XML developer\' },\n' +
            '     { key: \'25\', name: \'Yvonne\', date: new Date(1993, 2, 28), type: \'Yoga instructor\' },\n' +
            '     { key: \'26\', name: \'Ziggy\', date: new Date(1929, 1, 14), type: \'Zoo keeper\' }\n' +
            '   ]}\n' +
            '   itemsPerPage={ {{itemsPerPage}} }\n' +
            '   loading={ {{loading}} }\n' +
            '   animatable={ {{animatable}} }\n' +
            '   searchable={ {{searchable}} }\n' +
            '   selectable={ {{selectable}} }\n' +
            '   sortable={ {{sortable}} }\n' +
            '   striped={ {{striped}} }\n' +
            '   summary={ {{summary}} }\n' +
            '   compact={ {{compact}} }\n' +
            '   sort={{ column: \'name\', order: \'ascending\' }}\n' +
            '   columns={[\n' +
            '     {id: \'name\', label: \'Name\', type: \'string\', filterText: \'\' },\n' +
            '     {id: \'date\', label: \'Date\', type: \'date\', filterText: \'\' },\n' +
            '     {id: \'type\', label: \'Occupation\', type: \'string\', filterText: \'\',\n' +
            '       renderCell: (item, value) => <EtikettLiten>{value}</EtikettLiten>\n' +
            '     }\n' +
            '   ]}' +
            '/>', {
            loading: loading,
            itemsPerPage: itemsPerPage,
            animatable: animatable,
            searchable: searchable,
            selectable: selectable,
            sortable: sortable,
            striped: striped,
            summary: summary,
            compact: compact
          })}
        </SyntaxHighlighter>
        <VerticalSeparatorDiv size='2'/>

        <Heading size="small">
          Component import
        </Heading>
        <VerticalSeparatorDiv size='2'/>
        <SyntaxHighlighter language='javascript' style={_highContrast ? dark : light}>
          {'import TableSorter from \'tabell\''}
        </SyntaxHighlighter>
        <VerticalSeparatorDiv size='2'/>

        <Heading size="small">
          React props
        </Heading>
        <VerticalSeparatorDiv size='2'/>
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Property</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Required</Table.HeaderCell>
              <Table.HeaderCell>Description</Table.HeaderCell>
              <Table.HeaderCell>Default</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.DataCell>animatable</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Animate rows</Table.DataCell>
              <Table.DataCell>true</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>className</Table.DataCell>
              <Table.DataCell><code>string</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Additional classnames</Table.DataCell>
              <Table.DataCell>-</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>compact</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Boolean for less padding on the cells (from 1rem to 0.35rem).</Table.DataCell>
              <Table.DataCell>-</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>context</Table.DataCell>
              <Table.DataCell><code>object</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Optional context params to be passed when adding callback functions to cell elements</Table.DataCell>
              <Table.DataCell>-</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>columns</Table.DataCell>
              <Table.DataCell><code>array</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>List with column data. Elements should be objects with keys <code>id</code>, <code>label</code>, <code>type</code>, <code>filterText</code>, <code>defaulsSortOrder</code></Table.DataCell>
              <Table.DataCell><code>[]</code></Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>highContrast</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>High contrast mode.</Table.DataCell>
              <Table.DataCell><code>false</code></Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>items</Table.DataCell>
              <Table.DataCell><code>array</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>List with row data. List elements should be objects where keys match a given column id.</Table.DataCell>
              <Table.DataCell><code>[]</code></Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>itemsPerPage</Table.DataCell>
              <Table.DataCell><code>number</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>If pagination is <code>true</code>, sets the number of items per page.</Table.DataCell>
              <Table.DataCell><code>10</code></Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>initialPage</Table.DataCell>
              <Table.DataCell><code>number</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>If pagination is true, set the initial page to be seen (default is 1)</Table.DataCell>
              <Table.DataCell><code>1</code></Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>labels</Table.DataCell>
              <Table.DataCell><code>object</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Translation object with labels, if you want to override the default labels.</Table.DataCell>
              <Table.DataCell>{}</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>loading</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Loading spinner, useful for lazy data fetch.</Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>onColumnSort</Table.DataCell>
              <Table.DataCell><code>function</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Callback function after sorting column is performed</Table.DataCell>
              <Table.DataCell>-</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>onRowSelectChange</Table.DataCell>
              <Table.DataCell><code>function</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Callback function when selection mode of at least one row changes. The table items are returned as param</Table.DataCell>
              <Table.DataCell>-</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>pagination</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Turns pagination on the table, to keep big tables in a manageable size.</Table.DataCell>
              <Table.DataCell>true</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>searchable</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Adds a search icon that allows row search fields to show</Table.DataCell>
              <Table.DataCell>true</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>selectable</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Renders a first column with checkboxes that trigger the <code>onRowSelectChange</code> callback function</Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>sortable</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Allow sortable table headers</Table.DataCell>
              <Table.DataCell>true</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>sort</Table.DataCell>
              <Table.DataCell><code>object</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Initial sorting information.</Table.DataCell>
              <Table.DataCell>{'{'} column: '', order: '' {'}'}</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>striped</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Use striped rows</Table.DataCell>
              <Table.DataCell>true</Table.DataCell>
            </Table.Row>
            <Table.Row>
              <Table.DataCell>summary</Table.DataCell>
              <Table.DataCell><code>boolean</code></Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
              <Table.DataCell>Displays a total selected elements and extended pagination info, if true</Table.DataCell>
              <Table.DataCell>false</Table.DataCell>
            </Table.Row>
          </Table.Body>
        </Table>
      </PaddedDiv>
    </NavHighContrast>
      </>
  )
}

export default Page
